var config = require('./config.global.js');

// Override DEVELOPMENT config here
//
//
config.debug = true;

config.db.url = "postgres://ottc:ottc@127.0.0.1:5432/ottc-test";
//config.db.schema = "ottctest";
config.receiver.port = 4222;

config.queueService = "direct";

module.exports = config;