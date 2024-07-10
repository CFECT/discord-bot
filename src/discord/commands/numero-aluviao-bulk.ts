import { Attachment, CommandInteraction, GuildMember, Team } from "discord.js";
import { Command } from "../registry/Command";
import Database from "../../Database";
import Constants from "../../Constants";
import Utils from "../../Utils";

export default class NumeroAluviaoBulkCommand extends Command {
    constructor() {
        super("numero-aluviao-bulk", "Define o número de aluvião de vários utilizadores");
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        await interaction.deferReply({ ephemeral: true });
        await interaction.client.application.fetch();
        const owner = interaction.client.application.owner;
        if (!owner) {
            await interaction.editReply({ content: "Could not find bot owner." });
            return;
        }

        if (owner instanceof Team) {
            if (owner.members.size === 0) {
                await interaction.editReply({ content: "Could not find bot owner." });
                return;
            }
            if (!owner.members.has(interaction.user.id)) {
                await interaction.editReply({ content: "You are not the bot owner." });
                return;
            }
        } else {
            if (owner.id !== interaction.user.id) {
                await interaction.editReply({ content: "You are not the bot owner." });
                return;
            }
        }

        await interaction.editReply({ content: "Processing file..." });

        const fileAtt = interaction.options.get('ficheiro', true).attachment as Attachment;
        const fileUrl = fileAtt.url;
        
        const file = await fetch(fileUrl).catch(() => null);
        if (!file) {
            await interaction.editReply({ content: "Could not fetch file." });
            return;
        }

        const errors: string[] = [];

        const text = await file.text();
        const lines = text.split('\n');
        for (const index in lines) {
            const line = lines[index];
            if (!line) continue;
            let [nmec, naluviao] = line.split(',');
            if (!nmec || !naluviao) {
                errors.push(`- Line ${parseInt(index) + 1} invalid: \`${line}\``);
                continue;
            }

            const user = await Database.get("SELECT * FROM Users WHERE NMec = ?", [nmec]);
            if (!user) {
                errors.push(`- User not found on line ${parseInt(index) + 1}: \`${line}\``);
                continue;
            }
            const discordUserId = user.DiscordID;

            const query = "UPDATE Users SET NumeroAluviao = ? WHERE NMec = ?";
            await Database.run(query, [naluviao, nmec]).then(async () => {
                await Utils.updateNickname(interaction.guild?.members.cache.get(discordUserId as string) as GuildMember);
            }).catch(() => {
                errors.push(`- Error processing line ${parseInt(index) + 1}: \`${line}\``);
            });
        }

        const response = errors.length > 0 ? `Errors:\n${errors.join('\n')}` : "Operação concluída com sucesso.";

        await interaction.editReply({ content: response });
    }
}
