const db = require('../utils/db.utils');
const helper = require('../middleware/dbHelper.middleware');
const config = require('../config/dbConfig');

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
  const status = rows.length == 0 ? 204 : 200;
  const data = helper.emptyOrRows(rows);
  const meta = { page };

  return {
    status,
    data,
    meta,
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
  const message = data.length == 0 ? 'No record found!' : 'Success';
  const status = data.length == 0 ? 204 : 200;

  return {
    status,
    data,
    message,
  };
}

async function update(id, data) {
  const {
    title,
    businessType,
    packageDescription,
    dateStart,
    reservationType,
  } = data;

  const result = await db.query(
    `UPDATE bblock_data 
    SET business_title = :title, 
      business_type = :businessType, 
      package_desc = :packageDescription 
    WHERE id = :id`,
    { title, businessType, packageDescription, id },
  );
  const status = result.affectedRows ? 201 : 500;
  const message = result.affectedRows
    ? 'Successfully updated Bussiness Block'
    : 'An error occured while updating Business Block';

  return {
    status,
    message,
  };
}

module.exports = {
  getMultipleData,
  getDataByID,
  update,
};
