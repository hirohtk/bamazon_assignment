var mysql = require("mysql");
var inquirer = require("inquirer");
var password = require("../password");
var colors = require('colors');
const {table} = require('table');


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
    console.clear();
    start();
});

function reset() {
    console.log("\nQuery complete.  Routing you back to the main menu in 5 seconds.")
    setTimeout(start, 5000);
}

function start() {
    console.log("Welcome to BAMAZON!".yellow + "   ***FOR SUPERVISORS***".blue);

    inquirer.prompt({
        name: "firstselection",
        type: "list",
        message: "What would you like to do?\n",
        choices: ["View Product Sales by Department", "Create New Department"]
    })
        .then(function (answer) {
            switch (answer.firstselection) {

                case ("View Product Sales by Department"):
                    viewSales();
                    break;

                case ("Create New Department"):
                    createDepartment();
                    break;

                default:
                    console.log("This should never be triggered as long as things go right.");
            }

        });
}

function viewSales() {
    //idea is to use this one to let table's data variable know how many subarrays it needs to print
    let masterArrayForTable = [];
    //idea is to use this one to let sql populate individual variables in, as arrays.  basically doing inception with arrays here, man...
    let arrayForData = [];

    db.query("SELECT departments.department_id, departments.department_name, departments.over_head_costs, SUM(products.product_sales) AS product_sales FROM departments JOIN products ON products.department_name = departments.department_name GROUP BY departments.department_name;", function (err, res) {
        if (err) throw err;
        
        for (let i = 0; i < res.length; i++) {
            console.log(res[i].department_id, res[i].department_name, res[i].over_head_costs, res[i].product_sales)
        }

        //  Needed to fill in NPM table package table dynamically.  found this helped:  https://stackoverflow.com/questions/6645067/javascript-dynamically-creating-variables-for-loops
        //  Strategy was to create an array for every row of data needed.  Thought I could create new varibles, but instead make new arrays this way to store in a master array

        for (let i = 0; i < res.length; i++) {
            arrayForData[i] = [res[i].department_id, res[i].department_name, res[i].over_head_costs, res[i].product_sales, "test"]
            masterArrayForTable.push(arrayForData[i]);
        }
        // just need a method that can list each sub array separated by a comma ,
        // then store that in an object, then can use that in data below. 
        let config,
        data,
        output;
    data = [
        ['department_id', 'department_name', 'over_head_costs', "product_sales", "total_profit"],
        
        arrayForData[0],
        arrayForData[1],
        arrayForData[2],
        arrayForData[3],
        ["d", "s", "t", "from products table", "calcualted in js"],
    ];
    config = {
        columns: {
            0: {
                alignment: 'center',
                width: 20
            },
            1: {
                alignment: 'center',
                width: 20
            },
            2: {
                alignment: 'center',
                width: 20
            },
            3: {
                alignment: 'center',
                width: 20
            },
            4: {
                alignment: 'center',
                width: 20
            }
        }
    };

    output = table(data, config);

    console.log(output);

    });
    
}