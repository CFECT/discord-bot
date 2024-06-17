import { ModalSubmitInteraction } from "discord.js";
import { Modal } from "../registry/Modal";
import Database from "../../Database";
import Utils from "../../Utils";

export default class NumeroAluviaoModal extends Modal {
    constructor() {
        super("numeroAluviao-", true);
    }

    public async execute(interaction: ModalSubmitInteraction): Promise<void> {
        const values = interaction.fields.fields.map((field) => {
            return {
                name: field.customId,
                value: interaction.fields.getTextInputValue(field.customId),
            }
        });

        const discordId = interaction.customId.split("-")[1];
        if (!discordId) {
            await interaction.reply({ content: "Não foi possível encontrar o utilizador.", ephemeral: true });
            return;
        }

        const number = values.find((value) => value.name === "number")?.value;

        if (!number) {
            await interaction.reply({ content: "Por favor, preencha todos os campos.", ephemeral: true });
            return;
        }

        await Database.run("UPDATE Users SET NumeroAluviao = ? WHERE DiscordID = ?", [number, discordId]);

        const user = await interaction.guild?.members.fetch(discordId);
        if (!user) {
            await interaction.reply({ content: "Não foi possível encontrar o utilizador.", ephemeral: true });
            return;
        }
        await Utils.updateNickname(user);

        await interaction.reply({
            content: `Número de faina de ${user} alterado para \`${number}\`!`,
            ephemeral: true
        });
    }
}

