import type { ButtonInteraction } from "discord.js";

export abstract class Button {
    public readonly customId: string;
    public abstract execute(interaction: ButtonInteraction): Promise<void>;

    public readonly startsWith: boolean;

    constructor(customId: string, startsWith: boolean = false) {
        this.customId = customId;
        this.startsWith = startsWith;
    }
}
