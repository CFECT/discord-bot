import { type ChatInputCommandInteraction } from "discord.js";
import { Command } from "../registry/Command";
import Database from "../../Database";

export default class CadernoCommand extends Command {
    constructor() {
        super("caderno", "Controla o caderno");
    }

    public async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ });

        const currentCaderno = await Database.get("SELECT * FROM FainaData WHERE Key = ?", ["caderno"]);
        let caderno = 0;
        if (!currentCaderno)
            await Database.run("INSERT INTO FainaData (Key, Value) VALUES (?, ?)", ["caderno", "0"]);
        else
            caderno = parseInt(currentCaderno.Value);

        const subcommand = interaction.options.getSubcommand(true);
        if (subcommand === "get")
            await interaction.editReply({ content: `O caderno está em **${caderno}** traços!` });
        else if (subcommand === "reset") {
            await Database.run("UPDATE FainaData SET Value = ? WHERE Key = ?", ["0", "caderno"]);
            await interaction.editReply({ content: "O caderno foi reiniciado!" });
        }
        else if (subcommand === "set") {
            const amount = interaction.options.getInteger("amount", true);
            await Database.run("UPDATE FainaData SET Value = ? WHERE Key = ?", [amount.toString(), "caderno"]);
            await interaction.editReply({ content: `O caderno foi definido para **${amount}** traços!` });
        }
        else if (subcommand === "add") {
            const amount = interaction.options.getInteger("amount", true);
            caderno -=- amount;
            await Database.run("UPDATE FainaData SET Value = ? WHERE Key = ?", [caderno.toString(), "caderno"]);
            await interaction.editReply({ content: `Foram adicionados **${amount}** traços ao caderno!\nO caderno está agora em **${caderno}** traços!`});
        }
        else if (subcommand === "remove") {
            const amount = interaction.options.getInteger("amount", true);
            caderno -= amount;
            if (caderno < 0) caderno = 0;
            await Database.run("UPDATE FainaData SET Value = ? WHERE Key = ?", [caderno.toString(), "caderno"]);
            await interaction.editReply({ content: `Foram removidos **${amount}** traços ao caderno!\nO caderno está agora em **${caderno}** traços!` });
        }
    }
}
