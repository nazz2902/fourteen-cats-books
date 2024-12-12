// Create a new router instance
const express = require("express");
const router = express.Router();
const request = require("request");

// Middleware to redirect to login page if the user is not logged in
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect("/users/login"); // Redirect to the login page if not logged in
  } else {
    next(); // Proceed to the next middleware or route
  }
};

// Handle the root route (Home Page)
router.get("/", function (req, res, next) {
  res.render("index.ejs"); // Render the home page template
});

// Handle the About Page route
router.get("/about", function (req, res, next) {
  res.render("about.ejs"); // Render the about page template
});

// Handle the Quote of the Day route
router.get("/quote", function (req, res, next) {
  // Define options for the API request to fetch a random quote
  const options = {
    method: "GET",
    url: "https://quotes15.p.rapidapi.com/quotes/random/",
    qs: {
      language_code: "en", // Request quotes in English
    },
    headers: {
      "x-rapidapi-key": "28a709bf48msh7eb8157f7a2e772p12af93jsn9bc4800388d8", // API key for authentication
      "x-rapidapi-host": "quotes15.p.rapidapi.com", // Host of the API
    },
  };

  // Make the API request
  request(options, function (err, response, body) {
    if (err) {
      next(err); // Pass the error to the error handler
    } else {
      // Parse the API response
      var quote = JSON.parse(body);
      // Check if the quote is valid and contains content
      if (quote !== undefined && quote.content !== undefined) {
        var qmsg = "Quote of the day is: " + quote.content; // Format the quote message
        res.send(qmsg); // Send the quote as a response
      } else {
        res.send("No data found"); // Handle case where no data is returned
      }
    }
  });
});

// Handle the Logout route
router.get("/logout", redirectLogin, (req, res) => {
  // Destroy the user session
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("./"); // Redirect to the home page if an error occurs
    }
    // Send a logout confirmation message with a link to the home page
    res.send("You are now logged out. <a href=" + "./" + ">Home</a>");
  });
});

// Export the router object so it can be used in the main application
module.exports = router;
