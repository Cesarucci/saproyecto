
//db = require('./dbConnection');
mysql = require('mysql');
class Query {
    constructor(configure){
        this.confi =configure
        //this.con =new db(this.confi)
        this.con = mysql.createConnection(configure);

    }
     getCatalogo(res){
        let q1 =false
        let q2 =false
        var valor ={
            'q1':false,
            'q2':false
        }
         this.getProduct(this.getCategory(valor),res,valor);

    console.log(valor);
    }
     getCategory(valor) {
        var sql = "SELECT * FROM category;";

        let categories = [];
        let category={
            'id':'0004',
            'nombre':'error',
            'padre':0
        }
        categories.push(category)
         this.con.query(sql,categories, function (err, result) {
            if (err) throw err;


            result.forEach(function (element) {
                var parent = element.categoryParent;
                /*if(element.categoryParent==null)
                    parent = 0;*/
                var category={
                    'id':element.id,
                    'nombre':element.name,
                    'padre':parent
                }

                categories.push(category)
            });


            valor.q1= true;

            console.log(valor.q1);
            console.log(categories)
        });

        return categories
    }
     getProduct(categories,res,valor) {
        console.log('product');
        var sql = "SELECT a.sku,a.name,a.active, b.categoryId "+
        "as cat FROM product a, productCategory b WHERE a.sku = b.productSku;";
        var productos2 = [];
        var productos3 = [];

         this.con.query(sql,function (err, result) {
        if (err) throw err;
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
                    var catalogo ={
                        'categorias':categories,
                        'productos':productos2
                    }
                    valor.q2 = true;
                    console.log(valor.q2);
                    res.send(catalogo)

                    return productos2;
                }
                tama ++;
            })
        });
        return productos2
    }


     enriquecer(req,res) {

        req.body.SKUs.forEach(function (element) {
            var sql = "SELECT a.sku,a.name,a.active, a.price, b.categoryId as cat, c.url," +
                " a.shortDescription, a.longDescription  FROM product a, productCategory b," +
                " image c WHERE a.sku = b.productSku AND a.sku = \'"+element+"\';";
            var products;
             con.query(sql, function (err, result) {
                if (err) throw err;
                var productos2 = [];
                var productos3 = [];
                var cat2 =[];
                var img2 =[];
                var tama = 0;
                result.forEach(function (element) {
                    var pro = new Object();
                    pro.sku = element.sku;
                    pro.nombre = element.name;
                    pro.activo = element.active;
                    pro.categorias = [element.cat];
                    pro.imagenes =[element.url];
                    pro.precio_lista = element.price;
                    pro.descripcion_corta = element.shortDescription;
                    pro.descripcion_larga = element.longDescription;
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
                        var catalogo ={
                            'productos':productos2
                        }
                        res.send(catalogo)
                    }
                    tama ++;
                })
            });
        });
    }
}
module.exports= Query;
