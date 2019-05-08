require("dotenv").config();

const mysql = require("mysql");

const keys = require("./keys.js")
const bamazon = keys.bamazon;
const {printTable} = require('console-table-printer');

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
    // connection.end();
    Products();
  });
  
  function Products() {
    connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err; 
      printTable(res);
      
      // for (let i = 0; i < res.length; i++){
// 
        // Log all results of the SELECT statement
        // console.log(res[i] + '\n' + "====================================" + '\n');
      // }
      connection.end();
    });
  }