import { readdirSync } from "fs";
import { ActivityType, Client, IntentsBitField } from 'discord.js';
import CommandRegistry from "./CommandRegistry";

class DiscordBot {
    private client: Client;

    constructor() {
        this.client = new Client({
            intents: [IntentsBitField.Flags.Guilds]
        });
    }

    public async start(token: string): Promise<void> {
        this.registerEvents();
        CommandRegistry.registerCommands();
        await this.client.login(token);
        this.client.user?.setPresence({ activities: [{ name: "aluviões a encher :>", type: ActivityType.Watching }] });
    }

    private registerEvents() {
        readdirSync(__dirname + "/events").forEach((file) => {
            const event = require(__dirname + `/events/${file}`);
            this.client.on(file.split(".")[0]!, (...args) => event.run(this.client, ...args));
        });
    }
}

export default DiscordBot;
