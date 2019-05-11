'use strict'

let jwt = require('jsonwebtoken');

let checkToken = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
  if (token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }

  if (token) {
    jwt.verify(token, 'SoftwareAvanzado123', (err, decoded) => {
      if (err) {
        return res.jsonp({
          success: false,
          message: 'Token is not valid'
        });
      } else {

        req.decoded = decoded;
        var scope = decoded.roles;
        var scopes = scope.split(',');
        var x =0;
        scopes.forEach(function (element) {
          if(req.header('scope')==element)
          {
            next();
            return;
          }
          x++;
          if(x==scopes.length)
          {
            return res.jsonp({
              success: false,
              message: 'Token is not valid'
            });
          }
        });
      }
    });
  } else {
    return res.jsonp({
      success: false,
      message: 'Auth token is not supplied'
    });
  }
};

module.exports = {
  checkToken: checkToken
}
