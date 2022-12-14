# WebSerialMonitor

JavaScript library to interact with serial devices using the Web Serial API in the browser.
The library allow to send data and receive data in text or binary modes.

**Please note** that this library requires the WebSerial browser API. Check https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API for browser compatibility.

* [Installation](#installation)
* [Usage](#usage)
* [Test](#test)
* [License](#license)

## Installation

Use npm to install this library in a nodejs project:
```bash
npm install web-serial-monitor
```

## Usage

Init in text mode (defaut)
```js
import SerialMonitor from 'web-serial-monitor';

const serial = new SerialMonitor({mode: "text"});
```

Init in text mode with line parser (line break: '\n')
```js
import SerialMonitor from 'web-serial-monitor';

const serial = new SerialMonitor({mode: "text", parseLines: true});
```

Init in binary mode
```js
import SerialMonitor from 'web-serial-monitor';

const serial = new SerialMonitor({mode: "byte", hex: true});
```

Connect to a device
```js
// serial is an instance of a extended EventTarget class
// you can listen to events emited by it.
const handleSerialEvent = (ev) => {
    console.log(ev.detail);
}
serial.addEventListener('serial-connected', handleSerialEvent);

serial.addEventListener('serial-disconnected', handleSerialEvent);

serial.addEventListener('serial-error', handleSerialEvent);

serial.addEventListener('serial-data', handleSerialEvent);

// This will open a browser dialog which prompts the user to select a serial device.
// If no device is selected, then a serial-error event is fired.
serial.connect(57600).then(() => { // connect at 57600 bauds rate.
	serial.send("Hello serial\n");
}).catch(() => {
	console.log("Something went wrong...");
}); 

serial.disconnect();
```

## Test

This test use a simple node web server to load the library directly into the browser, no module bundler needed.
```bash
npm run test
```

## License

The project is licensed under the [GNU General Public License v3 (GPL-3)](https://tldrlegal.com/license/gnu-general-public-license-v3-(gpl-3))