import { ModalSubmitInteraction, EmbedBuilder } from "discord.js";
import { Modal } from "../registry/Modal";
import Constants from "../../Constants";
import Database from "../../Database";
import Utils from "../../Utils";

export default class AcceptVerificationModal extends Modal {
    constructor() {
        super("editUserModal-", true);
    }

    public async execute(interaction: ModalSubmitInteraction): Promise<void> {
        const values = interaction.fields.fields.map((field) => {
            return {
                name: field.customId,
                value: interaction.fields.getTextInputValue(field.customId),
            }
        });

        const channel = interaction.guild?.channels.cache.get(Constants.VERIFICATION_CHANNEL_ID);
        if (!channel || !channel.isTextBased()) {
            await interaction.reply({ content: "O canal de verificações não foi encontrado. Por favor, contacte um administrador.", ephemeral: true });
            return;
        }

        const verification = await Database.get("SELECT * FROM Users WHERE DiscordID = ?", [interaction.customId.split("-")[1]]);
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

        if (!nome || !sexo || !numero || !matricula || !nomeDeFaina) {
            await interaction.reply({ content: "Por favor, preencha todos os campos.", ephemeral: true });
            return;
        }

        await Database.run("UPDATE Users SET Nome = ?, Sexo = ?, NMec = ?, Matricula = ?, NomeDeFaina = ? WHERE DiscordID = ?",
            [nome.value, sexo.value, numero.value, matricula.value, nomeDeFaina.value, discordId]);

        const newName = await Utils.getFormattedName(discordId, nomeDeFaina.value);
        const user = await interaction.guild?.members.fetch(discordId);
        user?.setNickname(newName);

        const embed = new EmbedBuilder()
            .setTitle("Atualização de dados")
            .setDescription(`Os dados de ${user} foram atualizados.`)
            .setColor(Constants.EMBED_COLORS.ACCEPTED)
            .setFields(
                { name: "Nome", value: nome.value, inline: true },
                { name: "NMec", value: numero.value, inline: true },
                { name: "Matrícula", value: matricula.value, inline: true },
                { name: "Nome de Faina", value: nomeDeFaina.value, inline: true },
                { name: "Sexo", value: sexo.value, inline: true }
            )
            .setFooter({
                text: `Dados atualizados por ${interaction.user.tag} (${interaction.user.id})`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setAuthor({ name: `${interaction.user.tag} (${interaction.user.id})`, iconURL: interaction.user.displayAvatarURL() });

        await channel.send({ embeds: [embed] });
        await interaction.reply({embeds: [embed], ephemeral: true});
    }
}
