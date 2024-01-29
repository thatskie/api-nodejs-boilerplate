const isDevelopment =
  process.env.NODE_ENV === undefined || process.env.NODE_ENV === false || process.env.NODE_ENV.toLocaleLowerCase() === 'development' ? true : false;
module.exports = {
  isDevelopment: isDevelopment,
  passport: {
    jwt: {
      secret: process.env.JWTSecretKey || 'SetStrongSecretInDotEnv',
      options: {
        expiresIn: '12h',
        issuer: 'servo',
      },
      cookie: {
        httpOnly: true,
        sameSite: 'none',
        signed: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 12,
        path: '/',
      },
      key: 'SERVOAuth',
    },
    google: {
      clientId: process.env.GoogleClientID,
      clientSecret: process.env.GoogleClientSecret,
      callbackURL: isDevelopment
        ? process.env.GoogleCallBackURL
        : process.env.GoogleCallBackURL_LIVE,
    },
    microsoft: {
      clientId: process.env.MicrosoftClientID,
      clientSecret: process.env.MicrosoftClientSecret,
      callbackURL: isDevelopment
        ? process.env.MicrosoftCallBackURL
        : process.env.MicrosoftCallBackURL_LIVE,
    },
  },
  email: {
    SMTPHost: process.env.SMTPHost,
    SMTPPort: process.env.SMTPPort,
    SMTPUsername: process.env.SMTPUsername,
    SMTPPassword: process.env.SMTPPassword,
    SMTPSecure: process.env.SMTPSecure == 0 ? false : true,
    SMTPName: process.env.SMTPName,
  },
  database: {
    connection: {
      host: isDevelopment ? process.env.DB_HOST : process.env.DB_HOST_LIVE,
      port: isDevelopment ? process.env.DB_PORT : process.env.DB_PORT_LIVE,
      user: isDevelopment ? process.env.DB_USER : process.env.DB_USER_LIVE,
      password: isDevelopment ? process.env.DB_PASS : process.env.DB_PASS_LIVE,
      schema: isDevelopment ? process.env.DB_NAME : process.env.DB_NAME_LIVE,
    },
    listPerPage: 10,
    encryptKey: process.env.DBENCRYPT,
  },
  apiVersion: 'v1.0.105',
  cryptoJSKey: { key: 'March27Aug23', iv: 'Des1024d' },
  url: {
    frontEnd: isDevelopment ? process.env.URL_FE : process.env.URL_FE_LIVE,
  },
};
