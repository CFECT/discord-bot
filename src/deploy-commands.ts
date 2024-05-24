import { Routes, SlashCommandBuilder } from "discord.js";
import { REST } from "@discordjs/rest"
require("dotenv").config();

const token = process.env["DISCORD_BOT_TOKEN"];
const clientId = process.env["CLIENT_ID"];
const guildId = process.env["COMMANDS_GUILD_ID"];

const commands = [
	new SlashCommandBuilder().setName('ping').setDescription('Check the bot ping'),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token!);

if (guildId) {
	rest.put(Routes.applicationGuildCommands(clientId!, guildId), { body: commands })
		.then((data: any) => console.log(`Successfully registered ${data.length} application commands on guild ${guildId}.`))
		.catch(console.error);
} else {
	rest.put(Routes.applicationCommands(clientId!), { body: commands })
		.then((data: any) => console.log(`Successfully registered ${data.length} global application commands.`))
		.catch(console.error);
}
