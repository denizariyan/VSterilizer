# VSterilizer

![node.js](https://github.com/denizariyan/VSterilizer/actions/workflows/node.js.yml/badge.svg)

VSterilizer is a USB scanning service that scans any USB device plugged into the computer that is running the scanner utility and reports the results through API endpoints.

## Installation and Usage

This installation steps assume that you are running Fedora 35. There could be slight changes to the shell commands if you are running another distro but the steps in general will be the same.

### 1. Use the package manager dnf to install NodeJS

```bash
sudo dnf install nodejs
```

### 2. Clone the repo

```bash
git clone https://github.com/denizariyan/VSterilizer.git
```

### 3. Install the dependencies

```bash
npm install
```

## Usage

1. Run the main script using

```bash
sudo node main.js
```

2. After running the script you will get a response similar to the one below mentioning that both the the scanner utility and the API listener utility is running.

```bash
Started to monitor for USB inserts!
Listening on port 8080!
```

3. Plug a USB device to the computer.
4. The script will detect the newly plugged in USB device and start scanning it immediately and send a status message to the API endpoint that it is accessing a new USB device. Example API call below.

```bash
{
  args: {},
  data: '{"status":"Accessing the USB Device..."}',
  files: {},
  form: {},
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Length': '40',
    'Content-Type': 'application/json',
    Host: 'httpbin.org',
    'User-Agent': 'axios/0.26.1',
    'X-Amzn-Trace-Id': 'Root=1-626fcfec-21c50ae55f9e79a838a867aa'
  },
  json: { status: 'Accessing the USB Device...' },
  origin: '<SENDER_IP_ADDRESS>',
  url: 'http://httpbin.org/post'
}
```

5. After the scanning is complete a result message will be sent to the API endpoint.

### For clean USB devices

```bash
{
  args: {},
  data: '{"status":"Scan completed, no infected files has been detected."}',
  files: {},
  form: {},
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Length': '65',
    'Content-Type': 'application/json',
    Host: 'httpbin.org',
    'User-Agent': 'axios/0.26.1',
    'X-Amzn-Trace-Id': 'Root=1-626fcff2-39b0b20222be8fd42873f046'
  },
  json: { status: 'Scan completed, no infected files has been detected.' },
  origin: '<SENDER_IP_ADDRESS>',
  url: 'http://httpbin.org/post'
}
```

### For USB devices with infected files

First a status message that mentions that the USB device is infected will be sent.

```bash
{
  args: {},
  data: '{"status":"Scan completed, check infected file list!"}',
  files: {},
  form: {},
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Length': '54',
    'Content-Type': 'application/json',
    Host: 'httpbin.org',
    'User-Agent': 'axios/0.26.1',
    'X-Amzn-Trace-Id': 'Root=1-626fd172-2951bf061e93fc434ad08ce5'
  },
  json: { status: 'Scan completed, check infected file list!' },
  origin: '<SENDER_IP_ADDRESS>',
  url: 'http://httpbin.org/post'
}
```

After that a result message that includes the details of the infected file(s) will be sent.

```bash
{
  args: {},
  data: '{"badFile":"eicar.com","virus":"Win.Test.EICAR_HDB-1"}',
  files: {},
  form: {},
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Length': '54',
    'Content-Type': 'application/json',
    Host: 'httpbin.org',
    'User-Agent': 'axios/0.26.1',
    'X-Amzn-Trace-Id': 'Root=1-626fd172-2de80c305bd1bb492dd73e42'
  },
  json: { badFile: 'eicar.com', virus: 'Win.Test.EICAR_HDB-1' },
  origin: '<SENDER_IP_ADDRESS>',
  url: 'http://httpbin.org/post'
}
```

## Testing

This will run all automated tests and report back the results.

```bash
npm test
```

Example test result

```bash
$ npm test

> vsterilizer@1.0.0 test /home/deari/projects/VSterilizer
> jest --silent=true

 PASS  tests/config.test.js
 PASS  tests/scan.test.js

Test Suites: 2 passed, 2 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        0.928 s, estimated 1 s
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://github.com/denizariyan/VSterilizer/blob/master/LICENSE)
