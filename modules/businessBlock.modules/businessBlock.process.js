const db = require('../../utils/dbAction.utils');
const helper = require('../../utils/dbHelper.utils');
const config = require('../../config/dbConfig');
const sql = require('./businessBlock.sql');
const message = 'success';

async function getMultipleData(apiVersion, page, limit, dbConfig) {
  const paginationLimit = !limit ? config.listPerPage : limit;
  const offset = helper.getOffset(!page ? 1 : page, paginationLimit);
  const rows = await db.query(
    sql.getBusinessBlock(apiVersion),
    {
      offset,
      paginationLimit,
    },
    dbConfig,
  );
  const dataCount = rows.length;
  const status = dataCount == 0 ? 204 : 200;
  const data = {
    businessBlocks: helper.emptyOrRows(rows),
    page,
    dataCount,
  };
  return {
    status,
    data,
    message,
  };
}

async function getDataByID(apiVersion, id, page, limit, dbConfig) {
  const paginationLimit = !limit ? config.listPerPage : limit;
  const offset = helper.getOffset(!page ? 1 : page, paginationLimit);
  const data = await db.query(
    sql.getBusinessBlockByID(apiVersion),
    {
      id,
      offset,
      paginationLimit,
    },
    dbConfig,
  );
  const status = data.length == 0 ? 204 : 200;

  return {
    status,
    data,
    message,
  };
}

async function update(apiVersion, id, content, dbConfig) {
  const {
    title,
    businessType,
    packageDescription,
    dateStart,
    reservationType,
  } = content;

  const result = await db.query(
    sql.updateBusinessBlock(apiVersion),
    {
      title,
      businessType,
      packageDescription,
      id,
    },
    dbConfig,
  );
  console.log(result);
  const status = 201;
  const data = 'Successfully updated Bussiness Block';

  return {
    status,
    message,
    data,
  };
}

module.exports = {
  getMultipleData,
  getDataByID,
  update,
};
