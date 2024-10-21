# Puppet Process

A wrapper around the native subcommand execution apis of deno (later: bun, node) to easily automate cli processes from the outside.

Provides (planned):

- Mode 1: One-Shot Command execution

  - starts the command, returns a promise and waits for it to finish
  - returns all sort of information about the command (stdout, stderr, exit code, etc.)

- Mode 2:Interactive Command execution
- start a command and get some sort of "session" object to interact with it
- send input to the command
- receive output from the command as Uint8Array or string lines

Example cli: `sftp`

## Example (with Deno)

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
