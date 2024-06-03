import { Routes, SlashCommandBuilder } from "discord.js";
import { REST } from "@discordjs/rest"
require("dotenv").config();

const token = process.env["DISCORD_BOT_TOKEN"];
const clientId = process.env["CLIENT_ID"];
const guildId = process.env["COMMANDS_GUILD_ID"];

const commands = [
	new SlashCommandBuilder().setName('ping').setDescription('Check the bot ping'),

	new SlashCommandBuilder().setName('nome-de-faina').setDescription('Efetua o pedido de mudança de nome de faina no servidor')
		.addStringOption(option => option.setName('nome').setDescription('Novo nome de faina').setRequired(true)),

    new SlashCommandBuilder().setName('completar-faina').setDescription('Marca/desmarcar a faina de um utilizador como completa')
        .addUserOption(option => option.setName('utilizador').setDescription('Utilizador cuja faina será marcada/desmarcada como completa').setRequired(true)),

	new SlashCommandBuilder().setName('send-verify-message').setDescription('Sends the message to setup the verification channel')
		.setDefaultMemberPermissions(0),
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
