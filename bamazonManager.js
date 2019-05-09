require("dotenv").config();
const mysql = require("mysql");
const keys = require("./keys.js")
const bamazon = keys.bamazon;
const {printTable} = require('console-table-printer');
const inquirer = require("inquirer");

// create the connection information for the sql database
const connection = mysql.createConnection({
    host: "localhost",
    // Port
    port: 3306,
    // Username
    user: "root",  
    // Password
    password: bamazon.password,
    database: "bamazonDB"
});

connection.connect(function(err){
    if (err) throw err;

    menu();
});

function menu(){
    inquirer.prompt({
        name: "action",
        type: "list",
        message: "What would you like to do today?",
        choices: [
            "View Products for Sale",            
            "View Low Inventory",            
            "Add to Inventory",            
            "Add New Product",
            "Exit"
        ]
    })
    .then(function(answer){
        switch (answer.action) {
        case "View Products for Sale":
            viewProducts();
            break;

        case "View Low Inventory":
            viewLow();
            break;

        case "Add to Inventory":
            addInventory();
            break;
            
        case "Add New Product":
            addNew();
            break;

        case "Exit":
            connection.end();
            break;
        }
    });
}

function viewProducts() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err; 
        printTable(res);
        menu();
      });
}

function viewLow() {
    connection.query("SELECT * FROM products WHERE stock_quantity <= 5", function(err, res) {
        if (err) throw err; 
        printTable(res);
        menu();
      });
}

function addInventory() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err; 
        printTable(res);

        inquirer.prompt({
            name: "addAction",
            type: "input",
            message: "What item_id would you like to add to?",
                
        }).then(function(answer) {
            let query = "Select * FROM products WHERE ?";

            connection.query(query, {item_id: answer.addAction}, function(err, res) {
                if (err) throw err; 
                // console.log(res);
                let quant = res[0].stock_quantity;
                let prodID = res[0].item_id;
                let prod = res[0].product_name;
                let price = res[0].price;
    
                //log customer item
                console.log(
                    "\n" + "===============================================" + "\n" +
                    "Item: " + prod + " | Price: " + price + " | Items available: " + quant
                    + "\n" + "===============================================" + "\n");

                inquirer.prompt({
                    name: "confirm",
                    type: "confirm",
                    message: "Is this the correct product?",
                    default: true
                }).then(function(answer) {
                    if (answer.confirm){
                        inquirer.prompt({
                            name: "addProd",
                            type: "input",
                            message: "How many would you like to add"
                        }).then(function(answer2) {
                            let newQuant = parseInt(quant) + parseInt(answer2.addProd);
                            // create new update query
                            let query2 = "UPDATE products SET ? WHERE item_id =" + prodID;
                            
                            connection.query(query2, {stock_quantity: newQuant}, function(err, res) {
                            console.log("\n" + "===========================================" + "\n"
                                        + "Your product stock quantity has been updated!" + "\n"
                                        + "===========================================" + "\n")
                            menu();
                            })
                        })
                    } else {
                        console.log("Ok, let's try again.")
                        addInventory();
                    }
                })
            });

        });
    });
}

function addNew() {

}