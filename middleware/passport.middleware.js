const config = require('../config/configuration'),
  db = require('../utils/dbAction.utils'),
  sql_Authentication = require('../modules/authentication.modules/authentication.sql'),
  sql_Property = require('../modules/property.modules/property.sql'),
  passport = require('passport'),
  GoogleStrategy = require('passport-google-oauth2').Strategy,
  MicrosoftStrategy = require('passport-microsoft').Strategy,
  LocalStrategy = require('passport-local').Strategy,
  dbEncryptKey = config.database.encryptKey;

passport.serializeUser(function (user, done) {
  console.log('serialize');
  done(null, user);
});

passport.deserializeUser(async function (user, done) {
  console.log('deserialize');
  const userID = user.usersID;
  const checkUser = await db.query(sql_Authentication.checkUserID('v1.0.0'), {
    userID,
  });
  if (checkUser.length == 0) {
    await db.query(sql_Authentication.errorLogin('v1.0.0'), { loginError });
    done(null, false, { message: loginError });
  } else {
    done(null, checkUser[0]['userData']);
  }
});

passport.use(
  new LocalStrategy(async function verify(username, password, done) {
    try {
      const checkUser = await db.query(
        sql_Authentication.checkCredentials('v1.0.0'),
        {
          username,
          password,
          dbEncryptKey,
        },
      );
      if (checkUser[0]['stat'] != 'success') {
        const loginError = checkUser[0]['stat'];
        return done(null, false, {
          message: loginError,
        });
      } else {
        const userID = checkUser[0]['userData']['usersID'];
        const getLicenseData = await db.query(
          sql_Property.getUserPropertyLicenseData('v1.0.0'),
          { userID },
        );
        const getLoggedInUsers = await db.query(
          sql_Property.getLoggedInUsers('v1.0.0'),
          { userID },
        );
        if (getLicenseData[0]['maxConCurrentUser'] === 0) {
          const loginError = 'Property do not have a valid license';
          return done(null, false, {
            message: loginError,
          });
        }
        if (
          getLoggedInUsers[0]['loggedInUsers'] >=
          getLicenseData[0]['maxConCurrentUser']
        ) {
          const loginError = 'Reached the limit of max concurrent users';
          return done(null, false, {
            message: loginError,
          });
        }
      }
      return done(null, checkUser[0]['userData']);
    } catch (ex) {
      return done(null, false, { message: ex });
    }
  }),
);

passport.use(
  new GoogleStrategy(
    {
      clientID: config.passport.google.clientId,
      clientSecret: config.passport.google.clientSecret,
      callbackURL: config.passport.google.callbackURL,
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      try {
        const email = profile.email;
        const checkUser = await db.query(
          sql_Authentication.checkEmailAddress('v1.0.0'),
          {
            email,
            dbEncryptKey,
          },
        );
        if (checkUser[0]['stat'] != 'success') {
          const loginError =
            checkUser[0]['stat'] === 'Invalid Username/Email'
              ? 'Email address is not registered'
              : checkUser[0]['stat'];
          return done(null, false, {
            message: loginError,
          });
        } else {
          const userID = checkUser[0]['userData']['usersID'];
          const getLicenseData = await db.query(
            sql_Property.getUserPropertyLicenseData('v1.0.0'),
            { userID },
          );
          const getLoggedInUsers = await db.query(
            sql_Property.getLoggedInUsers('v1.0.0'),
            { userID },
          );
          if (
            getLoggedInUsers[0]['loggedInUsers'] >=
            getLicenseData[0]['maxConCurrentUser']
          ) {
            const loginError = 'Reached the limit of max concurrent users';
            return done(null, false, {
              message: loginError,
            });
          }
        }
        return done(null, checkUser[0]['userData']);
      } catch (ex) {
        return done(null, false, { message: ex });
      }
    },
  ),
);

passport.use(
  new MicrosoftStrategy(
    {
      // Standard OAuth2 options
      clientID: config.passport.microsoft.clientId,
      clientSecret: config.passport.microsoft.clientSecret,
      callbackURL: config.passport.microsoft.callbackURL,
      scope: ['user.read'],
      tenant: 'common',
      authorizationURL:
        'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    },
    async function (request, accessToken, refreshToken, profile, done) {
      // let usersID = null;
      try {
        // console.log(profile);
        const email = profile._json.userPrincipalName
          ? profile._json.userPrincipalName
          : profile.emails[0].value;
        const checkUser = await db.query(
          sql_Authentication.checkEmailAddress('v1.0.0'),
          {
            email,
            dbEncryptKey,
          },
        );
        if (checkUser[0]['stat'] != 'success') {
          const loginError =
            checkUser[0]['stat'] === 'Invalid Username/Email'
              ? 'Email address is not registered'
              : checkUser[0]['stat'];
          return done(null, false, {
            message: loginError,
          });
        } else {
          const userID = checkUser[0]['userData']['usersID'];
          const getLicenseData = await db.query(
            sql_Property.getUserPropertyLicenseData('v1.0.0'),
            { userID },
          );
          const getLoggedInUsers = await db.query(
            sql_Property.getLoggedInUsers('v1.0.0'),
            { userID },
          );
          if (
            getLoggedInUsers[0]['loggedInUsers'] >=
            getLicenseData[0]['maxConCurrentUser']
          ) {
            const loginError = 'Reached the limit of max concurrent users';
            return done(null, false, {
              message: loginError,
            });
          }
        }
        return done(null, checkUser[0]['userData']);
      } catch (ex) {
        return done(null, false, { message: ex });
      }
    },
  ),
);
