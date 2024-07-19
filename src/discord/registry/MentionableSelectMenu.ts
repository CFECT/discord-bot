import type { MentionableSelectMenuInteraction } from "discord.js";

export abstract class MentionableSelectMenu {
    public readonly customId: string;
    public abstract execute(interaction: MentionableSelectMenuInteraction): Promise<void>;

    public readonly startsWith: boolean;

    constructor(customId: string, startsWith: boolean = false) {
        this.customId = customId;
        this.startsWith = startsWith;
    }
}
