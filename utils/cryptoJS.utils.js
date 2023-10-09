const CryptoJS = require('crypto-js');
const configuration = require('../config/configuration');

function decryptString(data) {
  const decryptedData = CryptoJS.AES.decrypt(
    data,
    configuration.cryptoJSKey.key,
    {
      iv: CryptoJS.enc.Hex.parse(configuration.cryptoJSKey.iv),
    },
  ).toString(CryptoJS.enc.Utf8);
  // console.log('decryptedData:' + decryptedData);
  return decryptedData;
}

function encryptString(data) {
  const encryptedData = CryptoJS.AES.encrypt(
    data,
    configuration.cryptoJSKey.key,
    {
      iv: CryptoJS.enc.Hex.parse(configuration.cryptoJSKey.iv),
    },
  ).toString();
  // console.log('encryptedData:' + encryptedData);
  return encryptedData;
}

module.exports = { decryptString, encryptString };
