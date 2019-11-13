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
    console.clear();
    start();
});

function reset() {
    console.log("\nQuery complete.  Routing you back to the main menu in 5 seconds.")
    setTimeout(start, 5000);
}

function start() {
    console.log("Welcome to BAMAZON!".yellow + "   ***FOR MANAGERS***".red);
    console.log("Press CTRL + C to Exit at any time".red);
    inquirer.prompt({
        name: "firstselection",
        type: "list",
        message: "What would you like to do?\n",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
    })
        .then(function (answer) {
            switch (answer.firstselection) {

                case ("View Products for Sale"):
                    viewProducts();
                    break;

                case ("View Low Inventory"):
                    viewLowInventory();
                    break;

                case ("Add to Inventory"):
                    addToInventory();
                    break;

                case ("Add New Product"):
                    addNewProduct();
                    break;

                default:
                    console.log("I guess this never should be triggered");
            }

        });
}

function viewProducts() {
    db.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        for (let i = 0; i < res.length; i++) {
            console.log("Item ID: ".yellow + res[i].item_id + " | ".yellow + "Product name: ".yellow + res[i].product_name + " | ".yellow +
                "Department name: ".yellow + res[i].department_name + " | ".yellow + "Price: ".yellow + "$" + res[i].price + " | ".yellow +
                "Stock Quantity: ".yellow + res[i].stock_quantity);
        }
        reset();
        console.log("\n")
    });
}

function viewLowInventory() {
    db.query("SELECT * FROM products WHERE ?",
        [
            { stock_quantity: "<=5" }
        ],
        function (err, res) {
            if (err) throw err;
            if (res.length === 0) {
                console.log("\nAll items have at least 5 units or more in stock.");
                reset();
            }
            else {
                console.log("\nDisplaying all products that have 5 or less units in stock right now.")
                for (let i = 0; i < res.length; i++) {
                    console.log("Item ID: ".yellow + res[i].item_id + " | ".yellow + "Product name: ".yellow + res[i].product_name + " | ".yellow +
                        "Department name: ".yellow + res[i].department_name + " | ".yellow + "Price: ".yellow + "$" + res[i].price + " | ".yellow +
                        "Stock Quantity: ".yellow + res[i].stock_quantity);
                }
                reset();
            }
            console.log("\n")
        });

}

function addToInventory() {
    db.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        let itemNameArray = [];
        for (let i = 0; i < res.length; i++) {
            console.log("Item ID: ".yellow + res[i].item_id + " | ".yellow + "Product name: ".yellow + res[i].product_name + " | ".yellow +
                "Department name: ".yellow + res[i].department_name + " | ".yellow + "Price: ".yellow + "$" + res[i].price + " | ".yellow +
                "Stock Quantity: ".yellow + res[i].stock_quantity);
            itemNameArray.push(res[i].product_name);

        }
        console.log("\n")
        inquirer.prompt({
            name: "itemtoincrease",
            type: "list",
            message: "Which item would you like to increase stock for?\n",
            choices: itemNameArray
        })
            .then(function (answer) {
                let itemChosen = answer.itemtoincrease;

                inquirer.prompt({
                    name: "quantity",
                    type: "input",
                    message: "How many units of " + itemChosen + " would you like to add to inventory?\n",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return false;
                    }
                })
                    .then(function (answer) {
                        let itemIncreaseQuantity = parseInt(answer.quantity);
                        let itemsLeft;
                        //gets item ID so that we can get stock quantity and also UPDATE below (need to use key column to UPDATE)
                        db.query("SELECT item_id FROM products WHERE product_name =" + "'" + itemChosen + "'", function (err, res) {
                            if (err) throw err;
                            let itemID = res[0].item_id;
                            // gets current stock quantity 
                            db.query("SELECT stock_quantity FROM products WHERE product_name =" + "'" + itemChosen + "'", function (err, res) {
                                if (err) throw err;
                                itemsLeft = res[0].stock_quantity;
                                //updates stock quantity to push to SQL
                                itemsLeft += itemIncreaseQuantity;
                                db.query("UPDATE products SET ? WHERE ?",
                                    [
                                        {
                                            stock_quantity: itemsLeft
                                        },
                                        {
                                            item_id: itemID
                                        }
                                    ],
                                    function (err, res) {
                                        if (err) throw err;
                                        console.log("\nYou have successfully increased the quantity of " + itemChosen + " by " + itemIncreaseQuantity + " units");
                                        console.log("There are now " + itemsLeft + " units of " + itemChosen + " left.");
                                        reset();
                                    });
                            });

                        });
                    });
            });
    });
}

function addNewProduct() {
    //SELECT department_name FROM products  GROUP BY department_name;
    let departmentArray = [];
    db.query("SELECT department_name FROM products  GROUP BY department_name",
            function (err, res) {
                if (err) throw err;
                for (let i = 0; i < res.length; i++) {
                    departmentArray.push(res[i].department_name);
                }
    });
            
    inquirer.prompt(
        [{
            name: "itemname",
            type: "input",
            message: "Input name of new item to add:",
        },
        {
            name: "itemdepartment",
            type: "list",
            message: "Select department to add item to:",
            choices: departmentArray
        },
        {
            name: "itemprice",
            type: "input",
            message: "Input price of this new item:",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        },
        {
            name: "itemquantity",
            type: "input",
            message: "Input quantity of this new item to add:",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }],
    )
        .then(function (answer) {
            let newName = answer.itemname;
            let newDepartmentPut = answer.itemdepartment;
            let newPrice = parseInt(answer.itemprice);
            let newQuantity = parseInt(answer.itemquantity);

            //INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ('60" Screen TV', 'electronics', 1000, 10);
            db.query("INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ('" + 
            newName + "','" +  newDepartmentPut + "'," + newPrice + "," + newQuantity + ")",
            function (err, res) {
                if (err) throw err;
                console.log("\nSuccess!  Added " + newName + " into the " + newDepartmentPut + " department, with price of " + newPrice + 
                " and a starting quantity of " + newQuantity +".");
                console.log("\nHere is the current list and status of products now.");
                viewProducts();
            });
        });
    
}

// "INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?)",
//                 [
//                     { product_name: newName },
//                     { department_name: newDepartmentPut },
//                     { price: newPrice },
//                     { stock_quantity: newQuantity }
//                 ],