# Puppet Process

A wrapper around the native subcommand execution apis of deno (later: bun, node) to easily automate cli processes from the outside.

Provides:

- Mode 1: Interactive Command execution

  - Create a {@link PuppetProcess} object, including the command to run
  - call {@link PuppetProcess.start} to spawn the command
  - send input to the command as Uint8Array or string via {@link PuppetProcess.std_in} WritableStream
  - receive output from the command as string via {@link PuppetProcess.std_out}, {@link PuppetProcess.std_err} or {@link PuppetProcess.std_all} ReadableStreams
  - for graceful exit: wait for the command to finish via {@link PuppetProcess.waitForExit}
    (for example: when sending an `exit` command to a shell)
  - for hard exit: kill the long-running command via {@link PuppetProcess.kill}

- Mode 2: One-Shot Command execution (same as Mode 1, but no need to kill the child process):
  - Create a {@link PuppetProcess} object, including the command to run
  - call {@link PuppetProcess.start} to spawn the command
  - receive output from the command as string via {@link PuppetProcess.std_out}, {@link PuppetProcess.std_err} or {@link PuppetProcess.std_all} ReadableStreams
  - wait for the command to finish via {@link PuppetProcess.waitForExit}

Example cli: `cat`

## Example - Run a one-shot cli (with Deno)

```typescript
import {simpleCallbackTarget} from '@codemonument/rx-webstreams';
import {assertEquals, assertExists, assertRejects} from '@std/assert';
import {PuppetProcess} from '@codemonument/puppet-process/deno';
import {delay} from '@std/async';

const process = new PuppetProcess({
	command: `cat`,
});

process.std_out.pipeTo(
	simpleCallbackTarget(chunk => {
		assertEquals(chunk, 'Hello, world!');
	})
);
const writer = process.std_in.getWriter();
writer.write('Hello, world!');

process.start();

await delay(50);
// close the writer explicitly to avoid dangling stdin stream after child process has finished
await writer.close();

// CAUTION: Some cli-tools, like "cat", will exit when the writer for stdin is closed,
// since this closing sends an EOF signal to the child process!
// SO: we only need to wait for exit here, instead of killing the process.
await process.waitForExit();
```

## Credits

- draw inspiration from [deno_simple_exec](https://github.com/codemonument/deno_simple_exec)

---

# Changelog

## 1.0.1 - 2024-10-22

- remove annoying debug log in `PuppetProcess` constructor

## 1.0.0 - 2024-10-22

- first stable release
- add optional `cwd` option to `PuppetProcess` constructor - changes the current working directory of the spawned process

## 0.1.2 - 2024-10-21

- add example for @codemonument/puppet-process/errors module

## 0.1.1 - 2024-10-21

- improved documentation, as suggested by jsr

## 0.1.0 - 2024-10-21 - initial release

Features:

- creating a puppet process with deno
- sending input to the process
- receiving output from the process
- waiting for the process to finish
- killing the process
