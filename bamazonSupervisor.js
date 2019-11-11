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
    let departmentIDArray = [];
        let departmentNameArray = [];
        let overHeadCostsArray = [];
    db.query("SELECT * FROM departments", function (err, res) {
        if (err) throw err;
        
        for (let i = 0; i < res.length; i++) {
            console.log(res[i].department_id + " " + res[i].department_name + " " + res[i].over_head_costs);
            departmentIDArray.push(res[i].department_id);
            departmentNameArray.push(res[i].department_name);
            overHeadCostsArray.push(res[i].over_head_costs);
        }
        console.log(departmentIDArray);
        console.log(departmentIDArray[3]);
        console.log(departmentNameArray[2]);
        console.log(overHeadCostsArray);

    });
    let config,
        data,
        output;
    data = [
        // the below actually may need to be the result of a join lol... shoot
        ['department_id', 'department_name', 'over_head_costs', "product_sales", "total_profit"],
        // if I can join the two tables and get an array, I can just put the array below to auto fill the row, I think
        ["'" + departmentIDArray[0] + "'", departmentNameArray[0], overHeadCostsArray[0], "from products table", "calculated in js"],
        [departmentIDArray[1], departmentNameArray[1], overHeadCostsArray[1], "from products table", "calcualted in js"],
        [departmentIDArray[2], departmentNameArray[2], overHeadCostsArray[2], "from products table", "calcualted in js"],
        [departmentIDArray[3], departmentNameArray[3], overHeadCostsArray[3], "from products table", "calcualted in js"],
        [departmentIDArray[4], departmentNameArray[4], overHeadCostsArray[4], "from products table", "calcualted in js"],
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
}