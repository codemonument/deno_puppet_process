import { assertEquals, assertExists } from "@std/assert";
import { PuppetProcess } from "./puppet_process.ts";
import { simpleCallbackTarget } from "@codemonument/rx-webstreams";

Deno.test("Deno PuppetProcess instantiation", () => {
    const process = new PuppetProcess({
        command: `echo "Hello, world!"`,
    });

    // Test 1: assert that the class constructor of PuppetProcess has run successfully.
    assertExists(process);
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

Deno.test("Deno PuppetProcess stdin => stdout", async () => {
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
