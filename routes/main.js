// Create a new router
const express = require("express");
const router = express.Router();
const request = require("request");
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect("./login"); // redirect to the login page
  } else {
    next(); // move to the next middleware function
  }
};

// Handle our routes
router.get("/", function (req, res, next) {
  res.render("index.ejs");
});

router.get("/about", function (req, res, next) {
  res.render("about.ejs");
});

router.get("/quote", function (req, res, next) {
  const options = {
    method: "GET",
    url: "https://quotes15.p.rapidapi.com/quotes/random/",
    qs: {
      language_code: "en",
    },
    headers: {
      "x-rapidapi-key": "28a709bf48msh7eb8157f7a2e772p12af93jsn9bc4800388d8",
      "x-rapidapi-host": "quotes15.p.rapidapi.com",
    },
  };

  request(options, function (err, response, body) {
    if (err) {
      next(err);
    } else {
      var quote = JSON.parse(body);
      if (quote !== undefined && quote.content !== undefined) {
        var qmsg = "Quote of the day is: " + quote.content;
        res.send(qmsg);
      } else {
        res.send("No data found");
      }
    }
  });
});

router.get("/logout", redirectLogin, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("./");
    }
    res.send("you are now logged out. <a href=" + "./" + ">Home</a>");
  });
});

// Export the router object so index.js can access it
module.exports = router;
