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

  connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    Products();
  });
  
  function Products() {
    connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err; 
      printTable(res);
      askID();
    });
  }

function askID() {
  inquirer.prompt([
    {
      type: "input",
      name: "itemID",
      message: "What is the ID of the item you would like to purchase?"
    }
      ]).then(function(answer) {
        let query = "SELECT * FROM products WHERE ?";
        connection.query(query, { item_id: answer.itemID}, function(err, res) {
          if (err) throw err; 

          let quant = res[0].stock_quantity;
          let prodID = res[0].item_id;
          let prod = res[0].product_name;
          let price = res[0].price;

          if (quant > 0){
          //log customer item
          console.log("Item: " + prod + " | Price: " + price + " | Items available: " + quant);
                    
          //ask customer how many they would like to purchase
            inquirer.prompt([
              {
                type: "input",
                name: "quantity",
                message: "How many would you like to purchase?"
              },
            ]).then(function(answer2) {

              if (answer2.quantity <= quant){
                // create new variable of the difference
                let newQuant = quant - answer2.quantity;
                // create new update query
                let query2 = "UPDATE products SET ? WHERE item_id =" + prodID;

                  connection.query(query2, {stock_quantity: newQuant}, function(err, res) {
                
                    if (err) throw err;
                
                    console.log("You have purchased " + answer2.quantity + " unit(s) of " + prod);
                
                    connection.end();
                
                  });
                }
              });

          // quantity is 0, ask customer to select a new item
        } else {
          console.log("Sorry we currently do not have " + res[0].product_name + "in stock.  May we find you another item?")
          askID();
          }
      });
    });
  }

