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
            type: "number",
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
                }).then(function(answer2) {
                    if (answer2.confirm){
                        inquirer.prompt({
                            name: "addInvent",
                            type: "number",
                            message: "How many would you like to add"
                        }).then(function(answer3) {
                            let newQuant = parseInt(quant) + parseInt(answer3.addInvent);
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
    inquirer.prompt({
        name: "addProd",
        type: "input",
        message: "What product would you like to add?",
    }).then(function(answer4) {
        let addProd = answer4.addProd;

        inquirer.prompt({
                name: "addDepart",
                type: "input",
                message: "What department does new product belong to?"
        }).then(function(answer5) {
            let addDepart = answer5.addDepart;

            inquirer.prompt({
                name: "addPrice",
                type: "number",
                message: "What is this product's price?"
            }).then(function(answer6) {
                let addPrice = parseFloat(answer6.addPrice);

                inquirer.prompt({
                    name: "addNewQuant",
                    type: "input",
                    message: "How many products are available?"
                }).then(function(answer7) {
                    let addNewQuant = parseInt(answer7.addNewQuant);                    
                    let newProdQuery = "INSERT INTO products SET ?";
                    
                    connection.query(newProdQuery, {product_name: addProd, department_name: addDepart, price: addPrice, stock_quantity: addNewQuant} , function(err, res) {    
                        // console.log("product_name: " + addProd + "\n" + "department_name: " + addDepart + "\n" + "price: " + addPrice + "\n" + "stock_quantity: " + addNewQuant);                        
                        // console.log(res);                         
                        console.log("\n" + "===========================================" + "\n"
                        + addProd + " has been added with a price of " + addPrice + " and quantity of " 
                        + addNewQuant + "!" + "\n" + "===========================================" + "\n")
                        menu();
                        });                    
                    });
                });
            });
        });
    }