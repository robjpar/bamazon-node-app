require('dotenv').config();
const inquirer = require('inquirer');
const mysql = require('mysql');
require('console.table');

const print = (text) => console.log(text);

const connectionConfig = {
  host: process.env.HOST,
  port: process.env.PORT,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
};

const mysqlConnection = mysql.createConnection(connectionConfig);

mysqlConnection.connect((error) => {
  if (error) {
    print(`!!! Could not connect: ${error}`);
  } else {
    print(`>>> Connected to: ${mysqlConnection.config.database}`);
    showInventory();
  }
});

const showInventory = () => {
  mysqlConnection.query(
    'SELECT item_id, product_name, price, stock_quantity, product_sales FROM products',
    (error, inventory) => {
      if (error) {
        print(`!!! Could not query: ${error}`);
      } else {
        console.table('\nItems available for sale', inventory.map((item) => { // the stock quantity and product sales are not displayed in the table
          return {
            item_id: item.item_id,
            product_name: item.product_name,
            price: item.price,
          };
        }));
        showOptions(inventory);
      }
    });
};

const showOptions = (inventory) => {
  print('\nStarting a new order...');
  inquirer
    .prompt([{
      name: 'id',
      type: 'number',
      message: 'ID of the item being ordered',
      validate: (value) => /^\d+$/.test(value) && value >= 1 && value <= inventory.length, // one integer, at least one digit, within the range
    }, {
      name: 'quantity',
      type: 'number',
      message: 'How many units',
      validate: (value) => /^\d+$/.test(value), // one integer, at least one digit
    }])
    .then((answers) => {
      if (answers.quantity > inventory[answers.id - 1].stock_quantity) {
        print('\nInsufficient quantity!!!');
        showOptions(inventory);
      } else {
        const orderTotal = answers.quantity * inventory[answers.id - 1].price;
        const remainingQuantity = inventory[answers.id - 1].stock_quantity - answers.quantity;
        const totalSales = inventory[answers.id - 1].product_sales + orderTotal;

        mysqlConnection.query(
          'UPDATE products SET stock_quantity = ?, product_sales = ? WHERE item_id = ?', [remainingQuantity, totalSales, answers.id],
          (error) => {
            if (error) {
              print(`!!! Could not query: ${error}`);
            }
          });
        mysqlConnection.end();

        print(`\nYou ordered ${answers.quantity} units of ${inventory[answers.id - 1].product_name}`);
        print(`Your total is: ${orderTotal.toFixed(2)} `);
      }
    });
};
