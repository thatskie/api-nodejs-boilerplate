module.exports = {
  passport: {
    jwt: {
      secret: process.env.JWTCookieComboSecretKey || 'SetStrongSecretInDotEnv',
      options: {
        //   audience: 'https://example.io',
        expiresIn: '12h',
        issuer: 'servo',
      },
      cookie: {
        httpOnly: true,
        sameSite: true,
        signed: true,
        secure: true,
      },
    },
    google: {
      clientId: process.env.GoogleClientID,
      clientSecret: process.env.GoogleClientSecret,
      callbackURL: process.env.GoogleCallBackURL,
    },
    microsoft: {
      clientId: process.env.MicrosoftClientID,
      clientSecret: process.env.MicrosoftClientSecret,
      callbackURL: process.env.MicrosoftCallBackURL,
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
      /* don't expose password or any sensitive info, done only for demo */
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      schema: process.env.DB_NAME,
    },
    listPerPage: 10,
  },
  apiVersion: 'v1.0.0',
  cryptoJSKey: { key: 'March27Aug23', iv: 'Des1024d' },
  allowedCredentials: [
    'bookingEngine',
    'bookingEngineWAN',
    'servo',
    'march27aug23',
    '91792270',
    'acea',
    'modala',
    'localhost',
  ],
};
