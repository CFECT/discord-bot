import { Attachment, CommandInteraction, GuildMember, InteractionReplyOptions, Team } from "discord.js";
import { Command } from "../registry/Command";
import Constants from "../../Constants";
import Database from "../../Database";
import Utils from "../../Utils";

export default class CompletarFainaBulkCommand extends Command {
    constructor() {
        super("completar-faina-bulk", "Completa a faina de vários utilizadores");
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

        const invalid_lines: string[] = [];
        const not_found: string[] = [];
        const processing_errors: string[] = [];

        const text = await file.text();
        const lines = text.split('\n');
        lines.pop();
        const query = "UPDATE Users SET FainaCompleta = true WHERE NMec = ?";
        for (const index in lines) {
            const nmec = lines[index];
            if (!nmec || nmec.length <= 4 || nmec.length >= 7 || isNaN(parseInt(nmec))) {
                invalid_lines.push(`- Line ${parseInt(index) + 1} - ${nmec}`);
                continue;
            }

            const user = await Database.get("SELECT * FROM Users WHERE NMec = ?", [nmec]);
            if (!user) {
                not_found.push(`- ${nmec}`);
                continue;
            }
            const discordUserId = user.DiscordID;

            await Database.run(query, [nmec]).then(async () => {
                const member = await interaction.guild?.members.fetch(discordUserId as string) as GuildMember;
                await member.roles.remove(Constants.ROLES.ALUVIAO);
                await member.roles.add(Constants.ROLES.VETERANO);
                await Utils.updateNickname(member);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }).catch((error) => {
                processing_errors.push(`- Line ${parseInt(index) + 1} - ${nmec} - ${error}`);
            });
        }

        if (invalid_lines.length === 0 && not_found.length === 0 && processing_errors.length === 0) {
            await interaction.editReply({ content: "Operation finished successfully." });
            return;
        }

        let message = "";
        if (invalid_lines.length > 0)
            message += `## Invalid lines:\n${invalid_lines.join("\n")}\n\n`;
        if (not_found.length > 0)
            message += `## Users not found on the database:\n${not_found.join("\n")}\n\n`;
        if (processing_errors.length > 0)
            message += `## Errors processing lines:\n${processing_errors.join("\n")}`;

        const messageToSend: InteractionReplyOptions = {
            content: "Operation finished with errors.",
            ephemeral: true,
            files: [{
                attachment: Buffer.from(message),
                name: "errors.md"
            }]
        }

        await interaction.editReply(messageToSend);
    }
}
