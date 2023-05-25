const db = require('../utils/db.utils');
const helper = require('../middleware/dbHelper.middleware');
const config = require('../config/dbConfig');
const message = 'success';

async function getMultipleData(page = 1, listPerPage) {
  const datePerPage = listPerPage == null ? config.listPerPage : listPerPage;
  const offset = helper.getOffset(page, datePerPage);
  const rows = await db.query(
    `SELECT 
        id, 
        business_title, 
        account_id
    FROM bblock_data 
    LIMIT ${offset},${datePerPage}`,
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

async function getDataByID(id, page = 1, listPerPage) {
  const datePerPage = listPerPage == null ? config.listPerPage : listPerPage;
  const offset = helper.getOffset(page, datePerPage);
  const data = await db.query(
    `SELECT 
        id, 
        business_title, 
        account_id
    FROM bblock_data 
    WHERE id = :id
    LIMIT ${offset},${datePerPage}`,
    { id },
  );
  //const message = 'success';
  const status = data.length == 0 ? 204 : 200;

  return {
    status,
    data,
    message,
  };
}

async function update(id, content) {
  const {
    title,
    businessType,
    packageDescription,
    dateStart,
    reservationType,
  } = content;

  const result = await db.query(
    `UPDATE bblock_data 
    SET business_title = :title, 
      business_type = :businessType, 
      package_desc = :packageDescription 
    WHERE id = :id`,
    { title, businessType, packageDescription, id },
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
