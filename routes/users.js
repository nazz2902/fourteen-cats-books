const { check, validationResult } = require("express-validator");
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const saltRounds = 10;

// Middleware to redirect if not logged in
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect("./login"); // Redirect to the login page
  } else {
    next(); // Move to the next middleware function
  }
};

// GET route for rendering the registration form
router.get("/register", function (req, res, next) {
  res.render("register.ejs", {
    shopData: { shopName: "Your Shop Name" },
    errors: [],
  }); // Pass an empty errors array initially
});

// POST route for handling user registration
router.post(
  "/registered",
  [
    check("email").isEmail().withMessage("Please enter a valid email."),
    check("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long."),
    check("username").notEmpty().withMessage("Username is required."),
    check("first_name").notEmpty().withMessage("First name is required."),
    check("last_name").notEmpty().withMessage("Last name is required."),
  ],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("register.ejs", {
        shopData: { shopName: "Your Shop Name" },
        errors: errors.array(), // Send validation errors to the template
      });
    }

    const plainPassword = req.sanitize(req.body.password);

    bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
      if (err) {
        return next(err); // Handle error
      }

      // Prepare sanitized inputs
      const username = req.sanitize(req.body.username);
      const first_name = req.sanitize(req.body.first_name);
      const last_name = req.sanitize(req.body.last_name);
      const email = req.sanitize(req.body.email);

      // SQL query to insert user data into the database
      let sqlquery = `INSERT INTO users (username, first_name, last_name, email, hashedPassword) VALUES (?, ?, ?, ?, ?)`;
      let newrecord = [username, first_name, last_name, email, hashedPassword];

      // Store the new record in the database
      db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
          return next(err); // Handle SQL error
        }

        let responseMessage = `Hello ${first_name} ${last_name}, you are now registered!`;
        responseMessage += ` We will send an email to you at ${email}.`;

        res.send(responseMessage);
      });
    });
  }
);

// GET route for rendering the login form
router.get("/login", function (req, res, next) {
  res.render("login.ejs"); // Render the login form
});

// POST route for handling user login
router.post(
  "/loggedin",
  [check("username").notEmpty(), check("password").isLength({ min: 8 })],
  function (req, res, next) {
    const username = req.sanitize(req.body.username);
    const password = req.sanitize(req.body.password);

    let sqlquery = `SELECT hashedPassword, first_name, last_name FROM users WHERE username = ?`;

    db.query(sqlquery, [username], (err, results) => {
      if (err) {
        return next(err); // Handle SQL error
      }

      if (results.length === 0) {
        return res.send("Login failed: Username not found.");
      }

      const user = results[0];
      bcrypt.compare(password, user.hashedPassword, function (err, match) {
        if (err) {
          return next(err); // Handle bcrypt error
        }

        if (match) {
          req.session.userId = username; // Save user session here
          res.send(`Welcome back, ${user.first_name} ${user.last_name}!`);
        } else {
          res.send("Login failed: Incorrect password.");
        }
      });
    });
  }
);

// GET route to list all users
router.get("/list", redirectLogin, function (req, res, next) {
  let sqlquery = `SELECT username, first_name, last_name, email FROM users`;

  db.query(sqlquery, (err, result) => {
    if (err) {
      return next(err); // Handle SQL error
    }
    res.render("users.ejs", { users: result });
  });
});

module.exports = router;
