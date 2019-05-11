process.env.NODE_ENV = "production";
const express = require('express');
const config = require('config');
const port = 3000;
const app = express();
const Nodos = config.get('Nodos');
const actual = config.get('Actual');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const portnodo = 3005;
const portnodo2 = 3006;
var request = require('request');

var http = require("http");

app.get('/PIM/obtenerCatalogo', (req, res)=>{
    var Pim = WheresPIM();
    if(Pim==actual)
    {
        request.get('http://localhost:'+portnodo+'/obtenerCatalogo',function (error, response, body) {
            var j = JSON.parse(body);
            res.json(j);
            });
    }
    else
    {

        request.get('http://'+Pim+':'+portnodo+'/obtenerCatalogo',function (error, response, body) {
            res.json(body);
        });
    }
});

app.get('/PIM/enriquecerProducto', (req, res)=>{
    var Pim = WheresPIM();
    if(Pim==actual)
    {
        request.get({url:'http://localhost:'+portnodo+'/enriquecerProducto',json:true,body:req.body},function (error, response, body) {
            res.json(body);
        });
    }
    else
    {
        request.get('http://'+Pim+':'+portnodo+'/enriquecerProducto',function (error, response, body) {
            res.json(body);
        });
    }
});

app.listen(port, function () {
    console.log("Servidor iniciado en  el puerto: "+ port);
});

function WheresPIM() {
    var regreso = actual;
    Nodos.forEach(function(element) {
        var serve = element.servidor;
        var parts = serve.split('.');
        if(parts[0]=="pim")
        {
         regreso = element.nodo;
        }
    });
    return regreso;
};

function WheresCellar(bodega) {
    var regreso = actual;
    Nodos.forEach(function(element) {
        var serve = element.servidor;
        if(serve==bodega)
        {
            regreso = element.nodo;
        }
    });
    return regreso;
};

app.get('/Bodega/obtenerInventario',(req, res)=>{
    var Bodega = WheresCellar(req.body.destino);

    if(Bodega==actual)
    {
        request.get({url:'http://'+req.body.destino+'/obtenerInventario',json:true,body:req.body},function (error, response, body) {

            res.json(body);
        });
    }
    else
    {
        /*request.get({url:'http://'+Bodega+':'+portnodo2+'/Bodega/obtenerInventario',json:true,body:req.body},function (error, response, body) {
            res.json(body);
        });*/
        request.get({url:'http://'+req.body.destino+'/obtenerInventario',json:true,body:req.body},function (error, response, body) {

            res.json(body);
        });
    }
});

app.post('/Bodega/realizarDespacho',(req, res)=>{
    var Bodega = WheresCellar(req.body.destino);

    if(Bodega==actual)
    {
        request.post({url:'http://'+/*req.body.destino*/'localhost'+':'+portnodo2+'/realizarDespacho',json:true,body:req.body},function (error, response, body) {

            res.json(body);
        });
    }
    else
    {
        request.get({url:'http://'+Bodega+':'+portnodo2+'/Bodega/realizarDespacho',json:true,body:req.body},function (error, response, body) {
            res.json(body);
        });
    }
});
