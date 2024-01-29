function insertToUserRoles(apiVersion) {
  switch (apiVersion) {
    default:
      return `INSERT IGNORE INTO list_roles (role_uuid, description, level, is_active)
              VALUES (:roleID, :description, aes_encrypt(:level, :dbEncryptKey), 1)`;
  }
}

function updateUserRoles(apiVersion) {
  switch (apiVersion) {
    default:
      return `UPDATE list_roles
              SET description = COALESCE(:updatedDescription,description),
                level = aes_encrypt(COALESCE(:updatedLevel,cast(aes_decrypt(level, :dbEncryptKey) as char)),:dbEncryptKey),
                is_active = COALESCE(:updatedIsActive,is_active)
              WHERE role_uuid = :roleID`;
  }
}

function deleteRolesInUsers(apiVersion) {
  switch (apiVersion) {
    default:
      return `DELETE FROM users_x_roles WHERE role_uuid = :roleID`;
  }
}

function getUserRoleLevel(apiVersion) {
  switch (apiVersion) {
    default:
      return `SELECT
                CAST(aes_decrypt(lr.level, :dbEncryptKey) AS CHAR) as roleLevel
              FROM users_x_roles uxr, list_roles lr
              WHERE uxr.role_uuid = lr.role_uuid
              AND uxr.user_uuid = :usersID`;
  }
}

function getRoleLevel(apiVersion) {
  switch (apiVersion) {
    default:
      return `SELECT
                CAST(aes_decrypt(level, :dbEncryptKey) AS CHAR) as roleLevel
              FROM list_roles
              WHERE role_uuid = :roleID`;
  }
}

function getRoles(apiVersion) {
  switch (apiVersion) {
    default:
      return `SELECT
                r.role_uuid as roleID,
                r.description,
                r.is_active as isActive,
                CAST(aes_decrypt(r.level, :dbEncryptKey) AS CHAR) as level,
                CASE
                  WHEN CAST(aes_decrypt(r.level, :dbEncryptKey) AS CHAR) = 1 THEN '** All Modules **'
                  ELSE
                  (
                    SELECT
                      COALESCE(GROUP_CONCAT(DISTINCT lm.code),'** No Configured Modules **')
                    FROM roles_x_priv rxp
                    LEFT JOIN list_modules  lm on lm.module_id = rxp.module_id
                      AND lm.is_active = 1
                    WHERE rxp.role_uuid = r.role_uuid
                  )
                END as modules,
                (
                  SELECT
                    JSON_ARRAYAGG(
                      JSON_OBJECT(
                        'privilege', JSON_OBJECT(
                          'moduleCode',lp.module_code,
                          'privCode',lp.code
                        )
                      )
                    )
                  FROM roles_x_priv rxp, list_priv lp
                  WHERE rxp.priv_id = lp.priv_id
                  AND rxp.role_uuid = r.role_uuid
                ) as privileges
              FROM list_roles r
              WHERE CAST(aes_decrypt(r.level, :dbEncryptKey) AS CHAR) > 0`;
  }
}

function getRoleDataByRoleID(apiVersion) {
  switch (apiVersion) {
    default:
      return `SELECT
                description,
                CAST(aes_decrypt(level, :dbEncryptKey) AS CHAR) as roleLevel
              FROM list_roles
              WHERE role_uuid = :roleID`;
  }
}

function getUserRolePrivs(apiVersion) {
  switch (apiVersion) {
    default:
      return `SELECT
                JSON_ARRAYAGG(
                  JSON_OBJECT(
                  'module', JSON_OBJECT(
                      'moduleID', d.module_id,
                      'code', d.code,
                      'description', d.description,
                      'isActive', d.moduleActive is true,
                      'privileges',d.privileges
                    )
                  )
                ) as data
              FROM (
                SELECT
                  lm.module_id,
                  lm.code,
                  lm.description,
                  JSON_ARRAYAGG(
                    JSON_OBJECT(
                      'privilege', JSON_OBJECT(
                        'privID', lp.priv_id,
                        'caption', lp.caption,
                        'description', lp.description,
                        'type', lp.priv_type,
                        'active', CASE
                          WHEN :roleLevel <= 1 THEN 1
                          WHEN rxp.priv_id IS NOT NULL THEN 1
                          ELSE 0
                        END is true
                      )
                    )
                  ) as privileges,
                  CASE
                    WHEN :roleLevel <= 1 THEN 1
                    WHEN sum(if(rxp.priv_id IS NULL,0,1)) > 0 THEN 1
                    ELSE 0
                  END as moduleActive
                FROM list_modules lm
                CROSS JOIN list_priv lp ON lp.module_code = lm.code
                  AND lp.is_active = 1
                LEFT JOIN roles_x_priv rxp ON rxp.priv_id = lp.priv_id
                  AND rxp.module_id = lm.module_id
                  AND rxp.role_uuid = :roleID
                WHERE lm.is_active = 1
                GROUP BY lm.code
              ) d
              WHERE d.code MEMBER OF (:selectedModules)`;
  }
}

function getUserRolesActiveModules(apiVersion) {
  switch (apiVersion) {
    default:
      return `SELECT
                JSON_ARRAYAGG(d.code) as modules
              FROM (
                SELECT
                  CASE
                    WHEN CAST(aes_decrypt(lr.level, :dbEncryptKey) AS CHAR) <= 1 THEN 1
                    WHEN COALESCE((SELECT 
                      count(*) 
                      FROM roles_x_priv
                      WHERE module_id = lm.module_id
                      AND role_uuid = lr.role_uuid),0) > 0 THEN 1
                    ELSE 0
                  END as active,
                  lm.code
                FROM users_x_roles uxr
                CROSS JOIN list_modules lm
                CROSS JOIN list_roles lr ON uxr.role_uuid = lr.role_uuid
                WHERE uxr.user_uuid = :usersID
                AND lm.is_active = 1
              ) d
              WHERE d.active = 1`;
  }
}

function updatePrivOfUserRole(apiVersion) {
  switch (apiVersion) {
    default:
      return `CALL fn_userRole_updatePriv(:roleID, :usersID, :jsonData)`;
  }
}

module.exports = {
  insertToUserRoles,
  updateUserRoles,
  deleteRolesInUsers,
  getUserRoleLevel,
  getRoleLevel,
  getRoles,
  getUserRolePrivs,
  getRoleDataByRoleID,
  getUserRolesActiveModules,
  updatePrivOfUserRole,
};
