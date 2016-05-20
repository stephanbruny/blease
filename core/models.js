'use strict';
const fs = require('fs');
const path = require('path');

const modelPath = path.join(__dirname, 'models');
const dbPath = path.join(__dirname, 'db');

module.exports = (database) => new Promise((resolve, reject) => {
  fs.readdir(modelPath, (err, data) => {
    if (err) return reject(err);
    let result = {};
    try {
      data.forEach(f => {
        let model = require(path.join(modelPath, f));
        let name = f.replace('.js', '');
        let db = new database({ filename: path.join(dbPath, name + '.db'), autoload: true });
        db.loadDatabase();
        result[name] = model(db);
      });
    } catch (ex) {
      return reject(ex);
    }
    return resolve(result);
  })
});
