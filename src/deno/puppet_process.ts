import type { GenericLogger } from "../shared/GenericLogger.type.ts";

export type PuppetProcessOptions = {
    executable: string;
    args: string[];
    logger?: GenericLogger;
};

export class PuppetProcess {
    logger: GenericLogger;

    constructor(options: PuppetProcessOptions) {
        this.logger = options.logger ?? console as GenericLogger;
        this.logger.log("PuppetProcess created with options:", options);
    }
}
