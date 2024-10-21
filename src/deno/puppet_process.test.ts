import { simpleCallbackTarget } from "@codemonument/rx-webstreams";
import { assertEquals, assertExists, assertRejects } from "@std/assert";
import { delay } from "@std/async";
import { PuppetProcess } from "./puppet_process.ts";

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

    process.std_out.pipeTo(simpleCallbackTarget((chunk) => {
        assertEquals(chunk, "Hello, world!");
    }));
    const writer = process.std_in.getWriter();
    writer.write("Hello, world!");

    process.start();

    await delay(50);
    // close the writer explicitly to avoid dangling stdin stream after child process has finished
    await writer.close();

    // CAUTION: Some cli-tools, like "cat", will exit when the writer for stdin is closed,
    // since this closing sends an EOF signal to the child process!
    // SO: we only need to wait for exit here, instead of killing the process.
    await process.waitForExit();
});
