/**
 * @module shared
 *
 * This module contains shared types and utilities for the @codemonument/puppet-process package.
 *
 * ## Example Usage
 *
 * Init a PuppetProcess instance with a custom logger:
 *
 * ```typescript
 * import { PuppetProcess } from "@codemonument/puppet-process/deno";
 * import type { GenericLogger } from "@codemonument/puppet-process";
 *
 * const logger: GenericLogger = {
 *   log: (message: string, ...metadata: unknown[]) => {
 *       console.log(message, ...metadata);
 *   },
 *   info: (message: string, ...metadata: unknown[]) => {
 *      console.info(message, ...metadata);
 *   },
 *   debug: (message: string, ...metadata: unknown[]) => {
 *      console.debug(message, ...metadata);
 *   },
 *   warn: (message: string, ...metadata: unknown[]) => {
 *      console.warn(message, ...metadata);
 *   },
 *   error: (message: string, ...metadata: unknown[]) => {
 *     console.error(message, ...metadata);
 *   },
 * };
 *
 * const process = new PuppetProcess({
 *   command: `echo "Hello, world!"`,
 *   logger,
 * });
 */

export { type GenericLogger } from "./GenericLogger.type.ts";
export { type PuppetProcessOptions } from "./PuppetProcessOptions.type.ts";
