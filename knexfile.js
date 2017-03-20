// Update with your config settings.

var config = require("./lib/config");

var knexConfig = { };

knexConfig[config.env] = {
  client: 'pg',
  connection: config.db.url,
  //DISABLED:  searchPath: config.db.schema+',public',
  pool: {
    min: 0,
    max: 1
  },
  migrations: {
    tableName: 'migrations'
  },
  seeds: {
    directory: './seeds/'
  }
};

module.exports = knexConfig;