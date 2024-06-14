import type { UserContextMenuCommandInteraction } from "discord.js";

export abstract class UserContextMenu {
    public readonly name: string;
    public abstract execute(interaction: UserContextMenuCommandInteraction): Promise<void>;

    constructor(name: string) {
        this.name = name;
    }
}
