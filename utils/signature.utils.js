const crypto = require('crypto');

const verify = async (body, callback) => {
  const { rawData, signature } = body;
  const hash = crypto.createHash('sha512').update(rawData).digest('hex');
  signature == hash
    ? callback(null, true)
    : callback({ signature: signature, valid: hash }, false);
};
module.exports = verify;
