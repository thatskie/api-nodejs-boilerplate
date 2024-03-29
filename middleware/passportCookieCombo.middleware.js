const jwt = require('jsonwebtoken');
const config = require('../config/configuration');

const passportCookieCombo = (req, res, next) => {
  try {
    console.log('create cookie');
    console.log(req.user);
    jwt.sign(
      { user: req.user },
      config.passport.jwt.secret,
      config.passport.jwt.options,
      (err, JWTToken) => {
        if (err) {
          return res.status(500).send({
            status: 500,
            data: { 'error ,': err },
            message: 'error',
          });
        } else {
          // Send Set-Cookie header
          console.log('cookie created');
          console.log(JWTToken);
          res.cookie('SERVOAuth', JWTToken, {
            httpOnly: true,
            sameSite: true,
            signed: true,
            secure: true,
          });
        }
        return next();
      },
    );
  } catch (err) {
    next(err);
  }
};

module.exports = passportCookieCombo;
