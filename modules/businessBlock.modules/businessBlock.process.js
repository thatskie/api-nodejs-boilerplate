const db = require('../../middleware/dbAction.middleware');
const helper = require('../../middleware/dbHelper.middleware');
const config = require('../../config/dbConfig');
const sql = require('./businessBlock.sql');
const message = 'success';

async function getMultipleData(apiVersion, page = 1, listPerPage) {
  const dataPerPage = listPerPage == null ? config.listPerPage : listPerPage;
  const offset = helper.getOffset(page, dataPerPage);
  const rows = await db.query(sql.getBusinessBlock(apiVersion), {
    offset,
    dataPerPage,
  });
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

async function getDataByID(apiVersion, id, page = 1, listPerPage) {
  const dataPerPage = listPerPage == null ? config.listPerPage : listPerPage;
  const offset = helper.getOffset(page, dataPerPage);
  const data = await db.query(sql.getBusinessBlockByID(apiVersion), {
    id,
    offset,
    dataPerPage,
  });
  const status = data.length == 0 ? 204 : 200;

  return {
    status,
    data,
    message,
  };
}

async function update(apiVersion, id, content) {
  const {
    title,
    businessType,
    packageDescription,
    dateStart,
    reservationType,
  } = content;

  const result = await db.query(sql.updateBusinessBlock(apiVersion), {
    title,
    businessType,
    packageDescription,
    id,
  });
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
