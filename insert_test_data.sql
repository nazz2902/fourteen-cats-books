# Insert data into the tables

USE fc_books;

INSERT INTO books (name, price)VALUES('Portrait of Dorian Gray', 20.25),('Don Quixote', 25.00),('Alices Adventures in Wonderland', 12.99);
INSERT INTO users(username, first_name, last_name, email, hashedPassword)VALUES('dyl001', 'Dyl', 'Karasu', 'dyl001@gold.ac.uk', 123456789);
INSERT INTO users(username, first_name, last_name, email, hashedPassword)VALUES('nturk001', 'Nazli', 'Turkoglu', 'nturk001@gold.ac.uk', 123456789);
