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

        const rank = (user.FainaCompleta && user.Matricula >= 2) ? Constants.ranks[year][sex] : `[A${user.NumeroAluviao}]`

        return `${rank} ${name}`;
    }
}

export default Utils;
