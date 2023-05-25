const crypto = require('crypto');

const verify = async (body, module, callback) => {
  const { rawData, signature } = body;
  const hash = crypto.createHash('sha512').update(rawData).digest('hex');
  signature == hash
    ? callback(null, true)
    : callback(
        {
          'error message': 'Invalid data signature for ' + module,
          signature: signature,
          valid: hash,
        },
        false,
      );
};
module.exports = verify;
