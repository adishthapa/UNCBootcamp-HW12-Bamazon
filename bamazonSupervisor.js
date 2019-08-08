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
    console.log("+--------------------------------------------------------------------------------------------------------------+");
    console.log("|                                                                                                              |");
    console.log("| Welcome to the Bamazon!!! (Supervisor)                                                                       |");
    console.log("|                                                                                                              |");
    console.log("+--------------------------------------------------------------------------------------------------------------+");  
    inquirer
        .prompt([{
            type: "list",
            name: "option",
            message: "Please select what you would like to do: ",
            choices: ["View Product Sales by Department", "Create New Department", "Exit Application"]
        }]).then(function(answer) {
            switch(answer.option) {
                case "View Product Sales by Department":
                    viewProductSalesByDepartment();
                    break;
                case "Create New Department":
                    createNewDepartment();
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

var viewProductSalesByDepartment = function() {
    console.log("+---------------------------------------------------------------------------------------------------------------+");
    console.log("|                                                                                                               |");
    console.log("| Product Sales By Department:                                                                                  |");
    console.log("|                                                                                                               |");
    console.log("+---------------------------------------------------------------------------------------------------------------+");
    console.log("| " + addSpace("ID:", false) + "   " + addSpace("Name:", false) + addSpace("Over Head Costs:", false) + " " + addSpace("Product Sales:", false) + " " +  addSpace("Total Profit:", true));
    console.log("+---------------------------------------------------------------------------------------------------------------+");
    connection.query("SELECT department_id, departments.department_name, over_head_costs, SUM(products.product_sales) AS product_sales, SUM(product_sales) - over_head_costs AS total_profit FROM departments INNER JOIN products ON departments.department_name = products.department_name GROUP BY department_id, departments.department_name, over_head_costs ORDER BY department_id;", 
    function(err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            var id = "| id#" + addSpace(res[i].department_id.toString(), false);
            var name = addSpace(res[i].department_name, false);
            var costs = "$" + addSpace(res[i].over_head_costs.toString(), false);
            var sales = "$" + addSpace(res[i].product_sales.toString(), false); 
            if (res[i].total_profit.toString()[0] === "-") {
                var profit = addSpace(res[i].total_profit.toString(), true)
            } else {
                var profit = addSpace("+" + res[i].total_profit.toString(), true)
            }
            console.log(id + name + costs + sales + profit);
        };
        console.log("|                                                                                                               |");
        console.log("+---------------------------------------------------------------------------------------------------------------+");
        chooseAgain();    
    });
};

var createNewDepartment = function() {
    inquirer
    .prompt([{
        type: "number",
        name: "id",
        message: "Please enter the ID for the new Department: "
    }]).then(function(answer1) {
        var department_id = answer1.id;
        connection.query("SELECT * FROM departments WHERE ?;", 
        {
            department_id
        },
        function(err1, res1) {
            if (err1) throw err1;
            if (res1.length > 0) {
                console.log("Department with the given ID already exists!");
                chooseAgain();
            } else {
                inquirer
                .prompt([
                    {
                        type: "input",
                        name: "name",
                        message: "Please enter the name for the new Department: "
                    },
                    {
                        type: "number",
                        name: "costs",
                        message: "Please enter the over head costs for the new Department: "
                    }
                ]).then(function(answer2) {
                    var department_name = String(answer2.name);
                    var over_head_costs = answer2.costs;
                    connection.query("INSERT INTO departments SET ?", 
                    {
                        department_id,
                        department_name,
                        over_head_costs
                    }, function(err2, res2) {
                        if (err2) throw err2;
                        console.log(res2.affectedRows + " department has been Added!");
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
            message: "Please select what you would like to do: ",
            choices: ["View Product Sales by Department", "Create New Department", "Exit Application"]
        }]).then(function(answer) {
            switch(answer.option) {
                case "View Product Sales by Department":
                    viewProductSalesByDepartment();
                    break;
                case "Create New Department":
                    createNewDepartment();
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