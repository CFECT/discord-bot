import { EmbedBuilder, GuildMember, Message, MessageEditOptions } from 'discord.js';
import Constants from './Constants';
import Database from './Database.js';

class Utils {
    public static async getFormattedName(discordId: string, name: string): Promise<string> {
        const user = await Database.get("SELECT * FROM Users WHERE DiscordID = ?", [discordId]);
        if (!user)
            return name;

        const year = user.Matricula >= 5 ? 5 : user.Matricula as number;
        const sex = user.Sexo === 'F' ? 'F' : 'M';

        for (let rank of Object.values(Constants.ranks))
            if (Object.values(rank).includes(name.split(' ')[0]))
                name = name.split(' ').slice(1).join(' ');

        const rank = user.FainaCompleta ? Constants.ranks[year][sex] : `[A${user.NumeroAluviao}]`

        return `${rank} ${name}`;
    }

    public static async getFormattedNameFromUser(user: GuildMember): Promise<string> {
        const userDb = await Database.get("SELECT * FROM Users WHERE DiscordID = ?", [user.id]);
        if (!userDb)
            return await Utils.getFormattedName(user.id, user.user.username);

        const year = userDb.Matricula >= 5 || userDb.Matricula <= 0 ? 5 : userDb.Matricula as number;
        const sex = userDb.Sexo === 'F' ? 'F' : 'M';
        const name = userDb.NomeDeFaina;

        const rank = userDb.FainaCompleta ? Constants.ranks[year][sex] : `[A${userDb.NumeroAluviao}]`

        return `${rank} ${name}`;
    }

    public static async updateNickname(user: GuildMember): Promise<void> {
        const newName = await Utils.getFormattedNameFromUser(user);
        await user.setNickname(newName);
    }

    public static async updateMatriculas(message: Message): Promise<void> {
        const getEmbedFields = (memberBeingUpdated: GuildMember, current: number, total: number) => {
            return [
                { name: "A atualizar", value: memberBeingUpdated.toString(), inline: true },
                { name: "Progresso", value: `${current}/${total}`, inline: true }
            ]
        }

        const getEmbed = (memberBeingUpdated: GuildMember, current: number, total: number) => {
            return new EmbedBuilder()
                .setTitle("Atualização de matrículas")
                .setDescription("A atualizar as matrículas de todos os utilizadores...")
                .setFields(getEmbedFields(memberBeingUpdated, current, total))
                .setColor(Constants.EMBED_COLORS.UPDATE_IN_PROGRESS)
                .setTimestamp(Date.now());
        }

        const not_found: string[] = [];
        const processing_errors: string[] = [];

        const query = "UPDATE Users SET Matricula = ? WHERE DiscordID = ?";
        const members = await message.guild?.members.fetch();
        const total = members!.size;
        let current = 0;
        for (const member of members!.values()) {
            await message.edit({ content: "", embeds: [getEmbed(member, current, total)] });
            current++;
            const user = await Database.get("SELECT * FROM Users WHERE DiscordID = ?", [member.id]);
            if (!user) {
                not_found.push(`- ${member.displayName} - ${member.id}`);
                continue;
            }
            const year = parseInt(user.Matricula) + 1;

            await Database.run(query, [year, member.id]).then(async () => {
                await member.roles.remove(Constants.ROLES.ALUVIAO);
                await member.roles.add(Constants.ROLES.VETERANO);
                if (year <= 5)
                    await Utils.updateNickname(member);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }).catch((error) => {
                processing_errors.push(`- ${member.displayName} - ${member.id} - ${error}`);
            });
        }

        if (not_found.length === 0 && processing_errors.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle("Atualização de matrículas")
                .setDescription("As matrículas de todos os utilizadores foram atualizadas.")
                .setColor(Constants.EMBED_COLORS.UPDATE_COMPLETED_WITH_NO_ERRORS)
                .setTimestamp(Date.now());
            await message.edit({ content: "", embeds: [embed], components: [] });
            return;
        }

        let messageContent = "";
        if (not_found.length > 0)
            messageContent += `## Users not found on the database:\n${not_found.join("\n")}\n\n`;
        if (processing_errors.length > 0)
            messageContent += `## Errors processing users:\n${processing_errors.join("\n")}`;

        const embed = new EmbedBuilder()
            .setTitle("Atualização de matrículas")
            .setDescription("As matrículas de todos os utilizadores foram atualizadas.\nNo entanto, ocorreram alguns erros, que podem ser vistos no anexo.")
            .setColor(Constants.EMBED_COLORS.UPDATE_COMPLETED_WITH_ERRORS)
            .setTimestamp(Date.now());

        const messageToSend: MessageEditOptions = {
            content: "",
            embeds: [embed],
            files: [{
                attachment: Buffer.from(messageContent),
                name: "errors.md"
            }]
        }

        await message.edit(messageToSend);
    }
}

export default Utils;
