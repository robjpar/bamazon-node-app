CREATE DATABASE IF NOT EXISTS bamazon;

USE bamazon;

CREATE TABLE IF NOT EXISTS products (
    item_id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(100) NOT NULL,
    department_name VARCHAR(50) DEFAULT 'Undefinied',
    price DECIMAL(12 , 2 ) DEFAULT '0.00',
    stock_quantity INT DEFAULT '0',
    product_sales DECIMAL(12 , 2 ) DEFAULT '0.00',
    PRIMARY KEY (item_id , product_name)
);

CREATE TABLE IF NOT EXISTS departments (
    department_id INT NOT NULL AUTO_INCREMENT,
    department_name VARCHAR(50) NOT NULL,
    overhead_costs DECIMAL(12 , 2 ) DEFAULT '0.00',
    PRIMARY KEY (department_id , department_name)
);
