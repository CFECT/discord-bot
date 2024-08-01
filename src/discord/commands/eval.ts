import { CommandInteraction, ButtonBuilder, ActionRowBuilder, ButtonStyle, Team, ChatInputCommandInteraction, codeBlock, GuildChannel, CategoryChannel, TextChannel, EmbedBuilder } from "discord.js";
import { Command } from "../registry/Command";
import { inspect } from "util";
import { Type } from "../../Type";

export default class EvalCommand extends Command {
    constructor() {
        super("eval", "Eval javascript code");
    }

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ ephemeral: true });

        await interaction.client.application.fetch();
        const owner = interaction.client.application.owner;
        if (!owner) {
            await interaction.editReply("Could not find bot owner.");
            return;
        }

        if (owner instanceof Team) {
            if (owner.members.size === 0) {
                await interaction.editReply("Could not find bot owner.");
                return;
            }
            if (!owner.members.has(interaction.user.id)) {
                await interaction.editReply("You are not the bot owner.");
                return;
            }
        } else {
            if (owner.id !== interaction.user.id) {
                await interaction.editReply("You are not the bot owner.");
                return;
            }
        }

        const code = interaction.options.getString("expression", true);
        const async = interaction.options.getBoolean("async", false);
        const silent = interaction.options.getBoolean("silent", false);
        const depth = interaction.options.getInteger("depth", false) ?? 0;

        let result;
        let type;
        let success = false;
        try {
            result = async ? await eval(`(async () => { ${code} })()`) : eval(code);
            type = new Type(result);

            if (typeof result !== "string") result = inspect(result, { depth });
            success = true;
        } catch (error: any) {
            result = error.stack || error.message || error;
            type = new Type(error);
        }

        if (silent) {
            await interaction.editReply("Evaluated successfully.");
            return;
        }

        if (result.length > 2000) {
            await interaction.editReply({
                files: [{
                    attachment: Buffer.from(result),
                    name: "output.txt"
                }]
            });
            return;
        }

        await type.check();

        const embed = new EmbedBuilder()
            .setAuthor({
                name: "CFECT",
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTitle(success ? "Evaluated successfully" : "An error occurred")
            .addFields({
                name: success ? "Result" : "Stack",
                value: codeBlock("ts", result)
            })
            .addFields({
                name: "Type",
                value: codeBlock("ts", type.toString())
            })
            .setColor(success ? "Green" : "Red");
        await interaction.editReply({ embeds: [embed] });
    }
}
