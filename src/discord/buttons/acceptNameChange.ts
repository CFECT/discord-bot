import { ButtonInteraction, EmbedBuilder, GuildMember } from "discord.js";
import { Button } from "../registry/Button";
import Database from "../../Database";
import Constants from "../../Constants";

export default class AcceptNameChange extends Button {
    constructor() {
        super("acceptNameChange-", true);
    }

    public async execute(interaction: ButtonInteraction): Promise<void> {
        const id = parseInt(interaction.customId.split("-")[1]);
        const nameChange = await Database.get("SELECT * FROM NameChanges WHERE ID = ?", [id]);
        if (!nameChange) {
            await interaction.channel?.send("Name change request not found!");
            return;
        }
        const user = await interaction.guild?.members.fetch(nameChange.DiscordID);
        if (!user) {
            await interaction.followUp({ content: "User not found!", ephemeral: true });
            return;
        }
        if (!user.manageable) {
            await interaction.followUp({ content: "I don't have permission to change this user's name!", ephemeral: true });
            return;
        }

        await Database.run("UPDATE Users SET NomeDeFaina = ? WHERE DiscordID = ?", [nameChange.NomeNovo, nameChange.DiscordID]);
        await Database.run("DELETE FROM NameChanges WHERE ID = ?", [id]);
        await user.setNickname(nameChange.NomeNovo);

        const originalEmbed = interaction.message.embeds[0].toJSON();
        const newEmbed = new EmbedBuilder(originalEmbed)
            .setColor(Constants.EMBED_COLORS.ACCEPTED)
            .setFooter({
                text: `Mudança de nome aceite por ${(interaction.member as GuildMember).displayName} (${interaction.user.id})`,
                iconURL: interaction.user.displayAvatarURL()
            });

        await interaction.update({ embeds: [newEmbed], components: [] });
        await interaction.followUp({ content: `Name change accepted!`, ephemeral: true});
    }
}
