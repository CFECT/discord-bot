import { readdirSync } from "fs";
import { resolve } from "path";
import { Collection } from "discord.js";
import { Button } from "./Button";
import Logger from "../../Logger";

class ButtonRegistry {
    private buttons: Collection<string, Button> = new Collection();

    private get buttonsDir(): string {
        return resolve(__dirname, "..", "buttons");
    }

    private getButtonFile(name: string): string {
        return resolve(this.buttonsDir, name);
    }

    public registerButtons() {
        // Read all files in the buttons folder
        // Each file has a run function that takes in the interaction
        const registeredButtons: string[] = [];
        readdirSync(this.buttonsDir).forEach((file) => {
            const buttonFile = require(this.getButtonFile(file));
            if (!buttonFile.default) return;
            const button = new buttonFile.default();
            if (button instanceof Button) {
                const buttonName = button.customId;
                if (registeredButtons.includes(buttonName)) throw new Error(`Duplicate button name: ${buttonName}`);
                registeredButtons.push(buttonName);
                this.setButton(buttonName, button);
            }
        });
        Logger.info(`Registered ${registeredButtons.length} buttons: ${registeredButtons.join(", ")}`);
    }

    private setButton(buttonCustomId: string, button: Button): void {
        this.buttons.set(buttonCustomId, button);
    }

    public getButton(customId: string): Button | undefined {
        const button = this.buttons.find((button) => (button.customId === customId) || (button.startsWith && customId.startsWith(button.customId)));
        return button;
    }

    public getButtons(): Collection<string, Button> {
        return this.buttons;
    }
}

export default new ButtonRegistry();
