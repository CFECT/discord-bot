import { Client, GuildMember } from 'discord.js';
import Logger from "../../Logger";
import Database from "../../Database";

export async function run(_: Client, member: GuildMember) {
    await Database.run(`DELETE FROM Users WHERE DiscordID = ?`, [member.id]);
    await Database.run(`DELETE FROM Verifications WHERE DiscordID = ?`, [member.id]);
    await Database.run(`DELETE FROM NameChanges WHERE DiscordID = ?`, [member.id]);

    Logger.info(`Removed user ${member.displayName} (${member.id}) from the database because they left the server.`);
}
