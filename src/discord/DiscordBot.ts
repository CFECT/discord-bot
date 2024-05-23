import { Client, IntentsBitField } from 'discord.js';

import Logger from '../Logger';

class DiscordBot {
    private client: Client;

    constructor() {
        this.client = new Client({
            intents: [IntentsBitField.Flags.Guilds]
        });

        this.client.on('ready', () => {
            Logger.info('Bot is ready, logged in as ' + this.client.user?.tag);
        });
    }

    public async start(token: string): Promise<void> {
        await this.client.login(token);
    }
}

export default DiscordBot;