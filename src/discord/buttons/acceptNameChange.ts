import { ButtonInteraction, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } from "discord.js";
import { Button } from "../registry/Button";
import Database from "../../Database";

export default class AcceptNameChange extends Button {
    constructor() {
        super("acceptNameChange-", true);
    }

    public async execute(interaction: ButtonInteraction): Promise<void> {
        const id = parseInt(interaction.customId.split("-")[1]);
        const nameChange = await Database.get("SELECT * FROM NameChanges WHERE ID = ?", [id]);
        if (!nameChange) {
            await interaction.channel?.send("Name change request not found!");
            return;
        }

        await interaction.update({ components: [] });
        await interaction.followUp({ content: `Name change accepted!\nDiscord ID: ${nameChange.DiscordID}\nNew name: ${nameChange.NomeNovo}`, ephemeral: true });
    }
}
