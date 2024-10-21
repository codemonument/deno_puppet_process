/**
 * @module errors
 *
 * This module contains custom error classes for the @codemonument/puppet-process package.
 *
 * @example
 * ```typescript
 * import { PuppetProcess } from "@codemonument/puppet-process/deno";
 * import { ChildProcessNotRunningError } from "@codemonument/puppet-process/errors";
 *
 * const process = new PuppetProcess({
 *     command: `echo "Hello, world!"`,
 * });
 *
 * try {
 *    await process.waitForExit();
 * } catch (error) {
 *   if (error instanceof ChildProcessNotRunningError) {
 *      console.error("The child process is not running.");
 *   }
 * }
 * ```
 */

/**
 * This error is thrown when a child process is not running, but an operation is attempted that requires the child process to be running.
 */
export class ChildProcessNotRunningError extends Error {
}
