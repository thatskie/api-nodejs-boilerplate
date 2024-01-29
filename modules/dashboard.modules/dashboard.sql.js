function usersManagement(apiVersion) {
  switch (apiVersion) {
    default:
      return `SELECT
                max(d.activeUsers) as activeUsers,
                max(d.inactiveUsers) as inactiveUsers,
                max(d.activeRoles) as activeRoles,
                max(d.inactiveRoles) as inactiveRoles,
                max(d.usersWithRoles) as usersWithRoles,
                max(d.usersWithoutRoles) as usersWithoutRoles,
                (
                  SELECT 
                    JSON_ARRAYAGG(
                      JSON_OBJECT(
                        'label', r.description,
                        'value', COALESCE((SELECT count(*) FROM users_x_roles uxr WHERE uxr.role_uuid = r.role_uuid),0)
                      )
                    ) as data
                  FROM list_roles r
                ) as pieRoleData,
                (
                  SELECT 
                    JSON_ARRAYAGG(
                      JSON_OBJECT(
                        'userID', user_uuid,
                        'user', name_full
                      )
                    ) as data
                  FROM list_users
                  WHERE user_uuid NOT IN (SELECT user_uuid FROM users_x_roles)
                ) as tableUserWithOutRoles,
                (
                  SELECT 
                    JSON_ARRAYAGG(
                      JSON_OBJECT(
                        'userID', user_uuid,
                        'user', name_full
                      )
                    ) as data
                  FROM list_users
                  ORDER BY user_id DESC 
                  LIMIT 5
                ) as tableNewlyAddedUsers,
                (
                  SELECT 
                    JSON_ARRAYAGG(
                      JSON_OBJECT(
                        'roleID', role_uuid,
                        'description', description
                      )
                    ) as data
                  FROM list_roles
                  WHERE role_uuid NOT IN (SELECT role_uuid FROM roles_x_priv)
                    AND is_active = 1
                    AND cast(aes_decrypt(level, :dbEncryptKey) as char) > 1
                ) as tableRolesWithoutPrivs
              FROM(
                SELECT
                  sum(if(is_active=1,1,0)) as activeUsers,
                  sum(if(is_active=0,1,0)) as inactiveUsers,
                  0 as activeRoles,
                  0 as inactiveRoles,
                  0 as usersWithRoles,
                  0 as usersWithoutRoles
                FROM list_users
                  UNION ALL
                SELECT
                  0 as activeUsers,
                  0 as inactiveUsers,
                  sum(if(is_active=1,1,0)) as activeRoles,
                  sum(if(is_active=0,1,0)) as inactiveRoles,
                  0 as usersWithRoles,
                  0 as usersWithoutRoles
                FROM list_roles
                  UNION ALL
                SELECT
                  0 as activeUsers,
                  0 as inactiveUsers,
                  0 as activeRoles,
                  0 as inactiveRoles,
                  count(uxr.user_uuid) as usersWithRoles,
                  count(lu.user_uuid) - count(uxr.user_uuid) as usersWithoutRoles
                FROM list_users lu
                LEFT JOIN users_x_roles uxr ON lu.user_uuid = uxr.user_uuid
              ) d`;
  }
}

function usersManagementSessions(apiVersion) {
  switch (apiVersion) {
    default:
      return `SELECT
                JSON_ARRAYAGG(
                  JSON_OBJECT(
                    'userID', userID,
                    'user', usersName,
                    'loginTime', ldt
                  )
                ) as tableActiveSessions
              FROM (
                SELECT
                  uxp.user_uuid as userID,
                  JSON_UNQUOTE(JSON_EXTRACT(session_data,'$.passport.user.usersName')) as usersName,
                  date_format(timestamp, '%b %d, %Y %h:%i%p') as ldt
                FROM sessions s, users_x_property uxp
                WHERE uxp.user_uuid = JSON_UNQUOTE(JSON_EXTRACT(s.session_data,'$.passport.user.usersID'))
                AND uxp.property_uuid MEMBER OF (:requestPropertyIDs)
                GROUP BY uxp.user_uuid
              ) d`;
  }
}

module.exports = {
  usersManagement,
  usersManagementSessions,
};
