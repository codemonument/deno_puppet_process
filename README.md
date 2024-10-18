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

## Ideas

- draw inspiration from [deno_simple_exec](https://github.com/codemonument/deno_simple_exec)
