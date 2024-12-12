const express = require("express");
const router = express.Router();

// Middleware to redirect to login page if the user is not logged in
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect("/users/login"); // Redirect to the login page if not logged in
  } else {
    next(); // Proceed to the next middleware or route
  }
};

// Route to render the search page
router.get("/search", function (req, res, next) {
  res.render("search.ejs"); // Render the search form template
});

// Route to handle search results
router.get("/search_result", function (req, res, next) {
  // SQL query to search for books with names matching the search text
  let sqlquery =
    "SELECT * FROM books WHERE name LIKE '%" + req.query.search_text + "%'";

  // Execute the SQL query
  db.query(sqlquery, (err, result) => {
    if (err) {
      next(err); // Pass the error to the error handler
    }
    res.render("list.ejs", { availableBooks: result }); // Render the results on the list page
  });
});

// Route to list all books (requires login)
router.get("/list", function (req, res, next) {
  // SQL query to fetch all books
  let sqlquery = "SELECT * FROM books";

  // Execute the SQL query
  db.query(sqlquery, (err, result) => {
    if (err) {
      next(err); // Pass the error to the error handler
    }
    res.render("list.ejs", { availableBooks: result }); // Render the list of books
  });
});

// Route to render the "Add Book" form (requires login)
router.get("/addbook", function (req, res, next) {
  res.render("addbook.ejs"); // Render the add book form
});

// Route to handle adding a new book to the database (requires login)
router.post("/bookadded", function (req, res, next) {
  // SQL query to insert a new book record
  let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";

  // Values for the new book record
  let newrecord = [req.body.name, req.body.price];

  // Execute the SQL query
  db.query(sqlquery, newrecord, (err, result) => {
    if (err) {
      next(err); // Pass the error to the error handler
    } else {
      // Respond with a confirmation message
      res.send(
        "This book is added to the database, name: " +
          req.body.name +
          " price: " +
          req.body.price
      );
    }
  });
});

// Route to list bargain books (price < 20)
router.get("/bargainbooks", function (req, res, next) {
  // SQL query to fetch books with a price less than 20
  let sqlquery = "SELECT * FROM books WHERE price < 20";

  // Execute the SQL query
  db.query(sqlquery, (err, result) => {
    if (err) {
      next(err); // Pass the error to the error handler
    }
    res.render("bargains.ejs", { availableBooks: result }); // Render the bargain books page
  });
});

// Export the router object so it can be used in the main application file
module.exports = router;
