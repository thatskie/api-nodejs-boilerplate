function checkCredentials(apiVersion) {
  switch (apiVersion) {
    default:
      return `SELECT
                    um.user_id,
                    CASE
                        WHEN count(*) = 0 
                            THEN 'Invalid Username/Email'
                        WHEN cast(aes_decrypt(um.credential_password, 'march27aug23') as char(50)) <> :password 
                            THEN 'Invalid Password'
                        WHEN um.is_active = 0 
                            THEN 'Account is not active'
                        WHEN (SELECT count(session_id) FROM sessions s WHERE JSON_EXTRACT(s.session_data,'$.passport.user.usersID')= um.user_uuid) > 0 
                            THEN 'Account is already logged-in on another device'
                        WHEN (SELECT count(user_uuid) FROM users_x_property uxp WHERE uxp.user_uuid = um.user_uuid) = 0 
                            THEN 'No property is configured for this account'
                        ELSE 'success'
                    END as stat,
                    JSON_OBJECT(
                        'usersID', user_uuid,
                        'usersName', name,
                        'usersEmail', email
                    ) as userData
                FROM users_masterlist um
                WHERE 
                (
                    BINARY cast(aes_decrypt(um.credential_username, 'march27aug23') as char(50)) = :username
                        OR 
                    UPPER(email) = UPPER(:username)
                )`;
  }
}

function checkEmailAddress(apiVersion) {
  switch (apiVersion) {
    default:
      return `SELECT
                    um.user_id,
                    CASE
                        WHEN count(*) = 0 
                            THEN 'Invalid Username/Email'
                        WHEN um.is_active = 0 
                            THEN 'Account is not active'
                        WHEN (SELECT count(session_id) FROM sessions s WHERE JSON_EXTRACT(s.session_data,'$.passport.user.usersID')= um.user_uuid) > 0 
                            THEN 'Account is already logged-in on another device'
                        WHEN (SELECT count(user_uuid) FROM users_x_property uxp WHERE uxp.user_uuid = um.user_uuid) = 0 
                            THEN 'No property is configured for this account'
                        ELSE 'success'
                    END as stat,
                    JSON_OBJECT(
                        'usersID', user_uuid,
                        'usersName', name,
                        'usersEmail', email
                    ) as userData
                FROM users_masterlist um
                WHERE UPPER(email) = UPPER(:email)`;
  }
}

function getPropertyData(apiVersion) {
  switch (apiVersion) {
    default:
      return `SELECT
                JSON_OBJECT(
                    'usersID', um.user_uuid,
                    'usersName', um.name,
                    'properties', JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'property', JSON_OBJECT(
                                'isDefault', uxp.is_primary is true,
                                'propertyID', pm.property_uuid,
                                'propertyName', pm.property_name,
                                'configuration', JSON_OBJECT(
                                    'hostName', cast(aes_decrypt(pc.host_name, 'march27aug23') as char),
                                    'schemaName', cast(aes_decrypt(pc.schema_name, 'march27aug23') as char),
                                    'dbUsername', cast(aes_decrypt(pc.schema_user, 'march27aug23') as char),
                                    'dbPassword', cast(aes_decrypt(pc.schema_password, 'march27aug23') as char),
                                    'connectionPort', cast(aes_decrypt(pc.schema_password, 'march27aug23') as char)
                                )
                            )
                        )
                    )
                ) as data
            FROM users_masterlist um 
            CROSS JOIN users_x_property uxp on uxp.user_uuid = um.user_uuid
            CROSS JOIN property_masterlist pm on pm.property_uuid = uxp.property_uuid
            CROSS JOIN property_configuration pc on pc.property_uuid = pm.property_uuid
            WHERE um.user_uuid = :usersID
            GROUP BY um.user_uuid`;
  }
}

function insertIntoUserDevices(apiVersion) {
  switch (apiVersion) {
    default:
      return `INSERT INTO users_devices (uuid, user_uuid, operating_system, os_version, browser, browser_version, ip_address, mac_address, verified, expire_at_dt)
            VALUES (:deviceID, :usersID, :os, :osVersion, :browser, :browserVersion, :IPAddress, :MacAddress, :verified, date_add(now(), INTERVAL 30 DAY))`;
  }
}

function checkUserDevice(apiVersion) {
  switch (apiVersion) {
    default:
      return `SELECT uuid as id FROM users_devices
            WHERE user_uuid = :usersID
                AND operating_system = :os
                AND os_version = :osVersion
                AND browser = :browser
                AND browser_version = :browserVersion
                AND ip_address = :IPAddress
                AND mac_address = :MacAddress
                AND expire_at_dt > now() 
                AND verified = 1`;
  }
}

function deleteUserDevice(apiVersion) {
  switch (apiVersion) {
    default:
      return `DELETE FROM users_devices WHERE uuid = :dataID`;
  }
}

function getSessionErrorMessage(apiVersion) {
  switch (apiVersion) {
    default:
      return `SELECT 
                JSON_UNQUOTE(JSON_EXTRACT(session_data,'$.messages[0]')) as message 
              FROM sessions 
              WHERE session_id = :sessionID`;
  }
}

function checkUserDeviceByID(apiVersion) {
  switch (apiVersion) {
    default:
      return `SELECT count(*) FROM users_devices
              WHERE uuid = :deviceID`;
  }
}

function verifyDevice(apiVersion) {
  switch (apiVersion) {
    default:
      return `UPDATE users_devices
              SET verified = 1,
                expire_at_dt = date_add(now(), INTERVAL 30 DAY)
              WHERE uuid = :deviceID`;
  }
}

module.exports = {
  checkCredentials,
  getPropertyData,
  checkEmailAddress,
  insertIntoUserDevices,
  checkUserDevice,
  deleteUserDevice,
  getSessionErrorMessage,
  checkUserDeviceByID,
};
