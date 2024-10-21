/**
 * @module deno
 *
 * This module contains the Deno-specific implementation of the PuppetProcess class.
 *
 * ## Example Usage
 *
 * > [!IMPORTANT]
 * > Close the `writer` variable explicitly to avoid dangling stdin stream after child process has finished
 *
 * > [!IMPORTANT]
 * > Some cli-tools, like "cat", will exit when the writer for stdin is closed,
 * > since it's closing sends an EOF signal to the child process!
 * > So we only need process.waitForExit() here, instead of process.kill().
 *
 * @example
 * ```typescript
 * import { PuppetProcess } from "@codemonument/puppet-process/deno";
 * import { assertRejects } from "@std/assert";
 * import { delay } from "@std/async";
 * const process = new PuppetProcess({
 * 	command: `cat`,
 * });
 *
 * process.std_out.pipeTo(
 * 	simpleCallbackTarget(chunk => {
 * 		assertEquals(chunk, 'Hello, world!');
 * 	})
 * );
 * const writer = process.std_in.getWriter();
 * writer.write('Hello, world!');
 *
 * process.start();
 *
 * await delay(50);
 * await writer.close();
 *
 * await process.waitForExit();
 */

export { PuppetProcess } from "./puppet_process.ts";
