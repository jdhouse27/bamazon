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
            "View Products Sales by Department",            
            "Create New Department",           
            "Exit"
            ]
    })
    .then(function(answer){
        switch (answer.action) {
        case "View Products Sales by Department":
            modDepart();
            break;

        case "Create New Department":
            department();
            break;

        case "Exit":
            connection.end();
            break;
        }
    });
}

function modDepart (){
    connection.query("SELECT * FROM departments", function(err, res){ 
        for (let i = 0; i<res.length; i++){          
          let id = res[i].department_id;
          connection.query("UPDATE departments AS d INNER JOIN (SELECT department_id, SUM(product_sales) AS department_sales FROM products GROUP BY department_id) AS p ON d.department_id = p.department_id SET d.department_sales = p.department_sales WHERE d.department_id =" + id, function(err, res){     
            });
          }
        sales();
     });
};
    
function sales() {
        let query ="UPDATE departments SET total_profit = (department_sales - over_head_costs)";
        connection.query(query, function(err, res){
            returnSales();
        });
};

function returnSales () {
    let salesQuery = "SELECT * FROM departments";
    connection.query(salesQuery, function(err, res) {
        // console.log(salesQuery)
        if (err) throw err; 
        printTable(res);
        menu();
      });
};

// new department
function department() {
    connection.query("SELECT * FROM departments", function(err, res) {
        if (err) throw err; 
        printTable(res);

        inquirer.prompt([
        {
            name: "addDepart",
            type: "input",
            message: "What department name would you like to add?",
        }, {
            name: "addOver",
            type: "INT",
            message: "What are the over head costs for this deparment?"
        }, {
           name: "addSales",
           type: "input",
           message: "Are there any product sales to add?" 
        }, {
            name: "addProfit",
            type: "input",
            message: "Are there any initial profit numbers to add?" 
        }
        ])
         .then(function(answer) {
         
            let depart = answer.addDepart;
            let over = parseFloat(answer.addOver);
            let sales = answer.addSales;
            let profit = answer.addProfit;
           
            // create new update query
            let query2 = "INSERT INTO departments SET ?";

            connection.query(query2, {department_name: depart, over_head_costs: over, product_sales: sales, total_profit: profit}, function(err, res) {
            console.log("\n" + "===========================================" + "\n"
                        + "You added the new department: " + depart + "!" + "\n"
                        + "===========================================" + "\n")

            console.log(res);
            menu();
            })
        });
    });
}