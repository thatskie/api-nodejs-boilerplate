const db = require('../utils/dbAction.utils');
const sql = require('../modules/login.modules/login.sql');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function (user, done) {
  console.log('serialize');
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  console.log('deserialize');
  done(null, user);
});

passport.use(
  new LocalStrategy(async function verify(username, password, done) {
    try {
      const checkUser = await db.query(sql.checkCredentials('v1.0.0'), {
        username,
        password,
      });
      // console.log(checkUser);
      if (checkUser[0]['stat'] != 'success') {
        return done(null, false, { message: checkUser[0]['stat'] });
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
      clientID:
        '645166029492-d424e9q4ph0e0inv5cmc6017okafc327.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://127.0.0.1:3000/api/v1.0.0/login/google/callback',
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      try {
        // console.log(profile);
        const email = profile.email;
        const checkUser = await db.query(sql.checkEmailAddress('v1.0.0'), {
          email,
        });
        // console.log(checkUser);
        if (checkUser[0]['stat'] != 'success') {
          return done(null, false, {
            message:
              checkUser[0]['stat'] === 'Invalid Username/Email'
                ? 'Email address is not registered'
                : checkUser[0]['stat'],
          });
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
      clientID: 'e70cd292-9a6c-4e2e-8d29-17dd6912d04d',
      clientSecret: 'Qi68Q~swGGsjAswAsXI9BzplDUuetfvVgDfIbbxe',
      callbackURL: 'http://localhost:3000/api/v1.0.0/login/microsoft/callback',
      scope: ['user.read'],
      tenant: 'common',
      authorizationURL:
        'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    },
    async function (request, accessToken, refreshToken, profile, done) {
      try {
        // console.log(profile);
        const email = profile._json.userPrincipalName
          ? profile._json.userPrincipalName
          : profile.emails[0].value;
        const checkUser = await db.query(sql.checkEmailAddress('v1.0.0'), {
          email,
        });
        // console.log(checkUser);
        if (checkUser[0]['stat'] != 'success') {
          return done(null, false, {
            message:
              checkUser[0]['stat'] === 'Invalid Username/Email'
                ? 'Email address is not registered'
                : checkUser[0]['stat'],
          });
        }
        return done(null, checkUser[0]['userData']);
      } catch (ex) {
        return done(null, false, { message: ex });
      }
    },
  ),
);
