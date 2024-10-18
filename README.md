# Puppet Process

A wrapper around the native subcommand execution apis of deno (later: bun, node) to easily automate cli processes from the outside.

Provides (planned):

- start a command and get some sort of "session" object to interact with it
- send input to the command
- receive output from the command as Uint8Array or string lines

Example cli: `sftp`
