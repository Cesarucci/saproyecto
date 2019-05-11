
var mysql = require('mysql');
const port = 3005;
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
var periodox = 0;
/*
* tipo1 = producto
* tipo2 = catalogo
* tipo3 = enriquecimiento
* */

app.use(bodyParser.urlencoded({ extended: true }));
var getlorem = require('getlorem');


var con = mysql.createConnection({
    host: process.env.DATABASE_HOST || 'ec2-34-205-28-224.compute-1.amazonaws.com'  ,
    user: "root",
    password: "123456789",
    port: '3306',
    database: "company"
});

con.connect(function(err) {
    if (err) throw err;
    console.log('Conectado a la BD MySQL');
});

app.get('/obtenerCatalogo', (req, res)=>{
    var sql = "SELECT * FROM category;";
    var categories = '"categorias":[';

    con.query(sql, function (err, result) {
        if (err) throw err;
        var tama = 0;
        result.forEach(function (element) {
            var parent = element.categoryParent;
            /*if(element.categoryParent==null)
                parent = 0;*/
            if(tama==0)
            {
                categories+='{"id":'+element.id+',"nombre":"'+element.name+'","padre":'+parent+'}';
            }
            else
            {
                categories+=',{"id":'+element.id+',"nombre":"'+element.name+'","padre":'+parent+'}';
            }
            tama=1;
        });
        categories+=']';
        var sql = "SELECT a.sku,a.name,a.active, b.categoryId as cat FROM product a, productCategory b WHERE a.sku = b.productSku;";
        var products;
        con.query(sql, function (err, result) {
            if (err) throw err;
            productos2 = [];
            productos3 = [];
            var tama = 0;
            result.forEach(function (element) {
                var pro = new Object();
                pro.sku = element.sku;
                pro.nombre = element.name;
                pro.activo = element.active;
                pro.categorias = [element.cat];
                var pos = productos3.indexOf(element.sku);
                if(pos==-1)
                {
                    productos2.push(pro);
                    productos3.push(element.sku);
                }
                else
                {
                    productos2[pos].categorias.push(element.cat);
                }

                if(tama==result.length-1)
                {
                    products = JSON.stringify(productos2);
                    products = '"productos":'+products;
                    var retorno = "{"+categories+","+products+"}";
                    var sql22 = "INSERT INTO reporte(periodo,tipo) VALUES("+periodox+","+2+")";
                    con.query(sql22, function (err, result2)
                    {
                        res.send(retorno);
                    });
                }
                tama ++;
            })
        });
    });
});

app.get('/enriquecerProducto', (req, res)=>{
    var products="";
    var x = 0;
    req.body.arreglo.forEach(function (element) {
        var sql = "SELECT a.sku,a.name,a.active, a.price, b.categoryId as cat, c.url," +
            " a.shortDescription, a.longDescription  FROM product a, productCategory b," +
            " image c WHERE a.sku = b.productSku AND a.sku = \'"+element+"\';";

        con.query(sql, function (err, result) {
            if (err) throw err;
            productos2 = [];
            productos3 = [];
            cat2 =[];
            img2 =[];
            var tama = 0;
            result.forEach(function (element) {
                var pro = new Object();
                pro.sku = element.sku;
                pro.nombre = element.name;
                pro.precio_lista = element.price;
                pro.descripcion_corta = element.shortDescription;
                pro.descripcion_larga = element.longDescription;
                pro.imagenes =[element.url];
                pro.categorias = [element.cat];
                pro.activo = element.active;

                var pos = productos3.indexOf(element.sku);
                var pos2 = cat2.indexOf(element.cat);
                var pos3 = img2.indexOf(element.url);
                if(pos==-1)
                {
                    productos2.push(pro);
                    productos3.push(element.sku);
                    cat2.push(element.cat);
                    img2.push(element.url);
                }
                else if(pos2==-1 && pos3 ==-1)
                {
                    productos2[pos].categorias.push(element.cat);
                    productos2[pos].imagenes.push(element.url);
                }

                if(tama==result.length-1)
                {
                    if(x==req.body.arreglo.length-1)
                    {
                        products += JSON.stringify(productos2[0]);
                    }else
                    {
                        products += JSON.stringify(productos2[0])+",";
                    }
                    x++
                    if(x==req.body.arreglo.length)
                    {
                        var ret = "{\"products\":["+products+"]}";
                        var sql22 = "INSERT INTO reporte(periodo,tipo) VALUES("+periodox+","+3+")";
                        con.query(sql22, function (err, result2)
                        {
                        res.send(ret);
                        });
                    }
                }
                tama ++;
            });
        });
    });
});

app.put('/periodo',(req, res)=>{

    periodox++;
    var npro= getlorem.words(5);
    var prod = npro.split(" ");
    var ncat= getlorem.words(2);
    var pcat = ncat.split(" ");

    var sql = "SELECT id FROM category limit 5";
    con.query(sql, function (err, result)
    {
        var i = result.length;

        var j = Math.floor(Math.random() * i);
        var x = 0;
        prod.forEach(function (element) {
            var sku = Math.floor(Math.random() * 150007);
            sql = "INSERT INTO product (sku,name,price,shortDescription,longDescription,active)\n" +
                "VALUES ('"+sku+"','"+getlorem.words(1)+"'" +
                ","+Math.floor(Math.random() * 500)+"."+Math.floor(Math.random() * 100)+"" +
                ",'"+getlorem.words(5)+"','"+getlorem.words(10)+"','1');";
            con.query(sql, function (err, result2)
            {
                console.log("producto insertado");
                sql = "INSERT INTO productCategory (productSku,categoryId)\n" +
                    "VALUES ('"+sku+"',"+result[j].id+");";
                j = Math.floor(Math.random() * i);
                con.query(sql, function (err, result3)
                {
                    console.log("productocategoria insertado");

                    sql = "INSERT INTO image (url,productSku)\n" +
                        "VALUES ('"+getlorem.words(1)+"','"+sku+"');";
                    j = Math.floor(Math.random() * i);
                    con.query(sql, function (err, result3)
                    {
                        console.log("img insertado");
                    });
                });
            });
            x++;
            if(x==5)
            {
                xx=0;
                pcat.forEach(function (item4) {
                    var sql4 = "INSERT INTO category (name)" +
                        "VALUES ('"+getlorem.words(1)+"');";
                    con.query(sql4, function (err, result4)
                    {
                        console.log("categoria insertado");
                    });
                    xx++;
                    if(xx==2)
                    {
                        var sql5 = "SELECT sku FROM product WHERE active = 1 LIMIT 2;";
                        con.query(sql5, function (err, result5)
                        {
                            jj=0;
                            result5.forEach(function (item5) {

                                var sql5 = "UPDATE pruduct\n" +
                                    "SET active = 0" +
                                    "WHERE sku = '"+item5.sku+"';";
                                con.query(sql5, function (err, result5)
                                {
                                    console.log("producto de baja");
                                });
                                jj++;
                                if(jj==2)
                                {
                                    var sql22 = "INSERT INTO reporte(periodo,tipo) VALUES("+periodox+","+1+")";
                                    con.query(sql22, function (err, result2)
                                    {
                                        res.send("OK");
                                    });
                                }
                            });
                        });
                    }
                });
            }
        });
    });
});

app.get('/reportes/periodos',(req,res)=>{

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
                    ret+= "durante el periodo "+element.periodo+" se crearon 5 productos\n";
                }
                else if(element.tipo==2)
                {
                    ret+= "durante el periodo "+element.periodo+" se consulto "+element.total+" veces el catalogo\n";
                }
                else
                {
                    ret+= "durante el periodo "+element.periodo+" se consulto "+element.total+" veces el enriquecimiento\n";
                }
                x++;
                if(x==result.length)
                {
                    res.send(ret);
                }
        });
    });
});

app.get('/reportes/general',(req,res)=>{

    var sql = "SELECT COUNT(periodo) AS total ,tipo FROM reporte group by tipo order by tipo;";
    var ret = "";
    con.query(sql, function (err, result)
    {
        var periodo =0;
        var total=25;
        var x =0;
        result.forEach(function (element) {

            if(element.tipo==1)
            {
                ret+= "Se crearon "+(25+(element.total*5))+" productos\n";
            }
            else if(element.tipo==2)
            {
                ret+= "Se consulto "+element.total+" veces el catalogo\n";
            }
            else
            {
                ret+= "Se consulto "+element.total+" veces el enriquecimiento\n";
            }
            x++;
            if(x==result.length)
            {
                res.send(ret);
            }
        });
    });
});

async function init()
{
    var sql = "DELETE FROM Catalog";
    await con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("tabla reiniciada")
    });
   await categorias.forEach(function(element)
    {
        sql = "INSERT INTO Catalog(name) VALUES ('"+element.nombre+"')";
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("categoria insertada")
        });
        var id = 0;


        element.subcategorias.forEach(function (item) {
            sql = "SELECT id FROM Catalog Where name = '"+element.nombre+"';";
            con.query(sql, function (err, result) {
                if (err) throw err;
                id = result[0].id;
                var sql2 = "INSERT INTO Catalog(name,father) VALUES ('"+item+"',"+id+")";
                con.query(sql2, function (err, result) {
                    if (err) throw err;
                    console.log("categoria insertada")
                });
            });

        });
    });

    sql = "Select * FROM Catalog";
    await con.query(sql, function (err, result) {
        if (err) throw err;
        result.forEach(function (element) {


        });
    });
}

app.listen(port, function () {
    console.log("Servidor iniciado en  el puerto: "+ port);
});



