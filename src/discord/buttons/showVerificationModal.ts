import { ButtonInteraction, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } from "discord.js";
import { Button } from "../registry/Button";

export default class ShowVerificationModalButton extends Button {
    constructor() {
        super("showVerificationModal");
    }

    public async execute(interaction: ButtonInteraction): Promise<void> {
        const modal = new ModalBuilder()
            .setTitle("Verificação")
            .setCustomId("verificationModal");
        
        const inputNome = new TextInputBuilder()
            .setLabel("Nome")
            .setCustomId("nome")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Introduz o teu nome")
        const actionRowNome = new ActionRowBuilder<TextInputBuilder>().addComponents(inputNome);

        const inputNomeFaina = new TextInputBuilder()
            .setLabel("Nome de Faina")
            .setCustomId("nome-faina")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Introduz o teu nome de faina")
        const actionRowNomeFaina = new ActionRowBuilder<TextInputBuilder>().addComponents(inputNomeFaina);

        const inputNumero = new TextInputBuilder()
            .setLabel("Número Mecanográfico")
            .setCustomId("numero")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Introduz o teu número mecanográfico")
        const actionRowNumero = new ActionRowBuilder<TextInputBuilder>().addComponents(inputNumero);

        const inputMatricula = new TextInputBuilder()
            .setLabel("Matrícula")
            .setCustomId("matricula")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Introduz a tua matrícula")
        const actionRowMatricula = new ActionRowBuilder<TextInputBuilder>().addComponents(inputMatricula);

        const inputSexo = new TextInputBuilder()
            .setLabel("Sexo")
            .setCustomId("sexo")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Introduz o teu sexo (M/F)")
            .setMinLength(1)
            .setMaxLength(1)
        const actionRowSexo = new ActionRowBuilder<TextInputBuilder>().addComponents(inputSexo);

        modal.addComponents(actionRowNome, actionRowNomeFaina, actionRowNumero, actionRowMatricula, actionRowSexo);
        await interaction.showModal(modal);
    }
}
