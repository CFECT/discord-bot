import { ButtonInteraction, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } from "discord.js";
import { Button } from "../registry/Button";
import Database from "../../Database";

export default class AcceptVerificationModalButton extends Button {
    constructor() {
        super("acceptVerification-", true);
    }

    public async execute(interaction: ButtonInteraction): Promise<void> {
        const modal = new ModalBuilder()
            .setTitle("Verificação")
            .setCustomId("acceptVerificationModal-" + interaction.customId.split("-")[1]);

        await Database.run("UPDATE Verifications SET InteractionMessageID = ? WHERE ID = ?", [interaction.message.id, interaction.customId.split("-")[1]]);
        const user = await Database.get("SELECT * FROM Verifications WHERE ID = ?", [interaction.customId.split("-")[1]]);
        if (!user) {
            await interaction.reply({ content: "Não foi possível encontrar o utilizador.", ephemeral: true });
            return;
        }

        const inputNome = new TextInputBuilder()
            .setLabel("Nome")
            .setCustomId("nome")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setValue(user.Nome);
        const actionRowNome = new ActionRowBuilder<TextInputBuilder>().addComponents(inputNome);

        const inputNomeFaina = new TextInputBuilder()
            .setLabel("Nome de Faina")
            .setCustomId("nome-faina")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setValue(user.NomeDeFaina);
        const actionRowNomeFaina = new ActionRowBuilder<TextInputBuilder>().addComponents(inputNomeFaina);

        const inputNumero = new TextInputBuilder()
            .setLabel("Número Mecanográfico")
            .setCustomId("numero")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setValue(user.NMec)
        const actionRowNumero = new ActionRowBuilder<TextInputBuilder>().addComponents(inputNumero);

        const inputMatricula = new TextInputBuilder()
            .setLabel("Matrícula")
            .setCustomId("matricula")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setValue(user.Matricula)
            .setMinLength(1)
            .setMaxLength(1)
        const actionRowMatricula = new ActionRowBuilder<TextInputBuilder>().addComponents(inputMatricula);

        const inputSexo = new TextInputBuilder()
            .setLabel("Sexo")
            .setCustomId("sexo")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setValue(user.Sexo)
            .setMinLength(1)
            .setMaxLength(1)
        const actionRowSexo = new ActionRowBuilder<TextInputBuilder>().addComponents(inputSexo);

        modal.addComponents(actionRowNome, actionRowNomeFaina, actionRowNumero, actionRowMatricula, actionRowSexo);
        await interaction.showModal(modal);
    }
}
