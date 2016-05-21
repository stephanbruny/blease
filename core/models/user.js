'use strict';

module.exports = function(db) {
  const hash = require('../crypt').hash;
  let createUser = (name, password, data) => new Promise((resolve, reject) => {
    let pw = hash(password);
    db.insert({
      name: name,
      password: pw,
      created: new Date(),
      data: data
    }, (err, res) => err ? reject(err) : resolve(res));
  });
  return {
    add: params => new Promise((resolve, reject) => {
      let item = params;
      item.password = hash(params.password);
      db.findOne({name: item.name}, (err, res) => {
        if (err) return reject(err);
        if (res && red._id) return reject(new Error('User with name ' + items.name + ' already exists'));
        db.insert(params, (err, res) => err ? reject(err) : resolve(res));
      });
    }),
    create: createUser,
    get: name => new Promise((resolve, reject) => {
      db.findOne({name: name}, (err, res) => err ? reject(err) : resolve(res));
    }),
    getSave: (name, pw) => new Promise((resolve, reject) => {
      pw = hash(pw);
      db.findOne({name: name, password: pw}, (err, res) => err ? reject(err) : resolve(res));
    }),
    list: () => new Promise((resolve, reject) => {
      db.find({}, (err, res) => err ? reject(err) : resolve(res.map(user => { delete user.password; return user })));
    })
  }
}
