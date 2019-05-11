'use strict'

const mysql = require('mysql');

var connection = mysql.createConnection({
    host     : 'ec2-34-203-217-131.compute-1.amazonaws.com',
    user     : 'root',
    password : '123456789',
    database : 'company'
});

module.exports = {
    connection
}
