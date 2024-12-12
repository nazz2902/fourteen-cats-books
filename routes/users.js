const { check, validationResult } = require("express-validator");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;

const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect("./login"); // redirect to the login page
  } else {
    next(); // move to the next middleware function
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
  ],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Pass errors to the view
      return res.render("register.ejs", {
        shopData: { shopName: "Your Shop Name" },
        errors: errors.array(), // Send the validation errors to the template
      });
    }

    // Proceed with registration logic if no errors
    const username = req.sanitize(req.body.username);
    const first_name = req.sanitize(req.body.first_name);
    const last_name = req.sanitize(req.body.last_name);
    const email = req.sanitize(req.body.email);
    const password = req.sanitize(req.body.password);

    // Hash the password
    bcrypt.hash(password, saltRounds, function (err, hashedPassword) {
      if (err) {
        return next(err); // Handle error
      }

      // SQL query to insert user data into the database
      let sqlquery = `INSERT INTO users (username, first_name, last_name, email, hashedPassword) VALUES (?, ?, ?, ?, ?)`;
      let newrecord = [username, first_name, last_name, email, hashedPassword];

      // Store the new record in the database
      db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
          return next(err); // Handle SQL error
        }

        // Send confirmation to the user
        let responseMessage = `Hello ${first_name} ${last_name}, you are now registered! We will send an email to you at ${email}. `;
        responseMessage += `Your hashed password is: ${hashedPassword}`;

        res.send(responseMessage);
      });
    });
  }
);

// Other routes (list, login, etc.) remain unchanged
router.get("/list", redirectLogin, function (req, res, next) {
  let sqlquery = `SELECT username, first_name, last_name, email FROM users`;
  db.query(sqlquery, (err, result) => {
    if (err) {
      return next(err); // Handle SQL error
    }
    res.render("users.ejs", { users: result });
  });
});

router.get("/login", function (req, res, next) {
  res.render("login.ejs"); // Render the login form
});

router.post("/loggedin", function (req, res, next) {
  const username = req.sanitize(req.body.username);
  const password = req.sanitize(req.body.password);
  req.session.userId = username;

  let sqlquery = `SELECT * FROM users WHERE username = ?`;

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
        return next(err); // Handle error
      }

      if (match) {
        res.send(`Welcome back, ${user.first_name} ${user.last_name}!`);
      } else {
        res.send("Login failed: Incorrect password.");
      }
    });
  });
});

module.exports = router;
