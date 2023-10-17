/**
 * Web Serial Monitor module.
 * @module SerialMonitor
 */

/**
 * Class representing a serial connection through Web Serial API.
 * @extends EventTarget
 */
 class WebSerialMonitor extends EventTarget {

    // private members

    #byteMode = false;
    #byteHex = false;
    #parseLines = false;
    #port= null;
    #reader;
    #inputDone;
    #outputDone;
    #inputStream;
    #outputStream;   

    async #readLoop() {

        while (true) {
            try {
                const { value, done } = await this.#reader.read();

                if (value) {
                    const event = new CustomEvent("serial-data", { detail: value });
                    this.dispatchEvent(event);
                }
                if (done) {
                    console.log('[readLoop] DONE', done);
                    this.#reader.releaseLock();
                    break;
                }
            } catch(error) {
                const event = new CustomEvent("serial-error", { detail: error });
                this.dispatchEvent(event);
                break;
            }
        }
    }

    // public members

    /**
     * Create an SerialMonitor instance
     * @param {object} options - instance options.
     */
    constructor(options) {
        super();
    
        if(options) {
            if(options.mode === "byte") {
                this.#byteMode = true;
                if(options.hex)
                    this.#byteHex = true;
            } else if(options.parseLines)
                this.#parseLines = true;   
        }
    
        this.#port = null;
        this.#reader = null;
        this.#inputDone = null;
        this.#outputDone = null;
        this.#inputStream = null;
        this.#outputStream = null;   
    }

    /**
     * Get the mode of the SerialMonitor instance
     */
    get mode() {
        if(this.#byteMode)
            return "byte";
        else
            return "text";
    }

    /**
     * Connect to a serial device
     * @param {number} bauds - baud rate of the serial connection.
     */
    async connect(bauds) {
        if(this.#port != null) {
            const event = new CustomEvent("serial-error", { detail: "Close current connection first" });
            this.dispatchEvent(event);
            return Promise.reject(new Error("Close current connection first"));
        }

        const p = await navigator.serial.requestPort().catch((error) => {
            const event = new CustomEvent("serial-error", { detail: "No port selected" });
            this.dispatchEvent(event);
            return Promise.reject(new Error(error));
        });

        this.#port = p;

        await this.#port.open({baudRate: bauds}).then(() => {
            if(this.#byteMode) {
                if(this.#byteHex) {
                    this.#inputStream = this.#port.readable.pipeThrough(new TransformStream(new DecToHexTransformer()));
                    this.#reader = this.#inputStream.getReader();
                } else {
                    this.#reader = this.#port.readable.getReader();
                }    
            } else {
                // eslint-disable-next-line no-undef
                const decoder = new TextDecoderStream();
                this.#inputDone = this.#port.readable.pipeTo(decoder.writable);
                if(this.#parseLines)
                    this.#inputStream = decoder.readable.pipeThrough(new TransformStream(new LineBreakTransformer()));
                else
                    this.#inputStream = decoder.readable;
                this.#reader = this.#inputStream.getReader();
            }

            // eslint-disable-next-line no-undef
            const encoder = new TextEncoderStream();
            this.#outputDone = encoder.readable.pipeTo(this.#port.writable);
            this.#outputStream = encoder.writable;

            const event = new CustomEvent("serial-connected", { detail: "Serial port connected" });
            this.dispatchEvent(event);

            this.#readLoop();
            
        }).catch((error) => {
            const event = new CustomEvent("serial-error", { detail: error.message });
            this.dispatchEvent(event);
            return Promise.reject(error);
        });

        return "Serial port connected";
    }

    /**
     * Disconnect from a serial device
     */
    async disconnect() {
        if(this.#port == null)
            return;

        if(this.#reader) {
            await this.#reader.cancel().catch((error) => {
                console.log(error);
            });
            if(this.#inputDone) 
                await this.#inputDone.catch(() => {});
            this.#reader = null;
            this.#inputDone = null;
        }

        if (this.#outputStream) {
            await this.#outputStream.getWriter().close().catch((error) => {
                console.log(error);
            });
            await this.#outputDone.catch((error) => {
                console.log(error);
            });
            this.#outputStream = null;
            this.#outputDone = null;
        }

        await this.#port.close().catch((error) => {
            const event = new CustomEvent("serial-error", { detail: error.message });
            this.dispatchEvent(event);
            return Promise.reject(error);
        });
        this.#port = null;

        const event = new CustomEvent("serial-disconnected", { detail: "Serial port disconnected" });
        this.dispatchEvent(event);
        return "Serial port disconnected";
    }

    /**
     * Send data to a serial device
     * @param {string} data - data string to send.
     */
    send(data) {
        if(this.#port != null) {
            const writer = this.#outputStream.getWriter();
            writer.write(data);
            writer.releaseLock();
        }
        else {
            const event = new CustomEvent("serial-error", { detail: "No serial port" });
            this.dispatchEvent(event);
        }
    }

}

// TransformStream to parse the stream into lines.
class LineBreakTransformer {
    constructor() {
      this.container = '';
    }
  
    transform(chunk, controller) {
        this.container += chunk;
        const lines = this.container.split('\n');
        this.container = lines.pop();
        lines.forEach(line => controller.enqueue(line));
    }
  
    flush(controller) {
        controller.enqueue(this.container);
    }
}

// TransformStream to parse the stream into hex bytes values.
class DecToHexTransformer {
    constructor() {
        this.container = '';
    }

    transform(chunk, controller) {
        this.container += chunk;
        const bytes = this.container.split(',');
        bytes.forEach(byte => {
            const number = parseInt(byte);
            if(number <= 15)
                controller.enqueue(number.toString(16).padStart(2, '0') + ' ');
            else
                controller.enqueue(number.toString(16) + ' ');
        });
    }

    flush(controller) {
        controller.enqueue(Number(this.container).toString(16) + ' ');
    }
}

export default WebSerialMonitor;
