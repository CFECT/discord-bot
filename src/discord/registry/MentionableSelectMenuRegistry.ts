import { readdirSync } from "fs";
import { resolve } from "path";
import { Collection } from "discord.js";
import { MentionableSelectMenu } from "./MentionableSelectMenu";
import Logger from "../../Logger";

class MentionableSelectMenuRegistry {
    private mentionableSelectMenus: Collection<string, MentionableSelectMenu> = new Collection();

    private get mentionableSelectMenusDir(): string {
        return resolve(__dirname, "..", "mentionableSelectMenus");
    }

    private getMentionableSelectMenuFile(name: string): string {
        return resolve(this.mentionableSelectMenusDir, name);
    }

    public registerMentionableSelectMenus() {
        // Read all files in the mentionableSelectMenus folder
        // Each file has a run function that takes in the interaction
        const registeredMentionableSelectMenus: string[] = [];
        readdirSync(this.mentionableSelectMenusDir).forEach((file) => {
            const mentionableSelectMenuFile = require(this.getMentionableSelectMenuFile(file));
            if (!mentionableSelectMenuFile.default) return;
            const mentionableSelectMenu = new mentionableSelectMenuFile.default();
            if (mentionableSelectMenu instanceof MentionableSelectMenu) {
                const mentionableSelectMenuName = mentionableSelectMenu.customId;
                if (registeredMentionableSelectMenus.includes(mentionableSelectMenuName)) throw new Error(`Duplicate mentionableSelectMenu name: ${mentionableSelectMenuName}`);
                registeredMentionableSelectMenus.push(mentionableSelectMenuName);
                this.setMentionableSelectMenu(mentionableSelectMenuName, mentionableSelectMenu);
            }
        });
        Logger.info(`Registered ${registeredMentionableSelectMenus.length} mentionableSelectMenus: ${registeredMentionableSelectMenus.join(", ")}`);
    }

    private setMentionableSelectMenu(mentionableSelectMenuCustomId: string, mentionableSelectMenu: MentionableSelectMenu): void {
        this.mentionableSelectMenus.set(mentionableSelectMenuCustomId, mentionableSelectMenu);
    }

    public getMentionableSelectMenu(customId: string): MentionableSelectMenu | undefined {
        const mentionableSelectMenu = this.mentionableSelectMenus.find((mentionableSelectMenu) => (mentionableSelectMenu.customId === customId) || (mentionableSelectMenu.startsWith && customId.startsWith(mentionableSelectMenu.customId)));
        return mentionableSelectMenu;
    }

    public getMentionableSelectMenus(): Collection<string, MentionableSelectMenu> {
        return this.mentionableSelectMenus;
    }
}

export default new MentionableSelectMenuRegistry();
