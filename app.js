const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongooose = require("mongoose");
const session = require("express-session");
var ObjectId = require("mongoose").Types.ObjectId;

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
  secret: "startupwebsite",
  resave: false,
  saveUninitialized: false
}));

mongooose.connect("mongodb://localhost:27017/startupsDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const User = require("./models/user");
const InvestorUser = require("./models/investorUser");
const Project = require("./models/project");

app.get("/", (req, res) => {
  res.render("index", { foundUser: req.session.username });
});

app.get("/login", (req, res) => {
  res.render("Signin", { foundUser: req.session.username });
});

app.get("/signup", (req, res) => {
  res.render("signup", { foundUser: req.session.username });
});

app.get("/contact", (req, res) => {
  res.render("contact", { foundUser: req.session.username });
});

app.get("/about", (req, res) => {
  res.render("about", { foundUser: req.session.username });
});

app.get("/invest", (req, res) => {
  res.render("Investor_SignUp", { foundUser: req.session.username });
});

app.get("/investorSignin", (req, res) => {
  res.render("Investor_SignIn", { foundUser: req.session.username });
});

app.get("/allProjects", (req, res) => {
  Project.find({})
    .populate("userId")
    .then((foundProjects) => {
      res.render("allPosts", { foundUser: req.session.username, projects: foundProjects });
    }).catch((err) => {
      console.log(err);
    });
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
    }
  });
});

app.post("/register", (req, res) => {
  var data = {
    fullName: req.body.fullName,
    phoneNo: req.body.phoneNo,
    username: req.body.emailId,
    typeOfUser: req.body.type,
    organisationName: req.body.organisationName,
    password: req.body.password
  };
  User.create(data, (error, insertedData) => {
    if (error) {
      console.log(error);
    } else {
      res.redirect("/login");
    }
  });
});

app.post("/signin", (req, res) => {
  User.findOne({ username: req.body.emailId }, (err, foundEmail) => {
    if (err) {
      console.log(err);
    } else {
      if (foundEmail) {
        User.findOne({ password: req.body.password }, (error, foundUser) => {
          if (error) {
            console.log(error);
          } else {
            if (foundUser) {
              req.session.username = foundUser.username;
              req.session.userId = foundUser._id;
              res.redirect("/");
            } else {
              res.redirect("/login");
            }
          }
        });
      } else {
        res.redirect("/login");
      }
    }
  })
});

app.post("/investorSignup", (req, res) => {
  var data = {
    fullName: req.body.firstName + " " + req.body.middleName + " " + req.body.lastName,
    organisationName: req.body.organisationName,
    phoneNo: req.body.phoneNo,
    username: req.body.emailId,
    password: req.body.password
  };
  InvestorUser.create(data, (error, createdUser) => {
    if (error) {
      console.log(error);
    } else {
      res.redirect("/investorSignin");
    }
  })
});

app.post("/investorSignin", (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  InvestorUser.findOne({ username, password }, (error, foundInvestorUser) => {
    if (error) {
      console.log(error);
    } else {
      if (foundInvestorUser) {
        res.redirect("/allProjects");
      } else {
        res.send({ signin: false });
      }
    }
  });
});

app.post("/postProject", (req, res) => {
  var userId = new ObjectId(req.session.userId);
  var data = {
    projectName: req.body.projectName,
    projectDescription: req.body.projectDescription,
    userId: userId
  };
  Project.create(data, (error, insertedProject) => {
    if (error) {
      console.log(error);
    } else {
      res.redirect("/");
    }
  });
});

app.listen(3000, function () {
  console.log("Server is running on port 3000");
});