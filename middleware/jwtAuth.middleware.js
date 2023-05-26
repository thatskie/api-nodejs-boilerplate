const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'];

  if (!token) {
    return res.status(403).send({
      status: 403,
      data: { 'error message': 'A token is required for authentication' },
      message: 'error',
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    // const decoded2 = jwt.decode(token);
    req.user = decoded;
    // console.log('Decoded JWT Token: ' + decoded);
    // console.log('Decoded JWT Token: ' + decoded2);
    // console.log('Decoded JWT Token: ' + req.user);
  } catch (err) {
    return res.status(401).send({
      status: 403,
      data: { 'error message': 'Invalid token' },
      message: 'error',
    });
  }
  return next();
};

module.exports = verifyToken;
