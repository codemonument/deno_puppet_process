import { assertEquals, assertExists, assertRejects } from "@std/assert";
import { PuppetProcess } from "./puppet_process.ts";
import { simpleCallbackTarget } from "@codemonument/rx-webstreams";
import { delay } from "@std/async";

Deno.test("new PuppetProcess()", () => {
    const process = new PuppetProcess({
        command: `echo "Hello, world!"`,
    });

    // Test 1: assert that the class constructor of PuppetProcess has run successfully.
    assertExists(process);
});

Deno.test(
    "(deno) PuppetProcess - error on .waitForExit() before .start()",
    () => {
        const process = new PuppetProcess({
            command: `echo "Hello, world!"`,
        });

        assertRejects(() => process.waitForExit());
    },
);

Deno.test("(deno) PuppetProcess - assert stdout", async () => {
    const process = new PuppetProcess({
        command: `echo "Hello, world!"`,
    });

    process.std_out.pipeTo(simpleCallbackTarget((chunk) => {
        assertEquals(chunk, '"Hello, world!"\n');
    }));

    process.start();
    await process.waitForExit();
});

Deno.test("(deno) PuppetProcess - assert stdin => stdout", async () => {
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

    await delay(50);
    // close the writer explicitly to avoid it blocking the closing of the child process
    await writer.close();
    await process.kill();
});
