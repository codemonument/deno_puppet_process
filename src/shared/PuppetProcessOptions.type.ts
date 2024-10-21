import type { GenericLogger } from "./GenericLogger.type.ts";

export type PuppetProcessOptions = {
    /**
     * The command which should be run as {@link PuppetProcess}.
     * - Format: Space-Delimited String: `echo "Hello, world!"`
     * - params for the command can be interpolated by using `${param}` and passing the resulting string to {@link PuppetProcess}.
     *   Example: `echo "Hello, ${name}!"`
     */
    command: string;

    /**
     * An optional instance of a logger.
     * If not provided, the default logger will be `console`.
     * Can be used to pipe log messages to a custom logger.
     */
    logger?: GenericLogger;
};
