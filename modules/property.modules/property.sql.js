function getUserPropertyLicenseData(apiVersion) {
  switch (apiVersion) {
    default:
      return `SELECT
                COALESCE(SUM(d.conCurrentUser),0) as maxConCurrentUser,
                COALESCE(SUM(d.maxUsers),0) as maxUsers
              FROM (
                SELECT 
                  JSON_EXTRACT(readLicense(lu.license), '$.user_ConCurrent') as conCurrentUser,
                  JSON_EXTRACT(readLicense(lu.license), '$.user_ConCurrent') as maxUsers,
                  JSON_UNQUOTE(JSON_EXTRACT(readLicense(lu.license), '$.expire_at_dt')) as expiry_at
                FROM users_x_property uxp
                CROSS JOIN license_user_x_property luxp ON luxp.property_uuid = uxp.property_uuid
                CROSS JOIN license_user lu ON lu.license_id = luxp.license_uuid
                WHERE uxp.user_uuid = :userID
                GROUP BY lu.license_id
              ) d
              WHERE d.expiry_at >= now()`;
  }
}

function getLoggedInUsers(apiVersion) {
  switch (apiVersion) {
    default:
      return `SELECT
                count(*) as loggedInUsers,
                GROUP_CONCAT(d.users ORDER BY d.users ASC SEPARATOR '\n')as loggedUsers
              FROM (
                SELECT
                  s.session_id,
                  JSON_UNQUOTE(JSON_EXTRACT(session_data,'$.passport.user.usersName')) as users
                FROM users_x_property uxp
                CROSS JOIN users_x_property uxp2 ON uxp2.property_uuid = uxp.property_uuid
                LEFT JOIN user_x_role_x_property urp ON urp.user_uuid = uxp.user_uuid
                  AND urp.property_uuid = uxp.property_uuid
                LEFT JOIN sessions s ON JSON_UNQUOTE(JSON_EXTRACT(session_data,'$.passport.user.usersID'))= uxp2.user_uuid
                WHERE uxp.user_uuid = :userID
                  AND COALESCE(urp.role_level,5) > 0
                GROUP BY s.session_id
                HAVING s.session_id IS NOT NULL
              ) d`;
  }
}

function propertyData(apiVersion) {
  switch (apiVersion) {
    default:
      return `SELECT
                JSON_ARRAYAGG(
                  JSON_OBJECT(
                    'property', JSON_OBJECT(
                      'selfRegistration', self_registration_active is true,
                      'propertyID', property_uuid,
                      'propertyName', property_name,
                      'websiteURL', website,
                      'contacts', (
                        SELECT
                          JSON_ARRAYAGG(
                            JSON_OBJECT(
                              'contact', JSON_OBJECT(
                                'number',contact,
                                'type',type
                              )
                            )
                          )
                        FROM property_contact c
                        WHERE c.property_id = p.property_id
                      ),
                      'emails', (
                        SELECT
                          JSON_ARRAYAGG(
                            JSON_OBJECT(
                              'email', JSON_OBJECT(
                                'emailAddress',email,
                                'isPrimary',is_primary is true
                              )
                            )
                          )
                        FROM property_email c
                        WHERE c.property_id = p.property_id
                      ),
                      'address', JSON_OBJECT(
                        'buildingNumber', building_number,
                        'subStreet', sub_street,
                        'mainStreet', street,
                        'barangay', barangay,
                        'city', city,
                        'province', province,
                        'zipCode', zip_code,
                        'country', country
                      ),
                      'taxInfo', JSON_OBJECT(
                        'owner', JSON_OBJECT(
                          'lastName', person_last_name,
                          'firstName', person_first_name,
                          'middleName', person_middle_name,
                          'designation', person_designation,
                          'tin', person_tin
                        ),
                        'property', JSON_OBJECT(
                          'tin', property_tin,
                          'lineOfBusiness', line_business,
                          'branchCode', branch_code,
                          'rdoCode', rdo_code,
                          'classification', classification
                        )
                      ),
                      'images', JSON_OBJECT(
                        'logo', img_logo,
                        'reportLogo', img_logo_rpt,
                        'banner', img_banner
                      )
                    )
                  )
                ) as propertyList
              FROM property_masterlist p
              WHERE property_uuid MEMBER OF (:requestPropertyIDs)`;
  }
}

function checkPropertyID(apiVersion) {
  switch (apiVersion) {
    default:
      return `SELECT property_uuid FROM property_masterlist WHERE property_uuid = :propertyID`;
  }
}

function userPropertyData(apiVersion) {
  switch (apiVersion) {
    default:
      return `SELECT
                JSON_OBJECT(
                  'fullName',d.fullName,
                  'shortName',d.shortName,
                  'email',d.email,
                  'contact',d.contact,
                  'userRole',COALESCE(d.userRole,'No Assigned User Role'),
                  'accountLevel',COALESCE(d.accountLevel,'6'),
                  'Modules', JSON_ARRAYAGG(
                    JSON_OBJECT(
                      'Module', JSON_OBJECT(
                        'Description', d.description,
                        'Code', d.code,
                        'isActive', d.moduleActive is true
                      )
                    )
                  )
                ) as data
              FROM (
                SELECT
                  u.name_full as fullName,
                  u.name_short as shortName,
                  u.email,
                  u.contact,
                  r.description as userRole,
                  CAST(aes_decrypt(r.level, :dbEncryptKey) as CHAR) as accountLevel,
                  m.code,
                  m.description,
                  CASE
                    WHEN CAST(aes_decrypt(level, :dbEncryptKey) as CHAR) <= 1 THEN 1
                    WHEN rxm.role_uuid IS NOT NULL THEN 1
                    ELSE 0
                  END as moduleActive
                FROM list_users u
                LEFT JOIN users_x_roles uxr on uxr.user_uuid = u.user_uuid
                LEFT JOIN list_roles r ON r.role_uuid = uxr.role_uuid
                LEFT JOIN list_modules m ON m.is_active = 1
                LEFT JOIN roles_x_modules rxm ON rxm.module_id = m.module_id
                  AND rxm.role_uuid = r.role_uuid
                WHERE u.user_uuid = :usersID
              ) d`;
  }
}

function updateSelfRegistration(apiVersion) {
  switch (apiVersion) {
    default:
      return `UPDATE property_masterlist
              SET self_registration_active = :isActive
              WHERE property_uuid = :propertyID`;
  }
}

module.exports = {
  getUserPropertyLicenseData,
  getLoggedInUsers,
  propertyData,
  checkPropertyID,
  userPropertyData,
  updateSelfRegistration,
};
