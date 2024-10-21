import { assertExists } from "@std/assert";
import { PuppetProcess } from "./puppet_process.ts";

Deno.test("Deno PuppetProcess init", () => {
    const process = new PuppetProcess({
        executable: "echo",
        args: ["Hello, world!"],
    });

    assertExists(process);
});
