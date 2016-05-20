'use strict';

const crypto = require('crypto');

const decryptInputEncoding = 'hex';
const decryptOutputEncoding = 'utf8';

let getHash = (algorithm, output) =>
  function () {
    let hash = crypto.createHash(algorithm || 'sha256');
    let args = Array.prototype.slice.call(arguments);
    args.forEach(arg => hash.update(arg));
    return hash.digest(output || 'base64');
  };

module.exports = {
  hash: getHash('sha256'),
  md5: getHash('md5', 'hex'),
  decrypt: function(text, key, ivHex, algorithm) {
    algorithm = algorithm || 'aes-256-cbc';
    let iv = new Buffer(ivHex, decryptInputEncoding);
    let encoded = new Buffer(text, decryptInputEncoding);
    let keyHash = getHash('md5', decryptInputEncoding);
    let keySum = keyHash(key);
    let decipher = crypto.createDecipheriv(algorithm, keySum, iv);
    let dec = decipher.update(encoded, decryptInputEncoding, decryptOutputEncoding);
    dec += decipher.final(decryptOutputEncoding);
    return dec;
  },

  encrypt: function(text, key, ivHex, algorithm) {
    algorithm = algorithm || 'aes-256-cbc';
    let iv = new Buffer(ivHex, decryptInputEncoding);
    let encoded = new Buffer(text, decryptOutputEncoding);
    let keyHash = getHash('md5', decryptInputEncoding);
    let keySum = keyHash(key);
    let cipher = crypto.createCipheriv(algorithm, keySum, iv);
    let ciph = cipher.update(encoded, decryptOutputEncoding, decryptInputEncoding);
    ciph += cipher.final(decryptInputEncoding);
    return ciph;
  }
};
