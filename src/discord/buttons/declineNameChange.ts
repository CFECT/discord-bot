import { ButtonInteraction, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } from "discord.js";
import { Button } from "../registry/Button";

export default class DeclineNameChange extends Button {
    constructor() {
        super("declineNameChange-", true);
    }

    public async execute(interaction: ButtonInteraction): Promise<void> {
        interaction.channel?.send("Declined name change!");
        interaction.update({ components: [] });
    }
}
