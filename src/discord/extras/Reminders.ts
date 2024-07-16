import { Client, EmbedBuilder, TextChannel } from "discord.js";
import Database from "../../Database";

class Reminders {
    client: Client | null = null;
    reminders: Reminder[];

    constructor() {
        this.reminders = [];
    }

    public async init(client: Client) {
        this.client = client;
        this.reminders = await this.loadReminders();
        setInterval(this.checkReminders.bind(this), 1000);
    }

    async checkReminders() {
        const now = new Date().getTime();
        for (const reminder of this.reminders) {
            if (reminder.Time <= now) {
                const guild = await this.client?.guilds.fetch(reminder.GuildID);
                const channel = await guild?.channels.fetch(reminder.ChannelID) as TextChannel;
                const user = await this.client?.users.fetch(reminder.DiscordID);
                const role = reminder.RoleID ? await guild?.roles.fetch(reminder.RoleID) : null;

                const embed = new EmbedBuilder()
                    .setColor("#0099ff")
                    .setTitle("Lembrete")
                    .setDescription(reminder.Message)
                    .setFooter({
                        text: `Lembrete de ${user?.username} (${user?.id})`,
                        iconURL: user?.displayAvatarURL()
                    });

                const content = role ? `${user} | ${role}` : `${user}`;

                await channel.send({ content: content, embeds: [embed] }).then(() => {
                    this.deleteReminder(reminder);
                });

            }
        }
    }

    async loadReminders(): Promise<Reminder[]> {
        return await Database.getAll("SELECT * FROM Reminders");
    }

    public async saveReminder(discordId: string, guildId: string, channelId: string, roleId: string | null, message: string, time: number) {
        await Database.run("INSERT INTO Reminders (DiscordID, GuildID, ChannelID, RoleID, Message, Time) VALUES (?, ?, ?, ?, ?, ?)", [discordId, guildId, channelId, roleId, message, time]);
        const entry = await Database.getAll("SELECT * FROM Reminders WHERE DiscordID = ? AND Time = ?", [discordId, time]);
        const reminder = { ID: entry.at(-1).ID, DiscordID: discordId, GuildID: guildId, ChannelID: channelId, RoleID: roleId, Message: message, Time: time };
        this.reminders.push(reminder);
    }

    async deleteReminder(reminder: Reminder) {
        this.reminders = this.reminders.filter(r => r.ID !== reminder.ID);
        await Database.run("DELETE FROM Reminders WHERE ID = ?", [reminder.ID]);
    }
}

type Reminder = {
    ID: number,
    DiscordID: string,
    GuildID: string,
    ChannelID: string,
    RoleID: string | null,
    Message: string,
    Time: number
}

export default new Reminders;
