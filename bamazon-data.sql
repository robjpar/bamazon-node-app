USE bamazon;

INSERT INTO products
(product_name, department_name, price, stock_quantity)
VALUES
('Milk', 'Food', 3.67, 1000),
('Bread', 'Food', 2.88, 2000),
('Apples', 'Food', 4.20, 500),
('Soap', 'Household', 1.99, 1500),
('Toothpaste', 'Household', 4.39, 1000),
('Kitchen cleaner', 'Household', 5.12, 300),
('Laptop', 'Electronics', 1599.00, 2000),
('Photo camera', 'Electronics', 980.00, 1200),
('Smartphone', 'Electronics', 765.00, 1700),
('Printer paper', 'Office', 6.85, 2400),
('Pen', 'Office', 0.89, 3000),
('Envelopes', 'Office', 6.29, 100);

INSERT INTO departments
(department_name, overhead_costs)
VALUES
('Food', 2000),
('Household', 1500),
('Electronics', 1000),
('Office', 800);
