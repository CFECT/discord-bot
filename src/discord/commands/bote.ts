import { EmbedBuilder, GuildMember, type ChatInputCommandInteraction } from "discord.js";
import { Command } from "../registry/Command";
import Database from "../../Database";
import Constants from "../../Constants";

export default class BoteCommand extends Command {
    constructor() {
        super("bote", "Botes");
    }

    public async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({});

        const subcommand = interaction.options.getSubcommand(true);
        if (subcommand === "random") {
            const bote = await Database.get("SELECT * FROM Botes ORDER BY RANDOM() LIMIT 1");
            if (!bote) {
                await interaction.editReply("Não há botes registados.");
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle("Bote #" + bote.ID)
                .setColor("#0099ff")
                .addFields({
                    name: "Autor",
                    value: bote.Author
                })
                .addFields({
                    name: "Bote",
                    value: bote.Bote
                })
                .setFooter({
                    text: "Registado por " + bote.Uploader,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp(bote.Time);

            await interaction.editReply({ embeds: [embed] });
        }
        else if (subcommand == "add") {
            if (!(interaction.member as GuildMember).roles.cache.has(Constants.ROLES.VETERANO)) {
                await interaction.editReply("Só veteranos têm o direito e a honra de registar botes no glorioso caderno de botes de ECT.");
                return;
            }

            const autor = interaction.options.getString("autor", true);
            const bote = interaction.options.getString("bote", true);
            const timestamp = Date.now();
            const uploader = (interaction.member as GuildMember).displayName;

            await Database.run("INSERT INTO Botes (Author, Bote, Time, Uploader) VALUES (?, ?, ?, ?)", [autor, bote, timestamp, uploader]);
            const boteId = (await Database.get("SELECT * FROM Botes Where Time = ?", [timestamp])).ID;

            if (!boteId) {
                await interaction.editReply("Ocorreu um erro ao registar o bote.");
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle("Bote #" + boteId)
                .setColor("#0099ff")
                .addFields({
                    name: "Autor",
                    value: autor
                })
                .addFields({
                    name: "Bote",
                    value: bote,
                })
                .setFooter({
                    text: "Registado por " + uploader,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp(timestamp);

            await interaction.editReply({ embeds: [embed] });
        }
    }
}
