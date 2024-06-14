import { readFileSync } from 'fs';
import { Client } from 'node-scp';
import dotenv from 'dotenv';

dotenv.config();

class Backup {
    constructor() {
        this.initialized = false;
        this.backupEnabled = process.env.BACKUP_ENABLED === 'true';
        if (this.backupEnabled) this.init();
    }

    async init() {
        try {
            this.client = await Client({
                host: '100.64.1.1',
                port: 22,
                username: 'cfect-backup',
                privateKey: readFileSync(process.env.SSH_KEY_PATH),
                // passphrase: 'your key passphrase',
            });
            this.initialized = true;
        } catch (err) {
            console.error(err);
        }
    }

    async sendFile(fileName, remotePath) {
        if (!this.backupEnabled) return;
        while (!this.initialized) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        try {
            await this.client.uploadFile(fileName, '/mnt/external/Backups/CFECT/' + remotePath);
        } catch (err) {
            console.error(err);
        }
    }
}

export default new Backup();
