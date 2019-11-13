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
    console.log("Press CTRL + C to Exit at any time\n".red);

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
    //idea is to use this one to let table's data variable use it (table's data variable takes an array)
    let masterArrayForTable = [];
    //idea is to use this one to let sql populate individual variables in, as arrays.  basically doing inception with arrays here, man...
    let arrayForData = [];

    db.query("SELECT departments.department_id, departments.department_name, departments.over_head_costs, SUM(products.product_sales) AS product_sales FROM departments JOIN products ON products.department_name = departments.department_name GROUP BY departments.department_name;", function (err, res) {
        if (err) throw err;

        //  Needed to fill in NPM table package table dynamically.  found this helped:  https://stackoverflow.com/questions/6645067/javascript-dynamically-creating-variables-for-loops
        //  Strategy was to create an array for every row of data needed.  Thought I could create new varibles, but instead make new arrays this way to store in a master array

        masterArrayForTable.push(['department_id', 'department_name', 'over_head_costs', "product_sales", "total_profit"]);

        for (let i = 0; i < res.length; i++) {
            //defining a new array for every row of data we're getting from SQL
            arrayForData[i] = [res[i].department_id, res[i].department_name, res[i].over_head_costs, res[i].product_sales, res[i].product_sales - res[i].over_head_costs];
            masterArrayForTable.push(arrayForData[i]);
        }
        // ***BELOW DIDN'T WORK - I WAS OVERCOMPLICATING THINGS.  DIDN'T REALIZE DATA TAKES IN AN ARRAY, NO REAL REASON TO DO THE BELOW, BUT IT DID TEACH ME ABOUT ARRAY.MAP METHOD.

        // just need a method that can list each sub array separated by a comma ,
        // then store that in an object, then can use that in data below. 
        // I think array.map will work.  Model is as follows from here https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
        // var array1 = [[1,2,3], [4,5,6], [7,8,9] , [10,11,12]];
        // const map1 = array1.map(x => x+",");
        // console.log(map1);
        //console.log(masterArrayForTable);
        //const theThingGoingIntoDataForNPMTable = masterArrayForTable.map(x => "["+ x + "]" +",");
        //console.log(theThingGoingIntoDataForNPMTable);

        // ***SEE ABOVE

        let config,
        data,
        output;
    data = masterArrayForTable;
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
    reset();
    });
    
}

function createDepartment() {
    inquirer.prompt(
        [{
            name: "departmentname",
            type: "input",
            message: "Input name of new department to add:",
        },
        {
            name: "departmentoverhead",
            type: "input",
            message: "Input overhead of this this new department:",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }
        ],
    )
        .then(function (answer) {
            let newDepartmentName = answer.departmentname;
            let overhead = parseInt(answer.departmentoverhead);

            db.query("INSERT INTO departments (department_name, over_head_costs) VALUES ('" + newDepartmentName + "','" +  overhead + "')",
            function (err, res) {
                if (err) throw err;
                console.log("\nSuccess!  Added " + newDepartmentName + " as a new department with overhead of $" + overhead +".");           
            });
            reset();
        });
}
