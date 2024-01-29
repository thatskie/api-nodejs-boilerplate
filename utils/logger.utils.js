const config = require('../config/configuration');
const isDevelopment = config.isDevelopment;

const Logger = function () {};

Logger.prototype.require = function (logText) {
    console.log(`${new Date()} \n${logText}`);
};

Logger.prototype.log = function (logText) {
    if (isDevelopment !== false) {
        console.log(`${logText}`);
    }
};

Logger.prototype.info = function (logText) {
    if (isDevelopment !== false) {
        console.log(`Info:::::${logText}`);
    }
};

Logger.prototype.debug = function (logText) {
    if (isDevelopment !== false) {
        console.log(`Debug:::::${logText}`);
    }
};

Logger.prototype.error = function (logText) {
    console.log(`${new Date()} \nError:::::${logText}`);
};

module.exports = new Logger();