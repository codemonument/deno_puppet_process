import type { GenericLogger } from "../shared/GenericLogger.type.ts";
import { simpleCallbackTarget } from "@codemonument/rx-webstreams";

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

/**
 * This class is used to spawn a new process and interact with it.
 * It is NOT inteded to run child processes one-time, but rather to keep them running and interact with them.
 * (At least for now, maybe I'll add this functionality later.)
 */
export class PuppetProcess {
    private options: PuppetProcessOptions;
    private logger: GenericLogger;
    private textEncoder = new TextEncoder();

    // Runtime Props
    private cmd: Deno.Command;
    private child?: Deno.ChildProcess;
    private std_in_transform = new TransformStream<
        string | Uint8Array,
        Uint8Array
    >({
        start: (_controller) => {
        },
        transform: (chunk, controller) => {
            if (typeof chunk === "string") {
                controller.enqueue(this.textEncoder.encode(chunk));
            } else {
                controller.enqueue(chunk);
            }
        },
    });

    // Public Props
    /**
     * The output stream of the child process.
     */
    public readonly std_out = new ReadableStream();
    public readonly std_err = new ReadableStream();
    public readonly std_all = new ReadableStream();

    /**
     * A stream that gets written to the child process's stdin.
     * If the child process is not running, the data will be buffered until the child process starts.
     * The buffer size is not known right now.
     * It accepts as inputs:
     * - `string` (will be encoded as utf8 to `Uint8Array` using `TextEncoder`)
     * - `Uint8Array` (will be passed through as is)
     */
    public readonly std_in = this.std_in_transform.writable;

    constructor(options: PuppetProcessOptions) {
        this.options = options;
        this.logger = options.logger ?? console as GenericLogger;
        this.logger.log("PuppetProcess created with options:", options);

        const [executable, ...args] = options.command.split(" ");
        const cmd = new Deno.Command(executable, {
            args,
            stdout: "piped",
            stderr: "piped",
        });
        this.cmd = cmd;
    }

    start() {
        this.child = this.cmd.spawn();

        this.std_in_transform.readable.pipeTo(simpleCallbackTarget((chunk) => {
            this.logger.log(`stdin: ${chunk}`);
        }));
    }

    async waitForExit(): Promise<void> {
        await this.child?.output();
    }

    /**
     * @returns `true` if the process was successfully killed, `false` if the process was not running or an error happened while killing the process.
     */
    kill(): boolean {
        if (!this.child) {
            this.logger.warn(
                "Attempted to kill a PuppetProcess that is not running.",
            );
            return false;
        }

        try {
            this.child?.kill();
        } catch (error) {
            this.logger.error("Error while killing process:", error);
            return false;
        }

        return true;
    }
}
