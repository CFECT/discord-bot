import { ModalSubmitInteraction, ButtonBuilder, ActionRowBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { Modal } from "../registry/Modal";
import Constants from "../../Constants";
import Database from "../../Database";
import Utils from "../../Utils";

export default class AcceptVerificationModal extends Modal {
    constructor() {
        super("acceptVerificationModal-", true);
    }

    public async execute(interaction: ModalSubmitInteraction): Promise<void> {
        const values = interaction.fields.fields.map((field) => {
            return {
                name: field.customId,
                value: interaction.fields.getTextInputValue(field.customId),
            }
        });

        const verification = await Database.get("SELECT * FROM Verifications WHERE ID = ?", [interaction.customId.split("-")[1]]);
        const discordId = verification.DiscordID;
        if (!discordId) {
            await interaction.reply({ content: "Não foi possível encontrar o utilizador.", ephemeral: true });
            return;
        }

        const nome = values.find((value) => value.name === "nome");
        const sexo = values.find((value) => value.name === "sexo");
        const numero = values.find((value) => value.name === "numero");
        const matricula = values.find((value) => value.name === "matricula");
        const nomeDeFaina = values.find((value) => value.name === "nome-faina");
        const interactionMessageId = interaction.message?.id;
        const message = await interaction.channel?.messages.fetch(interactionMessageId as string);

        if (!nome || !sexo || !numero || !matricula || !nomeDeFaina) {
            await interaction.reply({ content: "Por favor, preencha todos os campos.", ephemeral: true });
            return;
        }

        await Database.run("INSERT INTO Users (DiscordID, Nome, Sexo, NMec, Matricula, NomeDeFaina, FainaCompleta) VALUES (?, ?, ?, ?, ?, ?, ?)",
                          [discordId, nome.value, sexo.value, numero.value, matricula.value, nomeDeFaina.value, false]);
        await Database.run("DELETE FROM Verifications WHERE ID = ?", [interaction.customId.split("-")[1]]);

        const newName = await Utils.getFormattedName(discordId, nomeDeFaina.value);
        await interaction.guild?.members.fetch(discordId).then(async (member) => {
            await member.setNickname(newName);
            await member.roles.add(Constants.ROLES.ALUVIAO);
        });

        const originalEmbed = message?.embeds[0].toJSON();
        const newEmbed = new EmbedBuilder(originalEmbed)
            .setColor(Constants.EMBED_COLORS.ACCEPTED)
            .setFields(
                { name: "Nome", value: nome.value, inline: true },
                { name: "NMec", value: numero.value, inline: true },
                { name: "Matrícula", value: matricula.value, inline: true },
                { name: "Nome de Faina", value: nomeDeFaina.value, inline: true },
                { name: "Sexo", value: sexo.value, inline: true }
            )
            .setFooter({
                text: `Verificação aceite por ${interaction.user.tag} (${interaction.user.id})`,
                iconURL: interaction.user.displayAvatarURL()
            });

        await message?.edit({ embeds: [newEmbed], components: [] });

        const buttonYes = new ButtonBuilder()
            .setCustomId(`completeFaina-${discordId}`)
            .setLabel("Marcar faina como completa")
            .setStyle(ButtonStyle.Success);
        const actionRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(buttonYes)

        const user = interaction.client.users.cache.get(discordId);
        if (user) {
            await user.send(`A tua verificação foi aceite!`).catch(() => { });
        }

        await interaction.reply({ content: `Verificação aceite!\nPara marcar a faina como completa, clique no botão abaixo`, ephemeral: true, components: [actionRow]});
    }
}
