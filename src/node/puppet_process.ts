import { zipReadableStreams } from "@std/streams/zip-readable-streams";
import type { GenericLogger } from "/src/shared/GenericLogger.type.ts";
import type { PuppetProcessOptions } from "/src/shared/PuppetProcessOptions.type.ts";
import { type ChildProcess, spawn } from "node:child_process";
import {
    ReadableStream,
    TextDecoderStream,
    TransformStream,
    WritableStream,
} from "node:stream/web";

export class PuppetProcess {
    private options: PuppetProcessOptions;
    private logger: GenericLogger;
    private textEncoder = new TextEncoder();

    // Runtime Props
    private cmd: string;
    private child?: ChildProcess;
    private std_in_transform: TransformStream<
        string | Uint8Array,
        Uint8Array
    >;
    private std_out_transform = new TextDecoderStream();
    private std_err_transform = new TextDecoderStream();

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
    public readonly std_all: ReadableStream<string | undefined>;

    /**
     * A stream that gets written to the child process's stdin.
     */
    public readonly std_in: WritableStream<string | Uint8Array>;

    constructor(options: PuppetProcessOptions) {
        this.options = options;
        this.logger = options.logger ?? console as GenericLogger;
        this.cmd = options.command;

        // setup std_in
        this.std_in_transform = new TransformStream<
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
        this.std_in = this.std_in_transform.writable;

        // setup std_out and std_err streams correctly (without teeing them, they would be consumed by the std_all stream)
        const [stdOut1, stdOut2] = this.std_out_transform.readable.tee();
        this.std_out = stdOut1;

        const [stdErr1, stdErr2] = this.std_err_transform.readable.tee();
        this.std_err = stdErr1;

        const stdAll = zipReadableStreams<string | undefined>(
            stdOut2 as ReadableStream<string | undefined>,
            stdErr2,
        );
        this.std_all = stdAll;
    }

    start() {
        const [executable, ...args] = this.cmd.split(" ");
        this.child = spawn(executable, args, {
            stdio: ["pipe", "pipe", "pipe"],
        });
    }
}
