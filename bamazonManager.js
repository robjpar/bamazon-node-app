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
        'View low inventory',
        'Add to inventory',
        'Add a new product',
        new inquirer.Separator(),
        'Quit'
      ],
    }])
    .then((answers) => {
      if (answers.option === 'View inventory') {
        showInventory();
      } else if (answers.option === 'View low inventory') {
        showLowInventory();
      } else if (answers.option === 'Add to inventory') {
        addToInventory();
      } else if (answers.option === 'Add a new product') {
        addNewProduct();
      } else {
        mysqlConnection.end();
      }
    });
};

const showInventory = () => {
  mysqlConnection.query(
    'SELECT item_id, product_name, department_name, price, stock_quantity FROM products',
    (error, inventory) => {
      if (error) {
        print(`!!! Could not query: ${error}`);
      } else {
        console.table('>>> Inventory', inventory);
        showOptions();
      }
    });
};

const showLowInventory = () => {
  mysqlConnection.query(
    'SELECT item_id, product_name, department_name, price, stock_quantity FROM products WHERE stock_quantity < 50',
    (error, inventory) => {
      if (error) {
        print(`!!! Could not query: ${error}`);
      } else if (inventory.length === 0) {
        print('>>> No low inventory');
        showOptions();
      } else {
        console.table('>>> Low Inventory', inventory);
        showOptions();
      }
    });
};

const addToInventory = () => {
  mysqlConnection.query(
    'SELECT item_id, product_name, stock_quantity FROM products',
    (error, inventory) => {
      if (error) {
        print(`!!! Could not query: ${error}`);
      } else {
        inquirer
          .prompt([{
            name: 'id',
            type: 'number',
            message: 'ID of the item being added',
            validate: (value) => /^\d+$/.test(value) && value >= 1 && value <= inventory.length, // one integer, at least one digit, within the range
          }, {
            name: 'quantity',
            type: 'number',
            message: 'How many units',
            validate: (value) => /^\d+$/.test(value), // one integer, at least one digit
          }])
          .then((answers) => {
            const updatedQuantity = inventory[answers.id - 1].stock_quantity + answers.quantity;

            mysqlConnection.query(
              'UPDATE products SET stock_quantity = ? WHERE item_id = ?', [updatedQuantity, answers.id],
              (error) => {
                if (error) {
                  print(`!!! Could not query: ${error}`);
                } else {
                  print(`>>> You added ${answers.quantity} units of ${inventory[answers.id - 1].product_name}`);
                  print('');
                  showOptions();
                }
              });
          });
      }
    });
};

const addNewProduct = () => {
  mysqlConnection.query(
    'SELECT DISTINCT department_name FROM departments ORDER BY department_name',
    (error, departments) => {
      if (error) {
        print(`!!! Could not query: ${error}`);
      } else {
        inquirer
          .prompt([{
            name: 'name',
            type: 'input',
            message: 'Name of the item being added',
            validate: (value) => /^[a-zA-Z0-9 ]*$/.test(value), // alphanumeric with spaces
          }, {
            name: 'department',
            type: 'list',
            message: 'Choose the department',
            choices: departments.map((item) => item.department_name),
          }, {
            name: 'price',
            type: 'number',
            message: 'Price',
            validate: (value) => !isNaN(value),
          }])
          .then((answers) => {
            mysqlConnection.query(
              'INSERT INTO products (product_name, department_name, price) VALUES (?, ?, ?)', [answers.name, answers.department, answers.price],
              (error) => {
                if (error) {
                  print(`!!! Could not query: ${error}`);
                } else {
                  print(`>>> You added ${answers.name} to ${answers.department} priced at ${answers.price}`);
                  print('');
                  showOptions();
                }
              });
          });
      }
    });
};
