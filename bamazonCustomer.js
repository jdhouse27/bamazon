require("dotenv").config();
const mysql = require("mysql");
const keys = require("./keys.js")
const bamazon = keys.bamazon;
const {printTable} = require('console-table-printer');
const inquirer = require("inquirer");

let quant = "";
let prodID = "";
let prod = "";
let price = "";
let departName = "";

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
    connection.query("SELECT item_id, product_name, price FROM products", function(err, res) {
      if (err) throw err; 
      printTable(res);
      ask();
    });
  }

function ask(){
  inquirer.prompt({
    
      type: "list",
      name: "action",
      message: "Welcome to our online store.  Please select an option",
      choices: [
        "I would like to place an order?",
        "Exit"
        ]
    })
    .then(function(answer){
        switch (answer.action) {
          case "I would like to place an order?":
            order();
            break;
        
          case "Exit":
            exit();
            break;
        }
      });
  }       

function order() {
  inquirer.prompt({
      type: "input",
      name: "itemID",
      message: "Please enter the number of the item_ID you would like to purchase.",
    })
  .then(function(answer) {
    let query = "SELECT * FROM products WHERE ?";
    
    connection.query(query, { item_id: answer.itemID}, function(err, res) {
      if (err) throw err; 

      quant = res[0].stock_quantity;
      prodID = res[0].item_id;
      prod = res[0].product_name;
      price = res[0].price;
      departName = res[0].department_name;

      if (quant > 0) {
        //log customer item       
        console.log(
          "\n" + "==============================================================" + "\n" +
          "Item: " + prod + " | Price: " + price + " | Items available: " + quant
          + "\n" + "==============================================================" + "\n");
        orderCorrect();
      
       // quantity is 0, ask customer to select a new item
      } else {
        console.log(
          "\n" + "==============================================================" + "\n" +
          "Sorry we currently do not have " + res[0].product_name + "in stock.  May we find you another item?"
          + "\n" + "==============================================================" + "\n");
        ask();
        }
      });
    });
  }

function exit() {
  console.log("Ok, thank you for stopping by.  Come back soon!");
  connection.end();
};


function orderCorrect(){
  inquirer.prompt({
      type: "list",
      name: "action",
      message: "Is the the correct product?",
      choices: [
        "Yes, I would like to place an order?",
        "No"
        ]
    })
    .then(function(answer){
      switch (answer.action) {
        case "Yes, I would like to place an order?":
          quantCheck();
          break;
      
        case "No":
          order();
          break;
      }
    });
};

//ask customer how many they would like to purchase
function quantCheck() {

  inquirer.prompt({
      type: "input",
      name: "quantity",
      message: "Ok, How many would you like to purchase?"
    })
    .then(function(answer2) {
    
    if (answer2.quantity <= quant){
      // create new variable of the difference
      let newQuant = quant - answer2.quantity;
      // create new update query
      let query2 = "UPDATE products SET ? WHERE item_id =" + prodID;
        connection.query(query2, {stock_quantity: newQuant}, function(err, res) {              
          if (err) throw err;  

          console.log(
            "\n" + "==============================================================" + "\n" +
            "You have purchased " + answer2.quantity + " unit(s) of the " + prod + " product."
            + "\n" + "==============================================================" + "\n");   
          });
            

            let productSales = parseFloat(price) * parseFloat(answer2.quantity);
            productSales = parseFloat(productSales);
            let query3 = "UPDATE products SET ? WHERE department_name=" + departName;
            connection.query(query3, {product_sales: productSales}, function(err, res){
              connection.end();      
              
        })
        ;               
      } else {
        console.log(
          "\n" + "==============================================================" + "\n" +
          "Sorry we currently only have " + quant + " of your in stock.  Please adjust your quantity."
          + "\n" + "==============================================================" + "\n");
          quantCheck();
      }
    });
}
