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

var start = function() {
    console.log("+-----------------------------------------------------------------------------------------+");
    console.log("|                                                                                         |");
    console.log("| Welcome to the Bamazon!!! (Manager)                                                     |");
    console.log("|                                                                                         |");
    console.log("+-----------------------------------------------------------------------------------------+");  
    inquirer
        .prompt([{
            type: "list",
            name: "option",
            message: "Please select what you would like to do: ",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit Application"]
        }]).then(function(answer) {
            switch(answer.option) {
                case "View Products for Sale":
                    viewProductsForSale();
                    break;
                case "View Low Inventory":
                    viewLowInventory();
                    break;
                case "Add to Inventory":
                    addToInventory();
                    break;
                case "Add New Product":
                    addNewProduct();
                    break;
                case "Exit Application":
                    connection.end();
                    break;
                default:
                    console.log("Sorry the option that you selected does not exist. Please try again.");
                    chooseAgain();
                    break;
            };
        });
};
start();

var viewProductsForSale = function() {
    console.log("+-----------------------------------------------------------------------------------------+");
    console.log("|                                                                                         |");
    console.log("| Items available for sale:                                                               |");
    console.log("|                                                                                         |");
    console.log("+-----------------------------------------------------------------------------------------+")
    console.log("| " + addSpace("Name:", false) + addSpace("Price:", false) + " " + addSpace("ID:", false) + "   " + addSpace("Department:", true));
    console.log("+-----------------------------------------------------------------------------------------+")
    connection.query("SELECT * from products;", 
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
        chooseAgain();    
    });
};

var viewLowInventory = function() {
    console.log("+-----------------------------------------------------------------------------------------+");
    console.log("|                                                                                         |");
    console.log("| Items available for sale: (Low Inventory)                                               |");
    console.log("|                                                                                         |");
    console.log("+-----------------------------------------------------------------------------------------+")
    console.log("| " + addSpace("Name:", false) + addSpace("Price:", false) + " " + addSpace("ID:", false) + "   " + addSpace("Department:", true));
    console.log("+-----------------------------------------------------------------------------------------+")
    connection.query("SELECT * from products WHERE stock_quantity < 5;", 
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
        chooseAgain();    
    });
};

var addToInventory = function() {
    inquirer
    .prompt([{
        type: "number",
        name: "id",
        message: "Please enter the id# of the product that you would like to add to: ",
    }]).then(function(answer1) {
        var item_id = answer1.id;
        connection.query("SELECT * FROM products WHERE ?;", 
        {
            item_id
        },
        function(err1, res1) {
            if (err1) throw err1;
            if (res1.length > 0) {
                var quantity = res1[0].stock_quantity;
                inquirer
                .prompt([{
                    type: "number",
                    name: "amount",
                    message: "Please enter how many new items you would like to add: "
                }]).then(function(answer2) {
                    var amount = answer2.amount;
                    var stock_quantity = amount + quantity;
                    connection.query("UPDATE products SET ? WHERE ?;", 
                    [
                        {
                            stock_quantity
                        },
                        {
                            item_id
                        }
                    ],
                    function(err2, res2) {
                        if (err2) throw err2;
                        console.log(res2.affectedRows + " product has been Updated!");
                        chooseAgain();
                    });
                });
            } else {
                console.log("No product found!");
                chooseAgain();
            };
        });
    });
};

var addNewProduct = function() {
    inquirer
    .prompt([{
        type: "number",
        name: "id",
        message: "Please enter the ID for the new Item: "
    }]).then(function(answer1) {
        var item_id = answer1.id;
        connection.query("SELECT * FROM products WHERE ?;", 
        {
            item_id
        },
        function(err1, res1) {
            if (err1) throw err1;
            if (res1.length > 0) {
                console.log("Item with the given ID already exists!");
                chooseAgain();
            } else {
                inquirer
                .prompt([
                    {
                        type: "input",
                        name: "name",
                        message: "Please enter the name for the new Item: "
                    },
                    {
                        type: "input",
                        name: "department",
                        message: "Please enter the department for the new Item: "
                    }, 
                    {
                        type: "number",
                        name: "price",
                        message: "Please enter the price for the new Item: "
                    },
                    {
                        type: "number",
                        name: "quantity",
                        message: "Please enter a quantity for the new Item: "
                    }
                ]).then(function(answer2) {
                    var product_name = String(answer2.name);
                    var department_name = String(answer2.department);
                    var price = answer2.price;
                    var stock_quantity = answer2.quantity;
                    connection.query("INSERT INTO products SET ?", 
                    {
                        item_id,
                        product_name,
                        department_name,
                        price,
                        stock_quantity
                    }, function(err2, res2) {
                        if (err2) throw err2;
                        console.log(res2.affectedRows + " product has been Added!");
                        chooseAgain();
                    });
                });
            };
        });
    });
};

var chooseAgain = function() {
    inquirer
    .prompt([{
        type: "list",
        name: "option",
        message: "Please select another option: ",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit Application"]
    }]).then(function(answer) {
        switch(answer.option) {
            case "View Products for Sale":
                viewProductsForSale();
                break;
            case "View Low Inventory":
                viewLowInventory();
                break;
            case "Add to Inventory":
                addToInventory();
                break;
            case "Add New Product":
                addNewProduct();
                break;
            case "Exit Application":
                connection.end();
                break;
            default:
                console.log("Sorry the option that you selected does not exist. Please try again.");
                chooseAgain();
                break;
        };
    });
};