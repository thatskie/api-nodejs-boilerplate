const config = require('../config/configuration');
const db = require('../utils/dbAction.utils');
const sql = require('../modules/authentication.modules/authentication.sql');
const jwt = require('jsonwebtoken');
const passport = require('passport'),
  GoogleStrategy = require('passport-google-oauth2').Strategy,
  MicrosoftStrategy = require('passport-microsoft').Strategy,
  LocalStrategy = require('passport-local').Strategy,
  JwtCookieComboStrategy = require('passport-jwt-cookiecombo').Strategy;

passport.serializeUser(function (user, done) {
  console.log('serialize');
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  console.log('deserialize');
  console.log(user.usersID);
  // console.log(user);
  done(null, user);
});

passport.use(
  new JwtCookieComboStrategy(
    {
      secretOrPublicKey: config.passport.jwt.secret,
      jwtVerifyOptions: config.passport.jwt.options,
      passReqToCallback: false,
    },
    (payload, done) => {
      console.log('here JwtCookieComboStrategy');
      // console.log(payload);
      return done(null, payload.user);
    },
  ),
);

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
      clientID: config.passport.google.clientId,
      clientSecret: config.passport.google.clientSecret,
      callbackURL: config.passport.google.callbackURL,
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
