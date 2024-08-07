CREATE TABLE IF NOT EXISTS FainaData (
    Key TEXT PRIMARY KEY,
    Value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Users (
    DiscordID TEXT PRIMARY KEY,
    Nome TEXT NOT NULL,
    Sexo TEXT NOT NULL,
    NMec TEXT NOT NULL,
    Matricula TEXT NOT NULL,
    NomeDeFaina TEXT NOT NULL,
    FainaCompleta BOOLEAN NOT NULL,
    NumeroAluviao TEXT DEFAULT "?" NOT NULL
);

CREATE TABLE IF NOT EXISTS Verifications (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    DiscordID TEXT NOT NULL,
    Nome TEXT NOT NULL,
    Sexo TEXT NOT NULL,
    NMec TEXT NOT NULL,
    Matricula TEXT NOT NULL,
    NomeDeFaina TEXT NOT NULL,
    InteractionMessageID TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS NameChanges (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    DiscordID TEXT NOT NULL,
    NomeNovo TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Reminders (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    DiscordID TEXT NOT NULL,
    GuildID TEXT NOT NULL,
    ChannelID TEXT NOT NULL,
    MentionsIDs TEXT,
    Message TEXT NOT NULL,
    Time INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS Botes (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Author TEXT NOT NULL,
    Bote TEXT NOT NULL,
    Time INTEGER NOT NULL,
    UploaderID TEXT NOT NULL,
    UploaderName TEXT
);
