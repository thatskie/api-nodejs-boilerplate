function logIn(apiVersion) {
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
                                'TINNumber', pm.property_tin,
                                'address', JSON_OBJECT(
                                    'buildingNumber', pm.building_number,
                                    'subStreet', pm.sub_street,
                                    'streey', pm.street,
                                    'barangay', pm.barangay,
                                    'city', pm.city,
                                    'province', pm.province,
                                    'zipCode', pm.zip_code,
                                    'country', pm.country
                                ),
                                'taxInfo', JSON_OBJECT(
                                    'lastName', pm.person_last_name,
                                    'firstName', pm.person_first_name,
                                    'middleName', pm.person_middle_name,
                                    'designation', pm.person_designation,
                                    'TINNumber', pm.person_tin,
                                    'lineOfBusiness', pm.line_business,
                                    'branchCode', pm.branch_code,
                                    'rdoCode', pm.rdo_code,
                                    'classification', pm.classification
                                ),
                                'images', JSON_OBJECT(
                                    'logo', pm.img_logo,
                                    'report', pm.img_logo_rpt,
                                    'banner', pm.img_banner
                                ),
                                'configuration', JSON_OBJECT(
                                    'hostName', cast(aes_decrypt(pc.host_name, 'march27aug23') as char),
                                    'schemaName', cast(aes_decrypt(pc.schema_name, 'march27aug23') as char),
                                    'dbUsername', cast(aes_decrypt(pc.schema_user, 'march27aug23') as char),
                                    'dbPassword', cast(aes_decrypt(pc.schema_password, 'march27aug23') as char),
                                    'connectionPort', cast(aes_decrypt(pc.schema_password, 'port') as char)
                                ),
                                'emailAddresses', (
                                    SELECT 
                                        JSON_ARRAYAGG(
                                            JSON_OBJECT(
                                                'emailAddress', JSON_OBJECT(
                                                    'email', email,
                                                    'is_primary', is_primary
                                                )
                                            )
                                        ) 
                                    FROM property_email WHERE property_id = pm.property_id
                                ),
                                'phoneNumbers', (
                                    SELECT 
                                        JSON_ARRAYAGG(
                                            JSON_OBJECT(
                                                'phoneNumber', JSON_OBJECT(
                                                    'number', contact,
                                                    'type', type
                                                )
                                            )
                                        ) 
                                    FROM property_contact WHERE property_id = pm.property_id
                                )
                            )
                        )
                    )
                ) as data
            FROM users_masterlist um 
            CROSS JOIN users_x_property uxp on uxp.user_uuid = um.user_uuid
            CROSS JOIN property_masterlist pm on pm.property_uuid = uxp.property_uuid
            CROSS JOIN property_configuration pc on pc.property_uuid = pm.property_uuid
            WHERE um.is_active = 1  
                AND 
                (    
                    (
                        BINARY cast(aes_decrypt(um.credential_username, 'march27aug23') as char(50)) = :username
                            AND
                        BINARY cast(aes_decrypt(um.credential_password, 'march27aug23') as char(50)) = :password
                    )
                        OR    
                    (
                        UPPER(um.email) = UPPER(:username)
                            AND
                        BINARY cast(aes_decrypt(um.credential_password, 'march27aug23') as char(50)) = :password)
                )
            GROUP BY um.user_uuid`;
  }
}

module.exports = {
  logIn,
};
