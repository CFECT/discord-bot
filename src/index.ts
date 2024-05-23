import dotenv from "dotenv";

import DiscordBot from "./discord/DiscordBot";

dotenv.config();

if (!process.env.DISCORD_BOT_TOKEN) {
    throw new Error('DISCORD_BOT_TOKEN is not defined. Please define it in .env file or in environment variables.');
}

const bot = new DiscordBot();
bot.start(process.env.DISCORD_BOT_TOKEN);