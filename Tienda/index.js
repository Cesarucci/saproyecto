var mysql = require('mysql');
var consulta =require('./dbQuery')
var request = require('request');
var initConf =require('./conf');
var aa ="";
const port = 3007;
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
const check = require('./mdl');
var periodox = 0;

app.get('/Tienda/enriquecer', (req, res)=>{

    request.get('http://localhost:3000/PIM/obtenerCatalogo', function (error, response, body) {
        var catalogo = JSON.parse(body)
        var x =0;
        var lista =[];
        catalogo.productos.forEach(function (element) {
            var inv = Math.floor(Math.random() * 101);
            if (inv > 30 && inv < 81) {
                lista.push(element.sku);
            }
            x++;
            if(x==catalogo.productos.length)
            {
                var arreglo = '{"arreglo":'+JSON.stringify(lista)+'}';
                var arreglo2 = JSON.parse(arreglo);
                request.get({url:'http://localhost:3000/PIM/enriquecerProducto',json:true,body:arreglo2},function (error, response, body) {
                    request.post({url:'http://localhost:3008/enriquecer',json:true,body:body},function (error, response, body) {
                        res.send(body);
                    });
                });
            }
        });
    });
});

app.get('/Tienda/ObtenerCatalogo',check.checkToken,(req, res)=>{
    request.get('http://localhost:3008/Catalogo', function (error, response, body) {
        var j = JSON.parse(body);
        res.json(j);
    });
 });

app.get('/Bodega/obtenerInventario', (req, res)=>{
    var tiempo =1;
    var pais = initConf.pais;
    var continente = initConf.nodo;
    var invetarios = [];
    var x =0;
    initConf.bodegas.forEach(function (element) {

        if(element.nodo!=continente)
            tiempo = 5;
        else if(element.pais!=pais)
            tiempo = 3;
        req.body.destino = element.destino;
        req.body.origen = element.nodo;
        request.get({url:'http://localhost:3000/Bodega/obtenerInventario',json:true,body:req.body}, function (error, response, body) {
                invetarios.push(body)
                x++;
                if(x==initConf.bodegas.length)
                {
                       res.send(invetarios[0]);
                }
        });
    })
});

app.get('/Bodega/realizarDespacho', async (req, res)=>{
    var tiempo =1;
    var pais = initConf.pais;
    var continente = initConf.nodo;

    var x =0;
    var body = req.body;
    var cantidad = body.cantidad;

    var pedidos=[];

    initConf.bodegas.forEach(function (element) {
        req.body.destino = element.destino;
        req.body.origen = element.nodo;
        req.body.arreglo =[];
        req.body.arreglo.push(req.body.sku);
        request.get({url:'http://localhost:3000/Bodega/obtenerInventario',json:true,body:req.body}, function (error, response, body) {

            x++;
            if(element.nodo!=continente)
                tiempo = 5;
            else if(element.pais!=pais)
                tiempo = 3;
            var cantidad2 = body.products[0].inventario;
            var pedido = new Object();
            pedido.tiempo = tiempo;
            pedido.cantidad = cantidad2;
            pedido.destino = element.destino;
            pedidos.push(pedido);

            if(x==initConf.bodegas.length)
            {
                for (let i=0; i<pedidos.length; i++)
                {
                    var ped1 = pedidos[i];
                    for (let j=0; j<pedidos.length; j++)
                    {
                        var ped2 = pedidos[j];
                        if(ped1.tiempo>ped2.tiempo)
                        {
                            var aux = new Object();
                            aux.tiempo = ped1.tiempo;
                            aux.cantidad = ped1.cantidad;
                            aux.destino = ped1.destino;
                            pedidos[j-1]= ped2;
                            pedidos[j]= aux;
                            ped1= pedidos[i];
                        }
                    }
                }
                var xx=0;
                for (let i=0; i<pedidos.length; i++)
                {
                    var ped = pedidos[i];
                    if(ped.cantidad>=cantidad)
                        req.body.cantidad = cantidad;
                    else
                        req.body.cantidad = ped.cantidad
                    req.destino= ped.destino;


                    request.post({url:'http://localhost:3000/Bodega/realizarDespacho',json:true,body:req.body}, function (error, response, body) {
                        var resultado = body.resultado;
                        if(resultado)
                        {
                            cantidad= cantidad - req.body.cantidad;
                        }
                        if(cantidad==0)
                        {
                            res.send("OK");
                            return;
                        }

                        xx++;
                        if(xx==pedidos.length)
                        {
                            if(cantidad==0)
                            {
                                res.send("OK");
                                return;
                            }
                            else
                            {
                                res.send("NOK");
                                return;
                            }
                        }
                    });
                }
            }
        });
    });
});

function  init() {
    request.get('http://localhost:3000/PIM/obtenerCatalogo', function (error, response, body) {
        var catalogo = JSON.parse(body)
        var x =0;
        var lista =[];
        catalogo.productos.forEach(function (element) {
            var inv = Math.floor(Math.random() * 101);
            if (inv > 30 && inv < 81) {
                lista.push(element.sku);
            }
            x++;
            if(x==catalogo.productos.length)
            {
                var arreglo = '{"arreglo":'+JSON.stringify(lista)+'}';
                var arreglo2 = JSON.parse(arreglo);
                request.get({url:'http://localhost:3000/PIM/enriquecerProducto',json:true,body:arreglo2},function (error, response, body) {
                    request.post({url:'http://localhost:3008/enriquecer',json:true,body:body},function (error, response, body) {

                    });
                });
            }
        });

    });
}

function body(reqBody,servidorDestino) {
    var body = {};
    body.parametro = reqBody;
    body.destino = servidorDestino;
    body.guid= initConf.client_id;
    body.jwk =initConf.client_secret
    return body;
}

function sendGet(body){

    var options = {};
    options.url= initConf.nodo,
    options.method= 'GET',
    options.json=true,
    options.body=body

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log("Fin: ", body) // Print the shortened url.
        }
        else {
          console.log("ups!", error);
        }
    });
}

function sendPost(body){

    var options = {};
    options.url= initConf.nodo,
    options.method= 'post',
    options.json=true,
    options.body=body

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log("Fin: ", body) // Print the shortened url.
        }
        else {
          console.log("ups!", error);
        }
    });
}

app.listen(port, function () {
    console.log("Servidor iniciado en  el puerto: "+ port);
    init();
});


app.get('/periodo', (req, res)=>{
    init();
    periodox++;
});





