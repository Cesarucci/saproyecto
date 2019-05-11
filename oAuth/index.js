'use strict'

const app = require('./app');
const config = require('./config');

//Iniciamos el servidor
app.listen(config.port, () => {
	console.log(`Aplicación corriendo en http://localhost:${config.port}`);
});
