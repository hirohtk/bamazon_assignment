# bamazon_assignment

Links for a walkthrough the assignemnt:  https://drive.google.com/file/d/1KYaY_zQTFGgR_Zya8wFI-D3NweHIrvT7/view https://drive.google.com/file/d/1gNlV1z40NvZZ6fzRgPuYvt7ND24tqCGC/view

In this assignment, there are three apps that have been created which are executed in NodeJS.  

Node packages used for this assignment are:

-  Tables (for displaying data in the supervisor app)
-  MySQL (used in all apps to communicate with MySQL database)
-  Inquirer (used in all apps to get user input to use with communication to MySQL database)
-  colors (used in all apps to make CLI visuals more distinguishing)

A brief description of each app is as follows:

Customer:

- Displays prices of each item that can be purchased
- Can allow purchase of items which checks for sufficient stock of an item in MySQL database, and subsequently decreases quantity count in MySQL database for that item

Manager:

- Views current set of products (same view that customer has in app above)
- Finds and returns products that have less than 5 units in stock
- Adds quantity to a certain item's inventory
- Adds a new item to a certain department, and sets price, stock information

Supevisor: 

- Views the total amount of sales for a certain department (grouped all item sales in a certain department) versus department overhead
- Allows the creation of a new department

The use of appropriate MySQL queries was cruicial to making these apps work.
