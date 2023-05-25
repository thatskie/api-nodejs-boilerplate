function getBusinessBlock(apiVersion) {
  switch (apiVersion) {
    case 'v1.0.1':
      return `SELECT 
                    id,
                    business_title,
                    account_id,
                    package_desc
                FROM bblock_data 
                LIMIT :offset,:dataPerPage`;
    default:
      return `SELECT 
                    id,
                    business_title,
                    account_id
                FROM bblock_data 
                LIMIT :offset,:dataPerPage`;
  }
}

function getBusinessBlockByID(apiVersion) {
  switch (apiVersion) {
    default:
      return `SELECT 
                    id, 
                    business_title, 
                    account_id
                FROM bblock_data 
                WHERE id = :id
                LIMIT :offset,:dataPerPage`;
  }
}

function updateBusinessBlock(apiVersion) {
  switch (apiVersion) {
    default:
      return `UPDATE bblock_data 
                SET business_title = :title, 
                business_type = :businessType, 
                package_desc = :packageDescription 
                WHERE id = :id`;
  }
}

module.exports = {
  getBusinessBlock,
  getBusinessBlockByID,
  updateBusinessBlock,
};
