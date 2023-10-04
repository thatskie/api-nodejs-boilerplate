const verify = require('../../middleware/signature.middleware');

const systemLogIn = async (req, res, next) => {
  const { username, password, signature } = req.body;
  const body = {
    rawData: username + password,
    signature: signature,
  };
  await verify(body, 'System Log In', (err, status) => {
    if (!status) {
      res.status(401).send({
        status: 401,
        message: 'error',
        data: err,
      });
    } else {
      next();
    }
  }).catch((err) => console.log(err));
};

module.exports = systemLogIn;
