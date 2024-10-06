import sqlite3 from 'sqlite3';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import Logger from './Logger';

class Database {
    constructor() {
        this.db = new sqlite3.Database(resolve(__dirname, "..", "database.db"), (err) => {
            if (err) throw new Error(err);
        });
    }

    async init() {
        const commandsToExecute = readFileSync(resolve(__dirname, "..", "init.sql"), 'utf-8').split(';').map((command) => command.trim()).filter((command) => command.length > 0);
        for (const command of commandsToExecute) {
            await this.run(command);
        }
        Logger.log('Database initialized.');
    }

    /**
     * @param {string} query The query to execute.
     * @returns {Promise<any>}
     */
    run(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(query, params, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }

    /**
     * @param {string} query The query to execute.
     * @returns {Promise<any>}
     */
    get(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(query, params, (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    /**
     * @param {string} query The query to execute.
     * @returns {Promise<any>}
     */
    getAll(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(query, params, (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }
}

export default new Database();
