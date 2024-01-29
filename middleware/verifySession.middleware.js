const verifySession = async (req, res, next) => {
  // if (!req.isAuthenticated()) {
  //   res.status(401).json({
  //     status: 401,
  //     message: 'error',
  //     data: {
  //       error_message:
  //         'Restricted Access, kindly login your account to create a session',
  //     },
  //   });
  // }
  return next();
};

module.exports = verifySession;
