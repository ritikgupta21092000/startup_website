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

mongooose.connection.on("connected", () => {
  console.log("Successfully Connected to Database");
});

mongooose.connection.on("error", (error) => {
  console.log("Error in Connecting to database: ", error);
});

const User = require("./models/user");
const InvestorUser = require("./models/investorUser");
const Project = require("./models/project");

app.get("/", (req, res) => {
  res.render("index", { foundUser: req.session.username, investorName: req.session.investorName });
});

app.get("/login", (req, res) => {
  res.render("Signin", { foundUser: req.session.username, investorName: req.session.investorName });
});

app.get("/signup", (req, res) => {
  res.render("signup", { foundUser: req.session.username, investorName: req.session.investorName });
});

app.get("/contact", (req, res) => {
  res.render("contact", { foundUser: req.session.username, investorName: req.session.investorName });
});

app.get("/about", (req, res) => {
  res.render("about", { foundUser: req.session.username, investorName: req.session.investorName });
});

app.get("/invest", (req, res) => {
  if (req.session.investorId) {
    res.redirect("/allProjects");
  } else {
    res.render("Investor_SignUp", { foundUser: req.session.username, investorName: req.session.investorName });
  }
});

app.get("/investorSignin", (req, res) => {
  res.render("Investor_SignIn", { foundUser: req.session.username, investorName: req.session.investorName });
});

app.get("/allProjects", (req, res) => {
  if (req.session.investorId) {
    Project.find({})
      .populate("userId")
      .then((foundProjects) => {
        res.render("invest-in-project", { foundUser: req.session.username, projects: foundProjects, investorId: req.session.investorId, investorName: req.session.investorName });
      }).catch((err) => {
        console.log(err);
      });
  } else {
    res.redirect("/investorSignin");
  }
});

app.get("/investorData", (req, res) => {
  InvestorUser.findOne({ _id: req.session.investorId }, (err, foundInvestor) => {
    if (err) {
      console.log(err);
    } else {
      res.send({ foundInvestor });
    }
  });
});

app.get("/investorDashboard", (req, res) => {
  res.render("investor-dashboard", { foundUser: req.session.username, investorName: req.session.investorName });
});

app.get("/userDashboard", (req, res) => {
  res.send("Inside User Dashboard Route");
});

app.get("/investorAppliedProject", (req, res) => {
  Project.find({ "investAmount.investorId": req.session.investorId, isUserApproved: false })
    .populate("investAmount.investorId")
    .populate("userId")
    .then(foundDocument => {
      res.render("investorAppliedProject", { foundDocument, foundUser: req.session.username, investorName: req.session.investorName });
    })
    .catch(error => {
      console.log(error);
    });
});

app.get("/investorApprovedProject", (req, res) => {
  Project.find({ "investAmount.investorId": req.session.investorId, isUserApproved: true })
    .populate("investAmount.investorId")
    .populate("userId")
    .then(foundDocument => {
      res.render("investorAppliedProject", { foundDocument, foundUser: req.session.username, investorName: req.session.investorName });
    })
    .catch(error => {
      console.log(error);
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
        req.session.investorId = foundInvestorUser._id;
        req.session.investorName = foundInvestorUser.fullName;
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
    projectUrl: req.body.projectUrl,
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

app.post("/placeBid", (req, res) => {
  const data = {
    amount: req.body.amount,
    proposal: req.body.proposal,
    investorId: req.session.investorId
  };
  const projectId = new ObjectId(req.body.projectId);
  Project.findOneAndUpdate({ _id: projectId }, { $push: { investAmount: data } }, (err, foundProject) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/allProjects");
    }
  });
});

app.listen(3000, function () {
  console.log("Server is running on port 3000");
});