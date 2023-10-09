const mysql = require('mysql2/promise');
const configuration = require('../config/configuration');

async function query(sql, params, dbConfig) {
  const schemaName = !dbConfig
    ? configuration.database.connection.schema
    : dbConfig.schemaName;
  const hostName = !dbConfig
    ? configuration.database.connection.host
    : dbConfig.hostName;
  const user = !dbConfig
    ? configuration.database.connection.user
    : dbConfig.user;
  const password = !dbConfig
    ? configuration.database.connection.password
    : dbConfig.password;
  const port = !dbConfig
    ? configuration.database.connection.port
    : dbConfig.port;
  const connection = await mysql.createConnection({
    host: hostName,
    database: schemaName,
    port: port,
    user: user,
    password: password,
    namedPlaceholders: true,
  });
  const [results] = await connection.execute(sql, params);
  return results;
}

module.exports = {
  query,
};
