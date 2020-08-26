const SimpleNodeLogger = require('simple-node-logger'),
    opts = {
        logFilePath: 'eventlog.log',
        timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS'
    },
    log = SimpleNodeLogger.createSimpleLogger(opts);


const infoLog = message => {
    log.info(message);
}

const warnLog = message => {
    log.warn(message);
}

module.exports = {
    infoLog,
    warnLog
}