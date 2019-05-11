'use strict'

const express = require('express');

/*************Instancias controladores administrador****************/
const token = require('../controllers/token');
const check = require('../controllers/mdl');
/*******************************************************************/

const api = express.Router();

api.post('/getToken',token.login);
api.get('/validateToken',check.checkToken,token.index);
api.get('/',token.index);

module.exports = api;