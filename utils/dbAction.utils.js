const mysql = require('mysql2/promise');
const config = require('../config/configuration');
const encryption = require('./cryptoJS.utils');

async function query(sql, params, dbConfig) {
  const useDBConfig = dbConfig
    ? JSON.parse(encryption.decryptString(dbConfig))
    : false;
  const isArray =
    sql instanceof Array === 'false' || sql instanceof Array === false
      ? false
      : true;
  const querySQL = isArray ? sql[0] : sql;
  const outputSQL = isArray ? sql[1] : null;
  const schemaName =
    useDBConfig === false
      ? config.database.connection.schema
      : useDBConfig.schemaName;
  const hostName =
    useDBConfig === false
      ? config.database.connection.host
      : useDBConfig.hostName;
  const user =
    useDBConfig === false
      ? config.database.connection.user
      : useDBConfig.dbUsername;
  const password =
    useDBConfig === false
      ? config.database.connection.password
      : useDBConfig.dbPassword;
  const port =
    useDBConfig === false
      ? config.database.connection.port
      : useDBConfig.connectionPort;
  const connection = await mysql.createConnection({
    host: hostName,
    database: schemaName,
    port: port,
    user: user,
    password: password,
    namedPlaceholders: true,
  });
  const [results] = await connection.execute(querySQL, params);
  if (!isArray) {
    connection.end();
    return results;
  } else {
    const [outVariable] = await connection.query(outputSQL);
    connection.end();
    return {
      results,
      outVariable,
    };
  }
}

module.exports = {
  query,
};
