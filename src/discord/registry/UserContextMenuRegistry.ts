import { readdirSync } from "fs";
import { resolve } from "path";
import { Collection } from "discord.js";
import { UserContextMenu } from "./UserContextMenu";
import Logger from "../../Logger";

class UserContextMenuRegistry {
    private userContextMenus: Collection<string, UserContextMenu> = new Collection();

    private get userContextMenusDir(): string {
        return resolve(__dirname, "..", "ctx-menus");
    }

    private getUserContextMenuFile(name: string): string {
        return resolve(this.userContextMenusDir, name);
    }

    public registerUserContextMenus() {
        // Read all files in the userContextMenus folder
        // Each file has a run function that takes in the interaction
        const registeredUserContextMenus: string[] = [];
        readdirSync(this.userContextMenusDir).forEach((file) => {
            const userContextMenuFile = require(this.getUserContextMenuFile(file));
            if (!userContextMenuFile.default) return;
            const userContextMenu = new userContextMenuFile.default();
            if (userContextMenu instanceof UserContextMenu) {
                const userContextMenuName = userContextMenu.name;
                if (registeredUserContextMenus.includes(userContextMenuName)) throw new Error(`Duplicate userContextMenu name: ${userContextMenuName}`);
                registeredUserContextMenus.push(userContextMenuName);
                this.setUserContextMenu(userContextMenuName, userContextMenu);
            }
        });
        Logger.info(`Registered ${registeredUserContextMenus.length} userContextMenus: ${registeredUserContextMenus.join(", ")}`);
    }

    private setUserContextMenu(userContextMenuName: string, userContextMenu: UserContextMenu): void {
        this.userContextMenus.set(userContextMenuName, userContextMenu);
    }

    public getUserContextMenu(name: string): UserContextMenu | undefined {
        const userContextMenu = this.userContextMenus.get(name);
        return userContextMenu;
    }

    public getUserContextMenus(): Collection<string, UserContextMenu> {
        return this.userContextMenus;
    }
}

export default new UserContextMenuRegistry();
