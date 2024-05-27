import { ColorResolvable } from "discord.js"

type RanksType = {
    [key: number]: {
        M: string,
        F: string
    }
}

type EmbedColorsType = {
    ACCEPTED: ColorResolvable,
    DENIED: ColorResolvable
}

class Constants {
    static ranks: RanksType = {
        1: {'M': 'Lodo', 'F': 'Lama'},
        2: {'M': 'Junco', 'F': 'Caniça'},
        3: {'M': 'Moço', 'F': 'Moça'},
        4: {'M': 'Marnoto', 'F': 'Salineira'},
        5: {'M': 'Mestre', 'F': 'Mestre'}
    };

    static VERIFICATION_CHANNEL_ID = "1243703265363886190";

    static EMBED_COLORS: EmbedColorsType = {
        ACCEPTED: "#00FF00",
        DENIED: "#FF0000",
    }
}

export default Constants;
