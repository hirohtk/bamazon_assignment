var mysql = require("mysql");
var inquirer = require("inquirer");
var password = require("../password");
var colors = require('colors');

var db = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",
    
    // putting my password in another JS file so I don't have to commit it to github
    password: password.password.password.password,
    database: "bamazon"
});


db.connect(function (err) {
    if (err) throw err;
    start();
});