'use strict';

module.exports = function(db) {
  const hash = require('../crypt').hash;
  return {
    create: (name, password, data) => new Promise((resolve, reject) => {
      let pw = hash(password);
      db.insert({
        name: name,
        password: pw,
        created: new Date(),
        data: data
      }, (err, res) => err ? reject(err) : resolve(res));
    }),
    get: name => new Promise((resolve, reject) => {
      db.findOne({name: name}, (err, res) => err ? reject(err) : resolve(res));
    }),
    getSave: (name, pw) => new Promise((resolve, reject) => {
      pw = hash(pw);
      db.findOne({name: name, password: pw}, (err, res) => err ? reject(err) : resolve(res));
    })
  }
}
