require("dotenv").config();
var keys = require("./keys.js");
var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: keys.mySQLKeys.mysql_host,
    port: keys.mySQLKeys.mysql_port,
    user: keys.mySQLKeys.mysql_user,
    password: keys.mySQLKeys.mysql_password,
    database: "bamazon"
});

function addSpace(s, end) {
    for (var i = (s.length - 1); i < 20; i++) {
        s += " ";
    };
    if (end) {
        s += "|";
    };
    return s;
};

function printProducts() {
    connection.query("SELECT * from products", 
    function(err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            var name = "| " + addSpace(res[i].product_name, false);
            var price = "$" + addSpace(res[i].price.toString(), false);
            var itemId = "id#" + addSpace(res[i].item_id.toString(), false);
            var department = addSpace(res[i].department_name, true); 
            console.log(name + price + itemId + department);
        };
        console.log("|                                                                                         |");
        console.log("+-----------------------------------------------------------------------------------------+");    
        shop();
    });
};

var start = function() {
    console.log("+-----------------------------------------------------------------------------------------+");
    console.log("|                                                                                         |");
    console.log("| Welcome to the Bamazon!!!                                                               |");
    console.log("|                                                                                         |");
    console.log("| Items available for sale:                                                               |");
    console.log("|                                                                                         |");
    console.log("| " + addSpace("Name:", false) + addSpace("Price:", false) + " " + addSpace("ID:", false) + "   " + addSpace("Department:", true));
    printProducts();
};
start();

var shop = function() {
    inquirer.
        prompt([{
            type: "number",
            name: "id",
            message: "Please enter the id# of the product that you would like to buy: "
        }]).then(function(answer) {
            var item_id = answer.id;
            connection.query("SELECT * FROM products WHERE ?", 
            {
                item_id
            },
            function(err, res) {
                if (err) throw err;
                if (res.length > 0) {
                    var quantity = res[0].stock_quantity;
                    var price = res[0].price;
                    purchase(item_id, quantity, price);
                } else {
                    console.log("No product found!");
                    retry();
                }
            });
        });
};

var purchase = function(item_id, quantity, price) {
    inquirer.
        prompt([{
            type: "number",
            name: "units",
            message: "Please enter how many units you would like to buy: "
        }]).then(function(answer) {
            var units = answer.units;
            if (units <= quantity) {
                var new_quantity = quantity - units;
                connection.query("UPDATE products SET ? WHERE ?", 
                [
                    {
                        stock_quantity: new_quantity
                    },
                    {
                        item_id
                    }
                ],
                function(err, res) {
                    if (err) throw err;
                    console.log("Your total cost for this purchase is: $" + (units * price));
                    retry();
                });
            } else {
                console.log("Insufficient quantity!");
                retry();
            };
        });
};

var retry = function() {
    inquirer.
        prompt([{
            type: "confirm",
            name: "confirm",
            message: "Would you like to try again?",
            default: true
        }]).then(function(answer) {
            if (answer.confirm) {
                start();
            } else {
                console.log("Thank you for visiting. Please come again!");
                connection.end();
            }
        });
};