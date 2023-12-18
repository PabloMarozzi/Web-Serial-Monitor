export default WebSerialMonitor;
/**
 * Web Serial Monitor module.
 * @module SerialMonitor
 */
/**
 * Class representing a serial connection through Web Serial API.
 * @extends EventTarget
 */
declare class WebSerialMonitor extends EventTarget {
    /**
     * Create an SerialMonitor instance
     * @param {object} options - instance options.
     */
    constructor(options: object);
    /**
     * Get the mode of the SerialMonitor instance
     */
    get mode(): "text" | "byte";
    /**
     * Connect to a serial device
     * @param {number} bauds - baud rate of the serial connection.
     */
    connect(bauds: number): Promise<void>;
    /**
     * Disconnect from a serial device
     */
    disconnect(): Promise<void>;
    /**
     * Send data to a serial device
     * @param {string} data - data string to send.
     */
    send(data: string): void;
    #private;
}
