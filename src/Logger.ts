type LogTypes = 'warn' | 'error' | 'debug' | 'info';

type ColorsType = {
    [key in LogTypes]: {
        time: string;
        message: string;
    };
};

const colors: ColorsType = {
    warn: {
        time: '\x1b[43m',
        message: '\x1b[33m'
    },
    error: {
        time: '\x1b[41m',
        message: '\x1b[31m'
    },
    debug: {
        time: '\x1b[46m',
        message: '\x1b[36m'
    },
    info: {
        time: '\x1b[42m',
        message: '\x1b[32m'
    }
};

const resetColor = '\x1b[0m';

const getCurrentTime = () =>
    new Date()
        .toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
        .replace(',', '')
        .replace(/\//g, '-');

class Logger {
    log(message: string | object, type: LogTypes = 'info') {
        if (
            type === 'debug' &&
            !['True', 'true', '1'].includes(process.env.DEBUG ?? 'false')
        )
            return;
        if (typeof message === 'object') message = JSON.stringify(message);
        console.log(
            `${colors[type].time}[${getCurrentTime()}]${resetColor}${
                colors[type].message
            } ${message}${resetColor}`
        );
    }

    warn(message: string | object) {
        this.log(message, 'warn');
    }

    error(message: string | object | Error) {
        if (message instanceof Error)
            message = message.stack ?? message.message;
        this.log(message, 'error');
    }

    debug(message: string | object) {
        this.log(message, 'debug');
    }

    info(message: string | object) {
        this.log(message, 'info');
    }
}

export default new Logger();
