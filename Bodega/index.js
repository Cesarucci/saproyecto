var mysql = require('mysql');
var request = require('request');
var initConf =require('./conf');
const port = 3006;
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var request = require('request');

var periodox = 0;

/*
* coninv = 1
* sininv = 2
* obtenerinv = 3
* despachocorr=4
* despachoinco = 5
* */

var con = mysql.createConnection({
    host: process.env.DATABASE_HOST || 'ec2-54-163-173-31.compute-1.amazonaws.com',
    user: "root",
    password: "123456789",
    port: '3306',
    database: "company"
});

con.connect(function(err) {
    if (err) throw err;
    console.log('Conectado a la BD MySQL');

});

app.get('/', function (req, res) {
  res.send('<h1>Hello World! BODEGA</h1>')
})

app.get('/obtenerInventario', (req, res)=>{
    var body = req.body;
    var pais = body.pais;
    let productos2= [];
    let finish = body.arreglo.length;
    for (let i=0; i<body.arreglo.length; i++) {
        //console.log(i);
        var sql = "SELECT a.sku,a.inventario FROM product a" +
            " WHERE a.sku =  \'"+body.arreglo[i]+"\';";
        con.query(sql, function (err, result) {
            if (err) throw err;
            result.forEach(function (element) {
                var pro = new Object();
                pro.sku = element.sku;
                pro.inventario = element.inventario;
                productos2.push({
                    "sku":pro.sku,
                    "inventario":pro.inventario
                })
                if(i==finish-1)
                {
                    var ret = JSON.stringify(productos2)
                    ret = "{\"products\":"+ret+"}";
                    var sql2 = "INSERT INTO reporte (periodo,tipo,pais)" +
                        "VALUES(" + periodox + "," + 3 +"'"+pais+"');";
                    con.query(sql2, function (err, result) {
                        res.send(ret);
                    });

                }
            })
        });
    }
});

app.post('/realizarDespacho', (req, res)=>{
    let element = req.body;
    var sql = "SELECT a.sku,a.inventario FROM product a" +
        " WHERE a.sku =  \'"+element.sku+"\';";
    con.query(sql, function (err, result) {
        if (err) throw err;
        if(result[0].inventario >= element.cantidad) {
            var tot = result[0].inventario - element.cantidad;
            var sql = "UPDATE product"  +
                " SET inventario = "+ tot +
                " WHERE sku =  \'" + element.sku + "\';";
            con.query(sql, function (err, result) {
                var sql2 = "INSERT INTO reporte (periodo,tipo,pais)" +
                    "VALUES(" + periodox + "," + 4 +"'');";
                con.query(sql2, function (err, result) {
                    res.send({resultado: true});
                });
            });
        }
        else{
            var sql2 = "INSERT INTO reporte (periodo,tipo,pais)" +
                "VALUES(" + periodox + "," + 5 +"'"+pais+"');";
        con.query(sql2, function (err, result) {
            res.send({resultado: false});
        });
        }
    });
});


app.listen(port, function () {
    console.log("Servidor iniciado en  el puerto: "+ port);
    Init();
    periodox++;
});

function Init() {
    var sql1 = "DELETE FROM product";
    con.query(sql1, function (err, result) {
        request.get('http://localhost:3000/PIM/obtenerCatalogo', function (error, response, body) {
            var catalogo = JSON.parse(body);

            catalogo.productos.forEach(function (element) {
                var inv = Math.floor(Math.random() * 101);
                if (inv > 30 && inv < 51) {
                    inv = 0;
                }
                    var sql = "INSERT INTO product (sku,name,inventario)" +
                        "VALUES('" + element.sku + "','" + element.nombre + "'," + inv + ");";
                    con.query(sql, function (err, result) {
                        var tipo = 1;
                        if(inv==0)
                            tipo=2;
                        var sql2 = "INSERT INTO reporte (periodo,tipo)" +
                            "VALUES(" + periodox + "," + tipo + ");";
                        con.query(sql2, function (err, result) {

                            console.log("producto insertado");
                        });
                    });

            });
        });
    });
}

app.post('/periodo', (req, res)=>{
   Init();
   periodox++;
});


/*
* coninv = 1
* sininv = 2
* obtenerinv = 3
* despachocorr=4
* despachoinco = 5
* */

app.get('/repote/periodo',(req,res)=>{
    var sql = "SELECT COUNT(periodo) AS total ,tipo, periodo FROM reporte group by tipo,periodo order by tipo;";
    var ret = "Se crearon 25 productos\n";
    con.query(sql, function (err, result)
    {
        var periodo =0;
        var total=25;
        var x =0;
        result.forEach(function (element) {

            if(element.tipo==1)
            {
                ret+= "durante el periodo "+element.periodo+" se insertaron "+element.total+" productos con inventario\n";
            }
            else if(element.tipo==2)
            {
                ret+= "durante el periodo "+element.periodo+" se insertaron "+element.total+"productos sin inventario\n";
            }
            else if(element.tipo==3)
            {
                ret+= "durante el periodo "+element.periodo+" se consulto "+element.total+" veces obtener inventario\n";
            }
            else if(element.tipo==4)
            {
                ret+= "durante el periodo "+element.periodo+" se despachó "+element.total+" veces correctamente\n";
            }
            else
            {
                ret+= "durante el periodo "+element.periodo+" se no se pudo despachar "+element.total+" veces\n";
            }
            x++;
            if(x==result.length)
            {
                res.send(ret);
            }
        });
    });


});

app.get('/repote/tienda',(req,res)=>{
    var sql = "SELECT COUNT(tienda) AS total ,tipo,tienda FROM reporte group by tipo,tienda order by tipo;";
    var ret = "Se crearon 25 productos\n";
    con.query(sql, function (err, result)
    {
        var periodo =0;
        var total=25;
        var x =0;
        result.forEach(function (element) {

            if(element.tipo==3)
            {
                ret+= "desde la tienda "+element.tienda+" se consulto "+element.total+" veces obtener inventario\n";
            }
            else if(element.tipo==4)
            {
                ret+= "desde la tienda "+element.tienda+" se despachó "+element.total+" veces correctamente\n";
            }
            else if(element.tipo==5)
            {
                ret+= "desde la tienda "+element.tienda+" se no se pudo despachar "+element.total+" veces\n";
            }
            x++;
            if(x==result.length)
            {
                res.send(ret);
            }
        });
    });


});

app.get('/repote/total',(req,res)=>{
    var sql = "SELECT COUNT(tienda) AS total ,tipo FROM reporte group by tipo order by tipo;";
    var ret = "Se crearon 25 productos\n";
    con.query(sql, function (err, result)
    {
        var periodo =0;
        var total=25;
        var x =0;
        result.forEach(function (element) {
            if(element.tipo==1)
            {
                ret+= "Se insertaron en total "+element.total+" productos con inventario\n";
            }
            else if(element.tipo==2)
            {
                ret+= "Se insertaron en total "+element.total+"productos sin inventario\n";
            }
            else if(element.tipo==3)
            {
                ret+= "Se consulto en total  "+element.total+" veces obtener inventario\n";
            }
            else if(element.tipo==4)
            {
                ret+= "Se despachó en total "+element.total+" veces correctamente\n";
            }
            else
            {
                ret+= "No se pudo despachar en total "+element.total+" veces\n";
            }

            x++;
            if(x==result.length)
            {
                res.send(ret);
            }
        });
    });


});


