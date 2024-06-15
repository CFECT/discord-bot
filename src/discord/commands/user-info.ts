import { CommandInteraction, EmbedBuilder, GuildMember } from "discord.js";
import { Command } from "../registry/Command";
import Database from "../../Database";
import Constants from "../../Constants";

export default class UserInfoCommand extends Command {
    constructor() {
        super("user-info", "Consulta os dados de um utilizador");
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        if (!(interaction.member as GuildMember).roles.cache.has(Constants.ROLES.COMISSAO_DE_FAINA)) {
            await interaction.reply({ content: "Não tens permissão para executar este comando.", ephemeral: true });
            return;
        }

        const user = interaction.options.get('utilizador')?.user;
        const discordId = user?.id;
        const member = interaction.guild?.members.cache.get(discordId as string);

        if (!member) {
            await interaction.reply({ content: "Não foi possível encontrar o utilizador.", ephemeral: true });
            return;
        }

        const userDb = await Database.get("SELECT * FROM Users WHERE DiscordID = ?", [discordId]);
        if (!userDb) {
            await interaction.reply({ content: "Não foi possível encontrar o utilizador.", ephemeral: true });
            return;
        }

        const embed = new EmbedBuilder()
            .setColor(Constants.EMBED_COLORS.ACCEPTED)
            .setTitle("Informação do Utilizador")
            .setAuthor({
                name: `${member.user.username} (${member.user.id})`,
                iconURL: member.user.displayAvatarURL()
            })
            .setFields(
                { name: "Nome", value: userDb.Nome, inline: true },
                { name: "NMec", value: userDb.NMec, inline: true },
                { name: "Matrícula", value: userDb.Matricula, inline: true },
                { name: "Nome de Faina", value: userDb.NomeDeFaina, inline: true },
                { name: "Sexo", value: userDb.Sexo, inline: true },
                { name: "Número de Aluvião", value: userDb.NumeroAluviao, inline: true },
            )
            .setFooter({
                text: `Dados pedidos por por ${interaction.user.tag} (${interaction.user.id})`,
                iconURL: interaction.user.displayAvatarURL()
            });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}
