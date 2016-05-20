'use strict';

module.exports = function(crypt, methods) {
  const createRpcResponse = (requestId, result, error) => ({
    jsonrpc: "2.0",
    id: requestId,
    result: result || null,
    error: error || null
  });

  const isValidRequest = req => req.jsonrpc && req.id && req.method && req.params;

  return {
    request: (req, ctx) => new Promise((resolve) => {
      if (!isValidRequest(req)) return resolve(createRpcResponse(req.id, null, {
        code: -1,
        message: "Invalid request",
        original: req
      }));
      let method = methods[req.method];
      if (!method) return resolve(createRpcResponse(req.id, null, {
        code: 1,
        message: "Unknown Method \"" + req.method + "\"",
      }));
      method(req.params, ctx)
      .then(res => resolve(createRpcResponse(req.id, res)))
      .catch(err => resolve(createRpcResponse(req.id, null, {
        code: -2,
        message: "Internal Error",
        error: err.toString()
      })));
    })
  };
}
