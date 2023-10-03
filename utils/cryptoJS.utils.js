const CryptoJS = require('crypto-js');
const parameters = require('../config/paramConfig');

function decryptString(data) {
  const decryptedData = CryptoJS.AES.decrypt(data, parameters.cryptoJSKey.key, {
    iv: CryptoJS.enc.Hex.parse(parameters.cryptoJSKey.iv),
  }).toString(CryptoJS.enc.Utf8);
  // console.log('decryptedData:' + decryptedData);
  return decryptedData;
}

function encryptString(data) {
  const encryptedData = CryptoJS.AES.encrypt(data, parameters.cryptoJSKey.key, {
    iv: CryptoJS.enc.Hex.parse(parameters.cryptoJSKey.iv),
  }).toString();
  // console.log('encryptedData:' + encryptedData);
  return encryptedData;
}

module.exports = { decryptString, encryptString };
