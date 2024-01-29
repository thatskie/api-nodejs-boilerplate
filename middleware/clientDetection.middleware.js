const parser = require('ua-parser-js'),
  getmac = require('getmac');
const verifyClient = (req, res, next) => {
  const client = parser(req.headers['user-agent']);
  client.IPAddress = req.ip;
  client.MacAddress = getmac.default();
  req.userClient = client;
  return next();
};

module.exports = verifyClient;
