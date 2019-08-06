DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
	item_id INT UNIQUE,
    product_name VARCHAR(100),
    department_name VARCHAR(100),
    price DECIMAL(10,2),
    stock_quantity INT 
);

INSERT INTO products(item_id, product_name, department_name, price, stock_quantity)
VALUES (3005, "cereal", "breakfast", 3.00, 10),
	   (3029, "poptarts", "breakfast", 5.00, 5),
       (6003, "broom", "cleaning_products", 10.00, 3),
       (6044, "paper towels", "cleaning_products", 3.00, 15),
       (5002, "iphone", "electronics", 1000, 2),
       (5011, "ps4", "electronics", 500, 4),
       (5012, "xbox one", "electronics", 400, 100),
	   (1601, "apple", "produce", 1.00, 10),
	   (1602, "bananas", "produce", 1.00, 10),
	   (1610, "carrots", "produce", 2.00, 7),
       (1650, "spinach", "produce", 2.00, 5);