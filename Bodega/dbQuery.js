
//db = require('./dbConnection');
mysql = require('mysql');
class Query {
    constructor(configure){
        this.confi =configure
        //this.con =new db(this.confi)
        this.con = mysql.createConnection(configure);
        
    }
    obtenerInventario(body,res) {

    }
    realizarDespacho(req,res){

    }
}
module.exports= Query;