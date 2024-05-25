import type { ModalSubmitInteraction } from "discord.js";

export abstract class Modal {
    public readonly customId: string;
    public abstract execute(interaction: ModalSubmitInteraction): Promise<void>;

    public readonly startsWith: boolean;

    constructor(customId: string, startsWith: boolean = false) {
        this.customId = customId;
        this.startsWith = startsWith;
    }
}
