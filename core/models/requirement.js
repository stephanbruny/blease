'use strict';
module.exports = function(db) {
  let getTests = it => it.map(it => ({
    title: it,
    complexity: 1
  }));

  return {
    create: params => new Promise((resolve, reject) => {
      console.log("create", params);
      var item = params;
      item.created = new Date();
      return db.insert(item, (err, res) => err ? reject(err) : resolve(res));
    }),
    list: params => new Promise((resolve, reject) => {
      db.find(params, (err, res) => err ? reject(err) : resolve(res))
    }),
    update: params => new Promise((resolve, reject) => {
      let query = {
        _id: params._id
      };
      delete params._id;
      delete params.created;
      params.modified = new Date();
console.log("update", query, params);
      db.update(query, { $set: params }, {returnUpdatedDocs: true}, (err, res) => err ? reject(err) : resolve(res));
    }),
  }
}
