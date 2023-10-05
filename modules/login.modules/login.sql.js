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
                        WHEN (SELECT count(user_uuid) FROM users_x_property uxp WHERE uxp.user_uuid = um.user_uuid) = 0 
                            THEN 'No property is configured for this account'
                        ELSE 'success'
                    END as stat
                FROM servo_cloud_pms.users_masterlist um
                WHERE 
                (
                    BINARY cast(aes_decrypt(um.credential_username, 'march27aug23') as char(50)) = :username
                        OR 
                    UPPER(email) = UPPER(:username)
                )`;
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
                                    'connectionPort', cast(aes_decrypt(pc.schema_password, 'port') as char)
                                )
                            )
                        )
                    )
                ) as data
            FROM users_masterlist um 
            CROSS JOIN users_x_property uxp on uxp.user_uuid = um.user_uuid
            CROSS JOIN property_masterlist pm on pm.property_uuid = uxp.property_uuid
            CROSS JOIN property_configuration pc on pc.property_uuid = pm.property_uuid
            WHERE um.user_id = :userID
            GROUP BY um.user_uuid`;
  }
}

module.exports = {
  checkCredentials,
  getPropertyData,
};
