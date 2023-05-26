const mysql = require('mysql2/promise');
const config = require('../config/dbConfig');

async function query(sql, params, dbConfig) {
  const schemaName = !dbConfig ? config.db.database : dbConfig.schemaName;
  const hostName = !dbConfig ? config.db.host : dbConfig.hostName;
  const connection = await mysql.createConnection({
    host: hostName,
    database: schemaName,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    namedPlaceholders: true,
  });
  const [results] = await connection.execute(sql, params);
  return results;
}

module.exports = {
  query,
};
