import { CommandInteraction, InteractionReplyOptions, Team } from "discord.js";
import { Command } from "../registry/Command";
import Constants from "../../Constants";
import Database from "../../Database";
import Utils from "../../Utils";

export default class UpdateMatriculasCommand extends Command {
    constructor() {
        super("update-matriculas", "Atualiza a matrícula de todos os utilizadores");
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

        const not_found: string[] = [];
        const processing_errors: string[] = [];

        const query = "UPDATE Users SET Matricula = ? WHERE DiscordID = ?";
        const members = await interaction.guild?.members.fetch();
        for (const member of members!.values()) {
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
            await interaction.editReply({ content: "Operation finished successfully." });
            return;
        }

        let message = "";
        if (not_found.length > 0)
            message += `## Users not found on the database:\n${not_found.join("\n")}\n\n`;
        if (processing_errors.length > 0)
            message += `## Errors processing users:\n${processing_errors.join("\n")}`;

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
