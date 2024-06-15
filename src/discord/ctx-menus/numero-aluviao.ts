import { ActionRowBuilder, GuildMember, ModalBuilder, TextInputBuilder, TextInputStyle, UserContextMenuCommandInteraction } from "discord.js";
import Database from "../../Database";
import Constants from "../../Constants";
import { UserContextMenu } from "../registry/UserContextMenu";

export default class NumeroAluviaoUCM extends UserContextMenu {
    constructor() {
        super("Número de aluvião");
    }

    public async execute(interaction: UserContextMenuCommandInteraction): Promise<void> {
        if (!(interaction.member as GuildMember).roles.cache.has(Constants.ROLES.COMISSAO_DE_FAINA)) {
            await interaction.reply({ content: "Não tens permissão para executar este comando.", ephemeral: true });
            return;
        }

        const user = interaction.targetUser;
        const discordId = user?.id;

        const userDb = await Database.get("SELECT * FROM Users WHERE DiscordID = ?", [user?.id]);
        if (!userDb) {
            await interaction.reply({ content: "Não foi possível encontrar o utilizador.", ephemeral: true });
            return;
        }

        const modal = new ModalBuilder()
        .setTitle("Alterar número de aluvião")
        .setCustomId("numeroAluviao-" + discordId);

        const inputNome = new TextInputBuilder()
            .setLabel("Novo número de aluvião")
            .setCustomId("number")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setValue(userDb.NumeroAluviao == "?" ? "" : userDb.NumeroAluviao);
        const actionRowNumero = new ActionRowBuilder<TextInputBuilder>().addComponents(inputNome);

        modal.addComponents(actionRowNumero);
        await interaction.showModal(modal);
    }
}
