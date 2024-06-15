import { ButtonInteraction } from "discord.js";
import { Button } from "../registry/Button";
import Database from "../../Database";
import Utils from "../../Utils";
import Constants from "../../Constants";

export default class CompleteFainaButton extends Button {
    constructor() {
        super("completeFaina-", true);
    }

    public async execute(interaction: ButtonInteraction): Promise<void> {
        const discordId = interaction.customId.split("-")[1];

        await Database.run("UPDATE Users SET FainaCompleta = 1 WHERE DiscordID = ?", [discordId]);

        const user = interaction.guild?.members.cache.get(discordId);
        if (!user) {
            await interaction.update({ components: [], content: 'Utilizador não encontrado!' });
            return;
        }
        user.roles.remove(Constants.ROLES.ALUVIAO);
        user.roles.add(Constants.ROLES.VETERANO);
        await Utils.updateNickname(user);

        await interaction.update({ components: [], content: 'Verificação aceite!\nFaina marcada como completa!' });
    }
}
