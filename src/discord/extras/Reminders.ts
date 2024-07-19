import { Client, EmbedBuilder, GuildMember, Role, TextChannel } from "discord.js";
import Database from "../../Database";
import Logger from "../../Logger";

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
        Logger.log('Reminders initialized.');
    }

    async checkReminders() {
        const now = new Date().getTime();
        for (const reminder of this.reminders) {
            if (reminder.Time <= now) {
                const guild = await this.client?.guilds.fetch(reminder.GuildID);
                const channel = await guild?.channels.fetch(reminder.ChannelID) as TextChannel;
                const user = await this.client?.users.fetch(reminder.DiscordID);

                let memberMentions: Array<GuildMember> = [];
                let roleMentions: Array<Role> = [];

                for (const mentionId of reminder.MentionsIDs?.split(",") || []) {
                    let mention: Role | GuildMember | undefined | null = await guild?.roles.fetch(mentionId);
                    if (!mention) mention = await guild?.members.fetch(mentionId);
                    if (!mention) continue;
                    
                    if (mention instanceof Role) roleMentions.push(mention);
                    if (mention instanceof GuildMember) memberMentions.push(mention);
                }

                const embed = new EmbedBuilder()
                    .setColor("#0099ff")
                    .setTitle("Lembrete")
                    .setDescription(reminder.Message)
                    .setFooter({
                        text: `Lembrete de ${user?.username} (${user?.id})`,
                        iconURL: user?.displayAvatarURL()
                    })
                    .setTimestamp(reminder.Time);

                let content = `${user}`;
                if (memberMentions.length > 0) content += "\n" + memberMentions.map(member => member.toString()).join(" ");
                if (roleMentions.length > 0) content += "\n" + roleMentions.map(role => role.toString()).join(" ");

                await channel.send({ content: content, embeds: [embed] }).then(() => {
                    this.deleteReminder(reminder);
                });

            }
        }
    }

    async loadReminders(): Promise<Reminder[]> {
        return await Database.getAll("SELECT * FROM Reminders");
    }

    public async saveReminder(discordId: string, guildId: string, channelId: string, message: string, time: number): Promise<number> {
        await Database.run("INSERT INTO Reminders (DiscordID, GuildID, ChannelID, Message, Time) VALUES (?, ?, ?, ?, ?)", [discordId, guildId, channelId, message, time]);
        const entry = await Database.getAll("SELECT * FROM Reminders WHERE DiscordID = ? AND Time = ?", [discordId, time]);
        const entryId = entry.at(-1).ID;
        const reminder: Reminder = { ID: entryId, DiscordID: discordId, GuildID: guildId, ChannelID: channelId, Message: message, Time: time };
        this.reminders.push(reminder);
        return entryId;
    }

    public async setMentionsOnReminder(reminderId: number, mentionsIds: string[]) {
        const reminder = this.reminders.find(r => r.ID === reminderId);
        if (!reminder) return;

        reminder.MentionsIDs = mentionsIds.join(",");
        await Database.run("UPDATE Reminders SET MentionsIDs = ? WHERE ID = ?", [reminder.MentionsIDs, reminderId]);
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
    Message: string,
    Time: number
    MentionsIDs?: string,
}

export default new Reminders;
