import { MentionableSelectMenuInteraction } from "discord.js";
import { MentionableSelectMenu } from "../registry/MentionableSelectMenu";
import Reminders from "../extras/Reminders";

export default class ReminderMention extends MentionableSelectMenu {
    constructor() {
        super("reminderMention-", true);
    }

    public async execute(interaction: MentionableSelectMenuInteraction): Promise<void> {
        await interaction.deferReply({ ephemeral: true });
        const reminderId = parseInt(interaction.customId.split("-")[1]);

        const rolesToMention = interaction.roles;
        const usersToMention = interaction.users;

        const values = [...rolesToMention.keys(), ...usersToMention.keys()];

        await Reminders.setMentionsOnReminder(reminderId, values);

        let content = "Menções registadas: \n";
        content += "- Cargos: " + rolesToMention.map(role => `<@&${role.id}>`).join(", ") + "\n";
        content += "- Membros: " + usersToMention.map(user => `<@${user.id}>`).join(", ");
        content += "\n\nPara remover as menções, basta desmarcar as opções acima.\n";
        content += "Para adicionar mais menções, basta selecionar mais opções acima.";

        await interaction.editReply({ content });
    }
}
