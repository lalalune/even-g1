# Even G1 Node Library

This project provides a Node.js implementation of the Even G1 glasses BLE protocol. It mirrors the structure of the Python reference found in `context.txt`.

## Installation

```bash
npm install
```

## Building

```bash
npm run build
```

## Usage

```ts
import { GlassesManager, sendText } from 'even-g1-node';

const manager = new GlassesManager();
await manager.scanAndConnect();
await sendText(manager, 'Hello world');
```

## Tests

Unit tests are written with Vitest. Run them with:

```bash
npm test
```

Integration tests that require the actual glasses are located in `test/live`. Set `LIVE_TEST=1` to enable them:

```bash
LIVE_TEST=1 npm test
```

## Publishing

After building, publish the package to npm with:

```bash
npm publish
```

Ensure you are logged in with `npm login` and have permission to publish the package.

