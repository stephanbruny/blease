'use strict';

/* Libs */
const Koa = require('koa');
const path = require('path');
const Database = require('nedb');
const crypt = require('./crypt');
const rpc = require('./rpc');
const bodyParser = require('koa-bodyparser');

/* Locals */
const publicPath = path.join(__dirname, '..', 'public');

/* Implementation */
module.exports = function(config) {

  const checkDefaultUser = model => new Promise((resolve, reject) => {
    model.get(config.defaultUser.name)
    .then(user => !!user ? resolve(true) : resolve(false))
    .catch(reject);
  });

  const insertDefaultUser = model => model.create(config.defaultUser.name, config.defaultUser.password);

  const session = require('./session')(crypt, crypt.hash(new Date().toISOString()) );

  const app = new Koa();
  let loadModels = require('./models')(Database);

  loadModels
  .then((models) =>
  checkDefaultUser(models.user)
    .then(exists => exists ? models : insertDefaultUser(models.user))
    .then(() => models)
  )
  .then( (models) => {
    let methods = {
      login: (params, ctx) => new Promise((resolve, reject) => {
        models.user.getSave(params.userName, params.password)
        .then(user => {
          if (user) {
            delete user.password;
            ctx.response.set('set-cookie','blease.session=' + session.create(user) + '; path=/;');
            return resolve({ ok: true, user: user });
          }
          return resolve({ ok: false, invalidCredentials: true });
        })
        .catch(reject);
      })
    };
    for (var name in models) {
      for (var key in models[name]) {
        if (typeof(models[name][key]) === 'function') {
          methods[name + '.' + key] = models[name][key];
        }
      }
    }
    return methods;
  })
  .then( methods => rpc(crypt, methods))
  .then( (rpc) => {
    app.use(bodyParser());
    app.use(function * (next) {
      let requestCookie = this.request.header.cookie;
      if (requestCookie) {
        this.session = session.get(requestCookie.replace('blease.session=', ''));
        if (!this.session) {
          this.response.set('set-cookie','blease.session=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT');
        }
      }
      yield next;
    });
    app.use(function * (next) {
      let type = this.header['content-type'];
      if (this.method === 'POST') {
        let req = this.request.body;
        if (type && type === 'application/json') {
          if (req) {
            this.body = yield rpc.request(req, this);
            return yield this.body;
          }
        }
      }
      yield next;
    });
    app.use(require('koa-static')(publicPath));
    app.listen(config.port);
  })
  .then(() => console.log("Blease running at port " + config.port))
  .catch(err => console.error(err.stack));
}
