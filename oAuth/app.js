'use strict'
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const hbs = require('express-handlebars');
const app = express();
const api = require('./routes');

let fp = require('path');

//Se declara path para el directorio public para los assets.
function relative(path) {
    return fp.join(__dirname, path);
  }
app.use(express.static(relative('public')));

//Se usará JSON para la extracción de información
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(session({
  secret: 'AlejandrogaySuperLlave',
  resave: false,
  saveUninitialized: true
}));

//Se declara la extensión de los archivos de handlebars y una página o páginas base como Master Pages.
app.engine('.hbs',hbs({
    defaultLayout: 'default',
    extname: '.hbs'
}));

app.set('view engine','.hbs');

//Se inyectan las rutas que se utilizaran con las funciones asociadas a cada ruta con su renderizado.
app.use(api);

module.exports = app;
