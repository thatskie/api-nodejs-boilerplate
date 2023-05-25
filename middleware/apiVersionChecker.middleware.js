const verifyVersion = (req, res, next) => {
  const allowedVersion = ['v1.0.0', 'v1.0.1'];
  const version = req.params.v;
  if (!allowedVersion.includes(version)) {
    return res.status(404).send({
      status: 404,
      data: { 'error ,': 'Invalid API version' },
      message: 'error',
    });
  }
  return next();
};

module.exports = verifyVersion;
