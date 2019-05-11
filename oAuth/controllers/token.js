'use strict'

let jwt = require('jsonwebtoken');
let config = require('../config');
const conn = require('./connect').connection;

function login (req, res) {
    let clientId = req.body.client_id;
    let clientSecret = req.body.client_secret;

    conn.query(`select * from credenciales where client_id = ${clientId} and client_secret = "${clientSecret}"`, function (error, results, fields) {
        if (error)
        {
            console.log(error);
            res.jsonp({error: 'Error de conexión a la base de datos.'})
        }

        if (results.length > 0)
        {
            let token = jwt.sign(
                {
                    username: clientId,
                    roles:results[0].funciones
                },
              config.secret,
              {
                  expiresIn: '1h' // expires in 1 hours
              }
            );
            // return the JWT token for the future API calls
            res.jsonp({
              access_token: token,
              token_type: 'JWT',
              expires_in: 3600,
              refresh_token: null,
              scope: results[0].funciones
            });
        }
        else
        {
            res.jsonp({
              success: false,
              message: 'Incorrect client_id or client_secret'
            });
        }
    });
}

function index (req, res) {
    res.jsonp({
      success: true,
      message: 'Welcome'
    });
}


module.exports = {
  login,
  index
}

