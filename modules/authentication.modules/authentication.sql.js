function checkCredentials(apiVersion) {
  switch (apiVersion) {
    default:
      return `SELECT
                    um.user_id,
                    um.user_uuid,
                    CASE
                        WHEN count(*) = 0 
                            THEN 'Invalid Username/Email'
                        WHEN BINARY CAST(aes_decrypt(um.credential_password, :dbEncryptKey) as char(45)) <> :password 
                            THEN 'Invalid Password'
                        WHEN um.is_active = 0 
                            THEN 'Account is not active'
                        WHEN (SELECT count(user_uuid) FROM users_x_property uxp WHERE uxp.user_uuid = um.user_uuid) = 0 
                            THEN 'No property is configured for this account'
                        WHEN (SELECT count(session_id) FROM sessions s WHERE JSON_UNQUOTE(JSON_EXTRACT(session_data,'$.passport.user.usersID')) = um.user_uuid AND date_add(s.timestamp, INTERVAL 12 HOUR) > now()) > 0 
                            THEN CONCAT('Account is already logged-in on another device***|***',um.user_uuid)
                        ELSE 'success'
                    END as stat,
                    JSON_OBJECT(
                        'usersID', user_uuid,
                        'usersName', name,
                        'usersEmail', email,
                        'sessionID',COALESCE((
                            SELECT session_id FROM sessions
                            WHERE JSON_UNQUOTE(JSON_EXTRACT(session_data,'$.passport.user.usersID')) = um.user_uuid
                            LIMIT 1
                        ),'')
                    ) as userData
                FROM users_masterlist um
                WHERE 
                (
                    BINARY cast(aes_decrypt(um.credential_username, :dbEncryptKey) as char(45)) = :username
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
                        WHEN (SELECT count(user_uuid) FROM users_x_property uxp WHERE uxp.user_uuid = um.user_uuid) = 0 
                            THEN 'No property is configured for this account'
                        WHEN (SELECT count(session_id) FROM sessions s WHERE JSON_UNQUOTE(JSON_EXTRACT(session_data,'$.passport.user.usersID')) = um.user_uuid AND date_add(s.timestamp, INTERVAL 12 HOUR) > now()) > 0 
                            THEN 'Account is already logged-in on another device'
                        ELSE 'success'
                    END as stat,
                    JSON_OBJECT(
                        'usersID', user_uuid,
                        'usersName', name,
                        'usersEmail', email,
                        'sessionID',COALESCE((
                            SELECT session_id FROM sessions
                            WHERE JSON_UNQUOTE(JSON_EXTRACT(session_data,'$.passport.user.usersID')) = um.user_uuid
                            LIMIT 1
                        ),'')
                    ) as userData
                FROM users_masterlist um
                WHERE UPPER(email) = UPPER(:email)`;
  }
}

function checkUserID(apiVersion) {
  switch (apiVersion) {
    default:
      return `SELECT
                JSON_OBJECT(
                    'usersID', user_uuid,
                    'usersName', name,
                    'usersEmail', email,
                    'sessionID',COALESCE((
                        SELECT session_id FROM sessions
                        WHERE JSON_UNQUOTE(JSON_EXTRACT(session_data,'$.passport.user.usersID')) = :userID
                        LIMIT 1
                    ),'')
                ) as userData
              FROM users_masterlist
              WHERE user_uuid = :userID`;
  }
}

function getSessionUserData(apiVersion) {
  switch (apiVersion) {
    default:
      return `SELECT 
                JSON_OBJECT(
                  'usersID',JSON_EXTRACT(session_data,'$.passport.user.usersID'),
                  'sessionID',:sessionID,
                  'usersName',JSON_EXTRACT(session_data,'$.passport.user.usersName'),
                  'usersEmail',JSON_EXTRACT(session_data,'$.passport.user.usersEmail')
                ) as data,
                otp
              FROM sessions 
              WHERE session_id = :sessionID`;
  }
}

function getPropertyData(apiVersion) {
  switch (apiVersion) {
    default:
      return `SELECT
                JSON_OBJECT(
                    'usersID', um.user_uuid,
                    'usersName', um.name,
                    'usersEmail', um.email,
                    'usersRoleLevel', COALESCE(MIN(urp.role_level),6),
                    'properties', JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'property', JSON_OBJECT(
                                'isDefault', uxp.is_primary is true,
                                'propertyID', pm.property_uuid,
                                'propertyName', pm.property_name,
                                'configuration', JSON_OBJECT(
                                    'hostName', cast(aes_decrypt(pc.host_name, :dbEncryptKey) as char),
                                    'schemaName', cast(aes_decrypt(pc.schema_name, :dbEncryptKey) as char),
                                    'dbUsername', cast(aes_decrypt(pc.schema_user, :dbEncryptKey) as char),
                                    'dbPassword', cast(aes_decrypt(pc.schema_password, :dbEncryptKey) as char),
                                    'connectionPort', cast(aes_decrypt(pc.port, :dbEncryptKey) as char)
                                )
                            )
                        )
                    )
                ) as data
            FROM users_masterlist um 
            CROSS JOIN users_x_property uxp on uxp.user_uuid = um.user_uuid
            CROSS JOIN property_masterlist pm on pm.property_uuid = uxp.property_uuid
            CROSS JOIN property_configuration pc on pc.property_uuid = pm.property_uuid
            LEFT JOIN user_x_role_x_property urp on urp.user_uuid = um.user_uuid
              AND urp.property_uuid = pm.property_uuid
            WHERE um.user_uuid = :usersID 
              OR um.user_uuid IN (
                SELECT 
                  JSON_UNQUOTE(JSON_EXTRACT(session_data,'$.passport.user.usersID')) 
                FROM sessions 
                WHERE session_id = :sessionID
                )
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
      return `SELECT uuid as id, verified, if(now()>expire_at_dt,1,0) as expired FROM users_devices
              WHERE user_uuid = :usersID
                AND operating_system = :os
                AND os_version = :osVersion
                AND browser = :browser
                AND browser_version = :browserVersion
                AND ip_address = :IPAddress
                AND mac_address = :MacAddress`;
  }
}

function updateActiveDevice(apiVersion) {
  switch (apiVersion) {
    default:
      return `UPDATE users_devices
              SET active = 1
              WHERE user_uuid = :usersID
                AND operating_system = :os
                AND os_version = :osVersion
                AND browser = :browser
                AND browser_version = :browserVersion
                AND ip_address = :IPAddress
                AND mac_address = :MacAddress`;
  }
}

function markAllDeviceAsInactive(apiVersion) {
  switch (apiVersion) {
    default:
      return `UPDATE users_devices
              SET active = 0
              WHERE user_uuid = :usersID`;
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
                JSON_UNQUOTE(JSON_EXTRACT(session_data,'$.messages[0]')) as message,
                count(*) as cnt
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
                expire_at_dt = date_add(now(), INTERVAL 30 DAY),
                active = 1
              WHERE uuid = :deviceID`;
  }
}

function deleteSession(apiVersion) {
  switch (apiVersion) {
    default:
      return `DELETE FROM sessions 
              WHERE JSON_UNQUOTE(JSON_EXTRACT(session_data,'$.passport.user.usersID')) = :userID 
              OR isnull(JSON_UNQUOTE(JSON_EXTRACT(session_data,'$.passport.user')))`;
  }
}

// function errorLogin(apiVersion) {
//   switch (apiVersion) {
//     default:
//       return `INSERT INTO login_error (error,users_uuid) VALUES (:loginError, :usersID)`;
//   }
// }

// function deleteLoginError(apiVersion) {
//   switch (apiVersion) {
//     default:
//       return `DELETE FROM login_error WHERE timestamp <= date_sub(now(), INTERVAL 2 MINUTE)`;
//   }
// }

// function getLogInErrorMessage(apiVersion) {
//   switch (apiVersion) {
//     default:
//       return `SELECT
//                 error as errorMessage,
//                 users_uuid as usersID
//               FROM login_error
//               WHERE timestamp >= date_sub(now(), INTERVAL 30 SECOND)
//               ORDER BY id DESC
//               LIMIT 1`;
//   }
// }

function getEmailContent(apiVersion) {
  switch (apiVersion) {
    default:
      return `SELECT 
                subject, 
                createEmailBody(body) as content 
              FROM email_prompts
              WHERE name = :emailName`;
  }
}

function getUsersDevice(apiVersion) {
  switch (apiVersion) {
    default:
      return `SELECT
                CONCAT(operating_system,' (',os_version,')') as os,
                CONCAT(browser,' [',browser_version,']') as browser
              FROM users_devices 
              WHERE user_uuid = :usersID 
                AND active = 1`;
  }
}

function updateSessionOTP(apiVersion) {
  switch (apiVersion) {
    default:
      return `UPDATE sessions 
              SET otp = :verificationCode
              WHERE session_id = :sessionID`;
  }
}

function getUsersSession(apiVersion) {
  switch (apiVersion) {
    default:
      return `SELECT 
                session_id,
                JSON_UNQUOTE(JSON_EXTRACT(session_data,'$.passport.user.usersName')) as usersName,
                JSON_UNQUOTE(JSON_EXTRACT(session_data,'$.passport.user.usersEmail')) as usersEmail
              FROM sessions
              WHERE JSON_UNQUOTE(JSON_EXTRACT(session_data,'$.passport.user.usersID')) = :usersID`;
  }
}

function deleteSessionBySessionID(apiVersion) {
  switch (apiVersion) {
    default:
      return `DELETE FROM sessions 
              WHERE session_id = :sessionID `;
  }
}

module.exports = {
  getEmailContent,
  checkCredentials,
  getPropertyData,
  checkEmailAddress,
  insertIntoUserDevices,
  checkUserDevice,
  deleteUserDevice,
  getSessionErrorMessage,
  checkUserDeviceByID,
  verifyDevice,
  checkUserID,
  deleteSession,
  getSessionUserData,
  // errorLogin,
  // getLogInErrorMessage,
  // deleteLoginError,
  updateActiveDevice,
  markAllDeviceAsInactive,
  getUsersDevice,
  updateSessionOTP,
  getUsersSession,
  deleteSessionBySessionID,
};
