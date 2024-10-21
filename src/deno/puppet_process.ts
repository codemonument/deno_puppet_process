import type { GenericLogger } from "../shared/GenericLogger.type.ts";
import { simpleCallbackTarget } from "@codemonument/rx-webstreams";
import { zipReadableStreams } from "@std/streams/zip-readable-streams";

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
    private std_out_transform = new TextDecoderStream();
    private std_err_transform = new TextDecoderStream();

    /**
     * A promise that resolves when the child process has finished.
     * Constructed from piping the child process's stdout and stderr to a transform stream.
     * This promise resolved when the child process has finished.
     */
    private childFinished: Promise<void>;

    // Public Props
    /**
     * The output stream of the child process.
     */
    public readonly std_out: ReadableStream<string>;

    /**
     * The error stream of the child process.
     */
    public readonly std_err: ReadableStream<string>;

    /**
     * A stream that combines the child process's stdout and stderr.
     */
    public std_all: ReadableStream<string>;

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
        this.logger.debug("PuppetProcess created with options:", options);

        const [executable, ...args] = options.command.split(" ");
        const cmd = new Deno.Command(executable, {
            args,
            stdout: "piped",
            stderr: "piped",
            stdin: "piped",
        });
        this.cmd = cmd;

        // setup std_out and std_err streams correctly (without teeing them, they would be consumed by the std_all stream)
        const [stdOut1, stdOut2] = this.std_out_transform.readable.tee();
        this.std_out = stdOut1;

        const [stdErr1, stdErr2] = this.std_err_transform.readable.tee();
        this.std_err = stdErr1;

        // setup "child process finished" detection
        const [stdAll1, stdAll2] = zipReadableStreams(
            stdOut2,
            stdErr2,
        ).tee();
        this.std_all = stdAll1;
        this.childFinished = stdAll2.pipeTo(
            simpleCallbackTarget(
                () => {
                    /* Noop function, we only need the promise of this .pipeTo action to detect if the child process closed or not */
                },
            ),
        );
    }

    start() {
        this.child = this.cmd.spawn();
        if (!this.child) {
            throw new Error("Failed to spawn child process.");
        }

        // pipe all stdio streams
        this.std_in_transform.readable.pipeTo(this.child.stdin);
        this.child.stdout.pipeTo(this.std_out_transform.writable);
        this.child.stderr.pipeTo(this.std_err_transform.writable);
    }

    /**
     * Waits for the child process to exit.
     * Uses the closing of "std_out" and "std_err" streams to detect when the child process has finished.
     * @returns A promise that resolves when the child process has finished.
     */
    async waitForExit(): Promise<void> {
        await this.childFinished;

        // also close std_in, when std_out and std_err are already closed,
        // so that the child process can exit
        this.std_in.close();
    }

    /**
     * Kills the child process.
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
