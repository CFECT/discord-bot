import { ButtonInteraction } from "discord.js";
import { Button } from "../registry/Button";
import Database from "../../Database";
import Utils from "../../Utils";
import Constants from "../../Constants";

export default class AcceptNameChange extends Button {
    constructor() {
        super("completeFaina-", true);
    }

    public async execute(interaction: ButtonInteraction): Promise<void> {
        const discordId = interaction.customId.split("-")[1];

        await Database.run("UPDATE Users SET FainaCompleta = 1 WHERE DiscordID = ?", [discordId]);
        const user = await Database.get("SELECT * FROM Users WHERE DiscordID = ?", [discordId]);
        const name = user.NomeDeFaina;
        const newName = await Utils.getFormattedName(discordId, name);

        await interaction.guild?.members.fetch(discordId).then(async (member) => {
            await member.setNickname(newName);
            await member.roles.remove(Constants.ROLES.ALUVIAO);
            await member.roles.add(Constants.ROLES.VETERANO);
        });

        await interaction.update({ components: [], content: 'Verificação aceite!\nFaina marcada como completa!' });
    }
}
