import { assertExists } from "@std/assert";
import { PuppetProcess } from "./puppet_process.ts";

Deno.test("Deno PuppetProcess init", async () => {
    const process = new PuppetProcess({
        command: `echo "Hello, world!"`,
    });

    process.std_in.getWriter().write("Hello, world!");

    assertExists(process);

    process.start();

    await process.waitForExit();
});
