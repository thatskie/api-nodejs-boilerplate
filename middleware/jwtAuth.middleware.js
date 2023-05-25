const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token =
    req.body.token ||
    req.query.token ||
    req.params.token ||
    req.headers['x-access-token'];

  if (!token) {
    return res.status(403).send({
      status: 403,
      data: { 'error ,': 'A token is required for authentication' },
      message: 'error',
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    req.user = decoded;
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
