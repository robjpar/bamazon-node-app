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
  database: 'bamazon',
};

const mysqlConnection = mysql.createConnection(connectionConfig);

mysqlConnection.connect((error) => {
  if (error) {
    print(`!!! Could not connect: ${error}`);
  } else {
    print('');
    print(`>>> Connected to: ${mysqlConnection.config.database}`);
    print('');
    showOptions();
  }
});

const showOptions = () => {
  inquirer
    .prompt([{
      name: 'option',
      type: 'list',
      message: 'Choose an option:',
      choices: [
        'View inventory',
        'Place an order',
        new inquirer.Separator(),
        'Quit'
      ],
    }])
    .then((answers) => {
      if (answers.option === 'View inventory') {
        showInventory();
      } else if (answers.option === 'Place an order') {
        placeOrder();
      } else {
        mysqlConnection.end();
      }
    });
};

const showInventory = () => {
  mysqlConnection.query(
    'SELECT item_id, product_name, price FROM products',
    (error, inventory) => {
      if (error) {
        print(`!!! Could not query: ${error}`);
      } else {
        console.table('>>> Inventory', inventory);
        showOptions();
      }
    });
};

const placeOrder = () => {
  mysqlConnection.query(
    'SELECT product_name, price, stock_quantity, product_sales FROM products',
    (error, inventory) => {
      if (error) {
        print(`!!! Could not query: ${error}`);
      } else {
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
              print('>>> Insufficient quantity!!!');
              print('');
              showOptions();
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

              print(`You ordered ${answers.quantity} units of ${inventory[answers.id - 1].product_name}`);
              print(`Your total is: ${orderTotal.toFixed(2)} `);
              print('');
              showOptions();
            }
          });
      }
    });
};
