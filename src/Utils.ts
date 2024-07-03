import { GuildMember } from 'discord.js';
import Constants from './Constants';
import Database from './Database.js';

class Utils {
    public static async getFormattedName(discordId: string, name: string): Promise<string> {
        const user = await Database.get("SELECT * FROM Users WHERE DiscordID = ?", [discordId]);
        if (!user)
            return name;

        const year = user.Matricula >= 5 ? 5 : user.Matricula as number;
        const sex = user.Sexo === 'F' ? 'F' : 'M';

        for (let rank of Object.values(Constants.ranks))
            if (Object.values(rank).includes(name.split(' ')[0]))
                name = name.split(' ').slice(1).join(' ');

        const rank = user.FainaCompleta ? Constants.ranks[year][sex] : `[A${user.NumeroAluviao}]`

        return `${rank} ${name}`;
    }

    public static async getFormattedNameFromUser(user: GuildMember): Promise<string> {
        const userDb = await Database.get("SELECT * FROM Users WHERE DiscordID = ?", [user.id]);
        if (!userDb)
            return await Utils.getFormattedName(user.id, user.user.username);

        const year = userDb.Matricula >= 5 || userDb.Matricula <= 0 ? 5 : userDb.Matricula as number;
        const sex = userDb.Sexo === 'F' ? 'F' : 'M';
        const name = userDb.NomeDeFaina;

        const rank = userDb.FainaCompleta ? Constants.ranks[year][sex] : `[A${userDb.NumeroAluviao}]`

        return `${rank} ${name}`;
    }

    public static async updateNickname(user: GuildMember): Promise<void> {
        const newName = await Utils.getFormattedNameFromUser(user);
        await user.setNickname(newName);
    }
}

export default Utils;
