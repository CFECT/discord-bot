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
                .setTimestamp(bote.Time);

            const jointUploader = await Database.get("SELECT * FROM Botes LEFT OUTER JOIN Users ON UploaderID=DiscordID");

            if (jointUploader.DiscordID) {
                const uploader = await interaction.guild?.members.fetch(jointUploader.DiscordID)!;
                embed.setFooter({
                    text: "Registado por " + uploader.displayName,
                    iconURL: uploader.user.displayAvatarURL()
                })
            } else {
                embed.setFooter({
                    text: "Registado por " + bote.UploaderName,
                    iconURL: "https://cdn.discordapp.com/embed/avatars/1.png"
                })
            }

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
            const uploader = interaction.member as GuildMember;

            await Database.run("INSERT INTO Botes (Author, Bote, Time, UploaderID) VALUES (?, ?, ?, ?)", [autor, bote, timestamp, uploader.id]);
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
                    text: "Registado por " + uploader.displayName,
                    iconURL: uploader.user.displayAvatarURL()
                })
                .setTimestamp(timestamp);

            await interaction.editReply({ embeds: [embed] });
        }
    }
}
