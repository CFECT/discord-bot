import { CommandInteraction, ButtonBuilder, ActionRowBuilder, ButtonStyle } from "discord.js";
import { Command } from "../registry/Command";

export default class SendVerifyMessageCommand extends Command {
    constructor() {
        super("send-verify-message", "Sends the message to setup the verification channel");
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        const text = `Olá! Para ter acesso ao servidor, por favor, clique no botão abaixo para verificar a sua conta.\nRespostas inválidas ou incompletas serão ignoradas.\nSe tiver alguma dúvida, por favor, contacte um dos administradores.\n**NOTA:** O nome de faina é o nome pelo qual pretende ser chamado na faina. Exemplo: para ficar \`Mestre Monteiro\` mete-se \`Monteiro\``;
        const button = new ButtonBuilder()
            .setCustomId("showVerificationModal")
            .setLabel("Verificar")
            .setStyle(ButtonStyle.Primary);
        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
        await interaction.channel?.send({ content: text, components: [actionRow] });
        await interaction.reply({ content: "Mensagem enviada com sucesso!", ephemeral: true });
    }
}
