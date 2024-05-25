// @ts-nocheck
import Constants from './Constants';
import Database from './Database.js';

class Utils {
    public static async getFormattedName(discordId: string, name: string): Promise<string> {
        for (let rank of Object.values(Constants.ranks))
            if (Object.values(rank).includes(name.split(' ')[0]))
                return name;

        const year = await Database.get("SELECT Matricula FROM Users WHERE DiscordID = ?", [discordId]);
        const sex = await Database.get("SELECT Sexo FROM Users WHERE DiscordID = ?", [discordId]);

        if (!year || !sex)
            return name;

        const rank = Constants.ranks[year][sex];

        return `${rank} ${name}`;
    }
}

export default Utils;