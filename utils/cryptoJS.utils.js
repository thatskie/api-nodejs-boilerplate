const CryptoJS = require('crypto-js');
const config = require('../config/configuration');

function decryptString(data) {
  const decryptedData = CryptoJS.AES.decrypt(data, config.cryptoJSKey.key, {
    iv: CryptoJS.enc.Hex.parse(config.cryptoJSKey.iv),
  }).toString(CryptoJS.enc.Utf8);
  // console.log('decryptedData:' + decryptedData);
  return decryptedData;
}

function encryptString(data) {
  const encryptedData = CryptoJS.AES.encrypt(data, config.cryptoJSKey.key, {
    iv: CryptoJS.enc.Hex.parse(config.cryptoJSKey.iv),
  }).toString();
  // console.log('encryptedData:' + encryptedData);
  return encryptedData;
}

module.exports = { decryptString, encryptString };
