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
        'View product sales',
        'View product sales by department',
        'View departments',
        'Create a new department',
        new inquirer.Separator(),
        'Quit'
      ],
    }])
    .then((answers) => {
      if (answers.option === 'View product sales') {
        showSales();
      } else if (answers.option === 'View product sales by department') {
        showSalesByDepartment();
      } else if (answers.option === 'View departments') {
        showDepartments();
      } else if (answers.option === 'Create a new department') {
        createNewDepartment();
      } else {
        mysqlConnection.end();
      }
    });
};

const showSales = () => {
  mysqlConnection.query(
    'SELECT item_id, product_name, department_name, product_sales FROM products',
    (error, inventory) => {
      if (error) {
        print(`!!! Could not query: ${error}`);
      } else {
        console.table('>>> Product sales', inventory);
        showOptions();
      }
    });
};

const showSalesByDepartment = () => {
  const query =
    `SELECT
        departments.department_id,
        departments.department_name,
        departments.overhead_costs,
        products_by_department.total_product_sales, 
        (products_by_department.total_product_sales - departments.overhead_costs) AS total_profit
    FROM departments
    JOIN
        (SELECT
            department_name,
            SUM(product_sales) AS total_product_sales
        FROM products
        GROUP BY department_name
        ) AS products_by_department
    ON departments.department_name = products_by_department.department_name;`;

  mysqlConnection.query(
    query,
    (error, inventory) => {
      if (error) {
        print(`!!! Could not query: ${error}`);
      } else {
        console.table('>>> Product sales by department', inventory);
        showOptions();
      }
    });
};

const showDepartments = () => {
  mysqlConnection.query(
    'SELECT department_id, department_name, overhead_costs FROM departments',
    (error, inventory) => {
      if (error) {
        print(`!!! Could not query: ${error}`);
      } else {
        console.table('>>> Departments', inventory);
        showOptions();
      }
    });
};

const createNewDepartment = () => {
  inquirer
    .prompt([{
      name: 'name',
      type: 'input',
      message: 'Name of the department being created',
      validate: (value) => /^[a-zA-Z0-9 ]*$/.test(value), // alphanumeric with spaces
    }, {
      name: 'costs',
      type: 'number',
      message: 'Overhead costs',
      validate: (value) => !isNaN(value),
    }])
    .then((answers) => {
      mysqlConnection.query(
        'INSERT INTO departments (department_name, overhead_costs) VALUES (?, ?)', [answers.name, answers.costs],
        (error) => {
          if (error) {
            print(`!!! Could not query: ${error}`);
          } else {
            print(`>>> You created ${answers.name} department with the overhead costs of ${answers.costs}`);
            print('');
            showOptions();
          }
        });
    });
};
