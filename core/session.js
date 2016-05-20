'use strict';
module.exports = (crypt, salt) => {
  let _session = {};
  salt = salt || crypt.hash(new Date().toISOString());
  return {
    list: () => _session,
    create: data => {
      let sessionId = crypt.hash( JSON.stringify(data), salt );
      _session[sessionId] = data;
      return sessionId;
    },
    get: id => _session[id],
    find: (key, value) => Object.keys(_session).find(k => _session[k][key] === value),
    remove: id => { _session[id] = null; delete _session[id]; }
  };
};
