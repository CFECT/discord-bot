import sqlite3 from 'sqlite3';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import Logger from './Logger';
import Backup from './Backup';

class Database {
    constructor() {
        this.db = new sqlite3.Database(resolve(__dirname, "..", "database.db"), (err) => {
            if (err) throw new Error(err);
        });
        this.backupdb = new sqlite3.Database(resolve(__dirname, "..", "backup.db"), (err) => {
            if (err) throw new Error(err);
        });
    }

    async init() {
        const commandsToExecute = readFileSync(resolve(__dirname, "..", "init.sql"), 'utf-8').split(';').map((command) => command.trim()).filter((command) => command.length > 0);
        for (const command of commandsToExecute) {
            await this.run(command);
        }
        Logger.log('Database initialized.');

        this.backup();
    }

    backup() {
        this.backupTable('Users').then(Backup.sendFile(resolve(__dirname, "..", "backup.db"), `backup-${Date.now()}.db`)).catch(console.error);
        setTimeout(this.backup, 1000 * 60 * 60 * 12); // Backup every 12 hours
    }

    backupTable(tableName) {
        return new Promise((resolvePromise, reject) => {
            // Step 1: Fetch data from the table in the main database
            this.db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
                if (err) {
                    return reject(`Failed to fetch data from table ${tableName}: ${err.message}`);
                }

                if (rows.length === 0) {
                    return resolvePromise(`No data found in table ${tableName} to backup.`);
                }

                // Step 2: Prepare the data for insertion into the backup database
                this.backupdb.run(`DROP TABLE IF EXISTS ${tableName}`);
                const commandsToExecute = readFileSync(resolve(__dirname, "..", "backup.sql"), 'utf-8').split(';').map((command) => command.trim()).filter((command) => command.length > 0);
                for (const command of commandsToExecute) {
                    this.backupdb.run(command);
                }
                const columns = Object.keys(rows[0]);
                const placeholders = columns.map(() => '?').join(',');
                const insertQuery = `INSERT INTO ${tableName} (${columns.join(',')}) VALUES (${placeholders})`;

                this.backupdb.serialize(() => {
                    // Begin transaction
                    this.backupdb.run('BEGIN TRANSACTION');

                    const stmt = this.backupdb.prepare(insertQuery);

                    // Step 3: Insert data into the backup database
                    rows.forEach(row => {
                        const values = columns.map(col => row[col]);
                        stmt.run(values, err => {
                            if (err) {
                                this.backupdb.run('ROLLBACK');
                                return reject(`Failed to insert data into backup table ${tableName}: ${err.message}`);
                            }
                        });
                    });

                    stmt.finalize(err => {
                        if (err) {
                            this.backupdb.run('ROLLBACK');
                            return reject(`Failed to finalize statement for backup table ${tableName}: ${err.message}`);
                        }

                        // Commit transaction
                        this.backupdb.run('COMMIT', err => {
                            if (err) {
                                return reject(`Failed to commit transaction for backup table ${tableName}: ${err.message}`);
                            }

                            resolvePromise(`Backup of table ${tableName} completed successfully.`);
                        });
                    });
                });
            });
        });
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
