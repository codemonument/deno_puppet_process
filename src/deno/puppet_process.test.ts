import { assertExists } from "@std/assert";
import { PuppetProcess } from "./puppet_process.ts";

Deno.test("Deno PuppetProcess init", async () => {
    const process = new PuppetProcess({
        command: `echo "Hello, world!"`,
    });

    // Here, we write to the process's stdin, before the child process has started.
    // => Stdin written before the child process has started will be buffered until the child process starts.
    //    (Quantity of buffering not known right now)
    process.std_in.getWriter().write("Hello, world!");

    assertExists(process);

    process.start();

    await process.waitForExit();
});
