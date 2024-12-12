// Import necessary modules
const { check, validationResult } = require("express-validator");
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const saltRounds = 10; // Number of salt rounds for password hashing

// Middleware to redirect users who are not logged in
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect("./login"); // Redirect to the login page if not logged in
  } else {
    next(); // Allow the request to proceed
  }
};

// GET route to render the registration form
router.get("/register", function (req, res, next) {
  res.render("register.ejs", {
    shopData: { shopName: "Your Shop Name" }, // Pass shop name to template
    errors: [], // Initially, no validation errors
  });
});

// POST route to handle user registration
router.post(
  "/registered",
  [
    // Validate input fields
    check("email").isEmail().withMessage("Please enter a valid email."),
    check("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long."),
    check("username").notEmpty().withMessage("Username is required."),
    check("first_name").notEmpty().withMessage("First name is required."),
    check("last_name").notEmpty().withMessage("Last name is required."),
  ],
  function (req, res, next) {
    // Collect validation errors, if any
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("register.ejs", {
        shopData: { shopName: "Your Shop Name" },
        errors: errors.array(), // Send errors to the template
      });
    }

    // Sanitize the password input to ensure security
    const plainPassword = req.sanitize(req.body.password);

    // Hash the password using bcrypt
    bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
      if (err) {
        return next(err); // Pass error to the error handler
      }

      // Sanitize user inputs to prevent injection attacks
      const username = req.sanitize(req.body.username);
      const first_name = req.sanitize(req.body.first_name);
      const last_name = req.sanitize(req.body.last_name);
      const email = req.sanitize(req.body.email);

      // SQL query to insert the new user into the database
      let sqlquery = `INSERT INTO users (username, first_name, last_name, email, hashedPassword) VALUES (?, ?, ?, ?, ?)`;
      let newrecord = [username, first_name, last_name, email, hashedPassword];

      // Execute the SQL query
      db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
          return next(err); // Handle database errors
        }

        // Prepare a response message
        let responseMessage = `Hello ${first_name} ${last_name}, you are now registered!`;
        responseMessage += ` We will send an email to you at ${email}.`;

        res.send(responseMessage); // Send the response to the user
      });
    });
  }
);

// GET route to render the login form
router.get("/login", function (req, res, next) {
  res.render("login.ejs"); // Render the login template
});

// POST route to handle user login
router.post(
  "/loggedin",
  [
    // Validate login inputs
    check("username").notEmpty().withMessage("Username is required."),
    check("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long."),
  ],
  function (req, res, next) {
    // Sanitize inputs to prevent malicious content
    const username = req.sanitize(req.body.username);
    const password = req.sanitize(req.body.password);

    // SQL query to find the user by username
    let sqlquery = `SELECT hashedPassword, first_name, last_name FROM users WHERE username = ?`;

    // Execute the SQL query
    db.query(sqlquery, [username], (err, results) => {
      if (err) {
        return next(err); // Handle database errors
      }

      // Check if a user with the provided username exists
      if (results.length === 0) {
        return res.send("Login failed: Username not found."); // Handle invalid username
      }

      const user = results[0]; // Retrieve the user's details from the query result

      // Compare the provided password with the stored hashed password
      bcrypt.compare(password, user.hashedPassword, function (err, match) {
        if (err) {
          return next(err); // Handle bcrypt errors
        }

        if (match) {
          req.session.userId = username; // Save the user's session
          res.send(`Welcome back, ${user.first_name} ${user.last_name}!`); // Greet the user
        } else {
          res.send("Login failed: Incorrect password."); // Handle invalid password
        }
      });
    });
  }
);

// GET route to list all users
router.get("/list", redirectLogin, function (req, res, next) {
  // SQL query to retrieve user data
  let sqlquery = `SELECT username, first_name, last_name, email FROM users`;

  // Execute the SQL query
  db.query(sqlquery, (err, result) => {
    if (err) {
      return next(err); // Handle database errors
    }
    res.render("users.ejs", { users: result }); // Render the users template with the result
  });
});

// Export the router so it can be used in the main application
module.exports = router;
