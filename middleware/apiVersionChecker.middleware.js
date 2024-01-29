const verifyVersion = (req, res, next) => {
  const allowedVersion = ['v1.0.0', 'v1.0.1'],
    version = req.params.v;
  if (!allowedVersion.includes(version)) {
    return res.status(404).send({
      status: 404,
      data: {
        error_message: 'Invalid API version',
        level: 2,
        errors: [],
      },
      message: 'error',
    });
  }
  return next();
};

module.exports = verifyVersion;
