export interface PuppetProcessShape {
    readonly std_out: ReadableStream<string>;
    readonly std_err: ReadableStream<string>;
    readonly std_all: ReadableStream<string>;

    readonly std_in: WritableStream<string | Uint8Array>;

    start(): void;

    waitForExit(): Promise<void>;

    kill(): Promise<void>;
}
