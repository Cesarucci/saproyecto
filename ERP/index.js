
var mysql = require('mysql');
var request = require('request');

const port = 3008;
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var con = mysql.createConnection({
    host: process.env.DATABASE_HOST || 'ec2-54-236-60-243.compute-1.amazonaws.com',
    user: "root",
    password: "123456789",
    port: '3306',
    database: "company"
});

con.connect(function(err) {
    if (err) throw err;
    console.log('Conectado a la BD MySQL');
});

app.post('/enriquecer',verify.verify, (req, res)=> {
    var body = req.body;
    var x=0;
    var sql1 = "DELETE FROM product";
    con.query(sql1, function (err, result) {
        body.products.forEach(function (element) {
            var sku = Math.floor(Math.random() * 150007);
            sql = "INSERT INTO product (sku,name,price,shortDescription,longDescription,active)\n" +
                "VALUES ('" + element.sku + "','" + element.nombre + "'" +
                "," + element.precio_lista +
                ",'" + element.descripcion_corta + "','" + element.descripcion_larga + "','" + element.activo + "');";
            con.query(sql, function (err, result2) {
                console.log("producto insertado");
            });
            x++;
            if (x == body.products.length) {
                res.send("OK");
            }
        });
    });
});

app.get('/Catalogo',verify.verify, (req, res)=> {
    var sql = "SELECT sku,name FROM product Where active = 1 ";
    con.query(sql, function (err, result) {
        res.json(result);
    });
});

app.listen(port, function () {
    console.log("Servidor iniciado en  el puerto: "+ port);
});







