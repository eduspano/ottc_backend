var config = require('./config.global.js');

// Override DEVELOPMENT config here
//
//
config.debug = true;

config.queueService = "direct";

config.db.url = "postgres://ottc:ottc@127.0.0.1:5432/ottc-dev";
//config.db.schema = "public"; // http://bernardoamc.github.io/postgres/2015/04/20/postgres-schemas/

config.smtp.url = null;//"smtp://";

module.exports = config;