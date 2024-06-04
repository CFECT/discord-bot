import { ButtonInteraction, EmbedBuilder, GuildMember } from "discord.js";
import { Button } from "../registry/Button";
import Database from "../../Database";
import Constants from "../../Constants";

export default class DeclineVerification extends Button {
    constructor() {
        super("declineVerification-", true);
    }

    public async execute(interaction: ButtonInteraction): Promise<void> {
        const id = parseInt(interaction.customId.split("-")[1]);
        const verification = await Database.get("SELECT * FROM Verifications WHERE ID = ?", [id]);
        if (!verification) {
            await interaction.channel?.send("Pedido de verificação não encontrado!");
            return;
        }
        const user = await interaction.guild?.members.fetch(verification.DiscordID);
        if (!user) {
            await interaction.followUp({ content: "Utilizador não encontrado!", ephemeral: true });
            return;
        }

        await Database.run("DELETE FROM Verifications WHERE ID = ?", [id]);

        const originalEmbed = interaction.message.embeds[0].toJSON();
        const newEmbed = new EmbedBuilder(originalEmbed)
            .setColor(Constants.EMBED_COLORS.DENIED)
            .setFooter({
                text: `Verificação rejeitada por ${(interaction.member as GuildMember).displayName} (${interaction.user.id})`,
                iconURL: interaction.user.displayAvatarURL()
            });

        await user.send(`O teu pedido de verificação foi rejeitado! Por favor tenta novamente com os dados corretos.`);

        await interaction.update({ embeds: [newEmbed], components: [] });
        await interaction.followUp({ content: `Verificação rejeitada!`, ephemeral: true });
    }
}
