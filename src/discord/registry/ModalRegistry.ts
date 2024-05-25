import { readdirSync } from "fs";
import { resolve } from "path";
import { Collection } from "discord.js";
import { Modal } from "./Modal";
import Logger from "../../Logger";

class ModalRegistry {
    private modals: Collection<string, Modal> = new Collection();

    private get modalsDir(): string {
        return resolve(__dirname, "..", "modals");
    }

    private getModalFile(name: string): string {
        return resolve(this.modalsDir, name);
    }

    public registerModals() {
        // Read all files in the modals folder
        // Each file has a run function that takes in the interaction
        const registeredModals: string[] = [];
        readdirSync(this.modalsDir).forEach((file) => {
            const modalFile = require(this.getModalFile(file));
            if (!modalFile.default) return;
            const modal = new modalFile.default();
            if (modal instanceof Modal) {
                const modalName = modal.customId;
                if (registeredModals.includes(modalName)) throw new Error(`Duplicate modal name: ${modalName}`);
                registeredModals.push(modalName);
                this.setModal(modalName, modal);
            }
        });
        Logger.info(`Registered ${registeredModals.length} modals: ${registeredModals.join(", ")}`);
    }

    private setModal(modalCustomId: string, modal: Modal): void {
        this.modals.set(modalCustomId, modal);
    }

    public getModal(customId: string): Modal | undefined {
        const modal = this.modals.find((modal) => (modal.customId === customId) || (modal.startsWith && customId.startsWith(modal.customId)));
        return modal;
    }

    public getModals(): Collection<string, Modal> {
        return this.modals;
    }
}

export default new ModalRegistry();
