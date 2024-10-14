import { CommandInteraction, ButtonBuilder, ActionRowBuilder, ButtonStyle, Team, ChatInputCommandInteraction, codeBlock, GuildChannel, CategoryChannel, TextChannel, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { Command } from "../registry/Command";
import { inspect } from "util";
import { Type } from "../../Type";

export default class EvalCommand extends Command {
    constructor() {
        super("eval", "Eval javascript code");
    }

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.client.application.fetch();
        const owner = interaction.client.application.owner;
        if (!owner) {
            await interaction.reply("Could not find bot owner.");
            return;
        }

        if (owner instanceof Team) {
            if (owner.members.size === 0) {
                await interaction.reply("Could not find bot owner.");
                return;
            }
            if (!owner.members.has(interaction.user.id)) {
                await interaction.reply("You are not the bot owner.");
                return;
            }
        } else {
            if (owner.id !== interaction.user.id) {
                await interaction.reply("You are not the bot owner.");
                return;
            }
        }

        const modal = new ModalBuilder()
            .setTitle("Eval")
            .setCustomId("evalModal");

        const inputCode = new TextInputBuilder()
            .setLabel("Javascript Code")
            .setCustomId("code")
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Enter you javascript code here");
        const actionRowCode = new ActionRowBuilder<TextInputBuilder>().addComponents(inputCode);

        const inputDepth = new TextInputBuilder()
            .setLabel("Depth")
            .setCustomId("depth")
            .setRequired(false)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Enter depth");
        const actionRowDepth = new ActionRowBuilder<TextInputBuilder>().addComponents(inputDepth);

        modal.addComponents(actionRowCode, actionRowDepth);
        await interaction.showModal(modal);
    }
}
