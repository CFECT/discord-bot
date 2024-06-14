import { GuildMember, UserContextMenuCommandInteraction } from "discord.js";
import { UserContextMenu } from "../registry/UserContextMenu";
import Database from "../../Database";
import Constants from "../../Constants";
import Utils from "../../Utils";

export default class CompletarFainaUCM extends UserContextMenu {
    constructor() {
        super("Completar faina");
    }

    public async execute(interaction: UserContextMenuCommandInteraction): Promise<void> {
        if (!(interaction.member as GuildMember).roles.cache.has(Constants.ROLES.COMISSAO_DE_FAINA)) {
            await interaction.reply({ content: "Não tens permissão para executar este comando.", ephemeral: true });
            return;
        }

        const user = interaction.targetUser;
        const discordId = user.id;
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

        const fainaCompleta = userDb.FainaCompleta;
        await Database.run("UPDATE Users SET FainaCompleta = ? WHERE DiscordID = ?", [!fainaCompleta, user?.id]);

        if (fainaCompleta) {
            await member.roles.remove(Constants.ROLES.VETERANO);
            await member.roles.add(Constants.ROLES.ALUVIAO);
        } else {
            await member.roles.remove(Constants.ROLES.ALUVIAO);
            await member.roles.add(Constants.ROLES.VETERANO);
        }

        const name = userDb.NomeDeFaina;
        const newName = await Utils.getFormattedName(discordId as string, name);
        await member.setNickname(newName);

        await interaction.reply({
            content: `Faina de ${user} marcada como ${fainaCompleta ? "incompleta" : "completa"}!`,
            ephemeral: true
        });
    }
}
