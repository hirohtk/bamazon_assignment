var mysql = require("mysql");
var inquirer = require("inquirer");
var password = require("../password");
var colors = require('colors');


// MY NOTES: 
// ANY TIME QUERYING SQL DATABASE, THE RESPONSE ALWAYS COMES BACK AS AN ARRAY
// CONTAINING AN OBJECT WHERE YOU *NEED* TO SPECIFY THE COLUMN NAME 
// (WHICH IS A PROPERTY) TO CALL THE VALUE IN ORDER TO USE IT 


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

let itemChosen;
let itemQuantityToBuy;
let itemsLeft;
let totalPrice;

function start() {
    console.clear();
    console.log("Welcome to BAMAZON!".yellow);
    console.log("\n" + "Displaying all products...".green + "\n");
    db.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement
        //console.log(res);

        let itemNameArray = [];
        for (let i = 0; i < res.length; i++) {
            console.log("Item ID: ".yellow + res[i].item_id + " | ".yellow + "Product name: ".yellow + res[i].product_name + " | ".yellow +
                "Department name: ".yellow + res[i].department_name + " | ".yellow + "Price: ".yellow + "$" + res[i].price + " | ".yellow +
                "Stock Quantity: ".yellow + res[i].stock_quantity);
            itemNameArray.push(res[i].product_name);
            //itemPropertyArray.push(res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity)
        }
        console.log("\n")
        inquirer.prompt({
            name: "itemtobuy",
            type: "list",
            message: "Which item would you like to buy?",
            choices: itemNameArray
        })
            .then(function (answer) {
                itemChosen = answer.itemtobuy;
                inquirer.prompt({
                    name: "quantity",
                    type: "input",
                    message: "How many units of " + itemChosen + " would you like to buy?",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return false;
                    }
                })
                    .then(function (answer) {
                        itemQuantityToBuy = answer.quantity;
                        stockCheck();
                    });
            });
    });
}

function stockCheck() {
    db.query("SELECT stock_quantity FROM products WHERE product_name =" + "'" + itemChosen + "'", function (err, res) {
        if (err) throw err;
        itemsLeft = res[0].stock_quantity;
        //console.log("There are " + itemsLeft + " units left");
        if (itemsLeft < itemQuantityToBuy) {
            console.log("Insufficient quantity of " + itemChosen + "!");
            reset();
        }
        else {
            makePurchase();
        }

    });
}

function makePurchase() {
    db.query("SELECT price FROM products WHERE product_name =" + "'" + itemChosen + "'", function (err, res) {
        if (err) throw err;
        totalPrice = res[0].price * itemQuantityToBuy;
        console.log("Your total Price is $" + totalPrice);
        inquirer.prompt({
            name: "areyousure",
            type: "list",
            message: "Would you like to proceed with the purchase of " + itemQuantityToBuy + " units of " + itemChosen + " for a grand total of "
                + totalPrice + " dollars?",
            choices: ["YES", "NO"]
        })
            .then(function (answer) {
                let itemID;
                if (answer.areyousure === "YES") {
                    db.query("SELECT item_id FROM products WHERE product_name =" + "'" + itemChosen + "'", function (err, res,) {
                        if (err) throw err;
                        itemID = res[0].item_id;
                        itemsLeft -= itemQuantityToBuy;
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
                                console.log("\nThank you for your purchase!")
                                console.log("There are now " + itemsLeft + " units of " + itemChosen + " left.")
                                reset();
                            });
                    });
                    // HAD ASYNC PROBLEM HERE WHERE I HAD THE SECOND QUERY OUTSIDE OF THE TOP ONE- NEXT QUERY DOESN'T HAVE THE ITEM ID IN TIME 
                }
                else {
                    reset();
                }
            });
    });
}

function reset() {
    console.log("Routing you back to choose another item in 3 seconds...");
    setTimeout(start, 3000);
}