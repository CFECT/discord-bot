import { CommandInteraction, GuildMember } from "discord.js";
import { Command } from "../registry/Command";
import Database from "../../Database";
import Constants from "../../Constants";
import Utils from "../../Utils";

export default class NumeroAluviaoCommand extends Command {
    constructor() {
        super("numero-aluviao", "Define o número de aluvião de um utilizador");
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        if (!(interaction.member as GuildMember).roles.cache.has(Constants.ROLES.COMISSAO_DE_FAINA)) {
            await interaction.reply({ content: "Não tens permissão para executar este comando.", ephemeral: true });
            return;
        }

        const user = interaction.options.get('utilizador')?.user;
        const number = interaction.options.get('numero')?.value;
        const discordId = user?.id;
        const member = interaction.guild?.members.cache.get(discordId as string);

        if (!member) {
            await interaction.reply({ content: "Não foi possível encontrar o utilizador.", ephemeral: true });
            return;
        }

        const userDb = await Database.get("SELECT * FROM Users WHERE DiscordID = ?", [user?.id]);
        if (!userDb) {
            await interaction.reply({ content: "Não foi possível encontrar o utilizador.", ephemeral: true });
            return;
        }

        await Database.run("UPDATE Users SET NumeroAluviao = ? WHERE DiscordID = ?", [number, user?.id]);

        await Utils.updateNickname(member);

        await interaction.reply({
            content: `Número de faina de ${user} alterado para \`${number}\`!`,
            ephemeral: true
        });
    }
}
