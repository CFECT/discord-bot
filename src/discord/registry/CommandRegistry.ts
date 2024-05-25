import { readdirSync } from "fs";
import { resolve } from "path";
import { Collection } from "discord.js";
import { Command } from "./Command";
import Logger from "../../Logger";

class CommandRegistry {
    private commands: Collection<string, Command> = new Collection();

    private get commandsDir(): string {
        return resolve(__dirname, "..", "commands");
    }

    private getCommandFile(name: string): string {
        return resolve(this.commandsDir, name);
    }

    public registerCommands() {
        // Read all files in the commands folder
        // Each file has a run function that takes in the interaction
        const registeredCommands: string[] = [];
        readdirSync(this.commandsDir).forEach((file) => {
            const commandFile = require(this.getCommandFile(file));
            if (!commandFile.default) return;
            const command = new commandFile.default();
            if (command instanceof Command) {
                const commandName = command.name;
                if (registeredCommands.includes(commandName)) throw new Error(`Duplicate command name: ${commandName}`);
                registeredCommands.push(commandName);
                this.setCommand(commandName, command);
            }
        });
        Logger.info(`Registered ${registeredCommands.length} commands: ${registeredCommands.join(", ")}`);
    }

    private setCommand(commandName: string, command: Command): void {
        this.commands.set(commandName, command);
    }

    public getCommand(name: string): Command | undefined {
        const command = this.commands.get(name);
        return command;
    }

    public getCommands(): Collection<string, Command> {
        return this.commands;
    }
}

export default new CommandRegistry();
