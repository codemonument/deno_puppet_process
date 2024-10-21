import { assertEquals, assertExists } from "@std/assert";
import { PuppetProcess } from "./puppet_process.ts";
import { simpleCallbackTarget } from "@codemonument/rx-webstreams";

Deno.test("Deno PuppetProcess instantiation", async () => {
    const process = new PuppetProcess({
        command: `echo "Hello, world!"`,
    });

    // Test 1: assert that the class constructor of PuppetProcess has run successfully.
    assertExists(process);

    // Here, we write to the process's stdin, before the child process has started.
    // => Stdin written before the child process has started will be buffered until the child process starts.
    //    (Quantity of buffering not known right now)
    // const writer = process.std_in.getWriter();
    // writer.write("Hello, world!");

    // process.start();

    await process.waitForExit();
});

Deno.test("Deno PuppetProcess stdout", async () => {
    const process = new PuppetProcess({
        command: `echo "Hello, world!"`,
    });

    process.std_out.pipeTo(simpleCallbackTarget((chunk) => {
        assertEquals(chunk, '"Hello, world!"\n');
    }));

    process.start();
    await process.waitForExit();
});

Deno.test.only("Deno PuppetProcess stdin => stdout", async () => {
    const process = new PuppetProcess({
        command: `cat`,
    });

    const testChunk = "Hello, world!";

    process.std_out.pipeTo(simpleCallbackTarget((chunk) => {
        assertEquals(chunk, testChunk);
    }));
    const writer = process.std_in.getWriter();
    writer.write(testChunk);

    process.start();

    setTimeout(async () => {
        // close the writer explicitly to avoid it blocking the closing of the child process
        await writer.close();
        process.kill();
    }, 50);

    await process.waitForExit();
});
