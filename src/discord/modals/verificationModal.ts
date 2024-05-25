import { ModalSubmitInteraction, ButtonBuilder, ActionRowBuilder, ButtonStyle } from "discord.js";
import { Modal } from "../registry/Modal";
import Constants from "../../Constants";

export default class VerificationModal extends Modal {
    constructor() {
        super("verificationModal");
    }

    public async execute(interaction: ModalSubmitInteraction): Promise<void> {
        const values = interaction.fields.fields.map((field) => {
            return {
                name: field.customId,
                value: interaction.fields.getTextInputValue(field.customId),
            }
        });
        const text = values.map((value) => `${value.name}: ${value.value}`).join("\n");
        
        const channel = interaction.guild?.channels.cache.get(Constants.VERIFICATION_CHANNEL_ID);
        if (!channel || !channel.isTextBased()) {
            await interaction.reply({ content: "Can't find the verification channel. Please contact the admins.", ephemeral: true });
            return;
        }

        await channel.send({ content: text });
        await interaction.reply({ content: "Verificação enviada com sucesso!", ephemeral: true });
    }
}
