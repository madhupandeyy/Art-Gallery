var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

const app = express();

app.use(bodyParser.json());
app.use(express.static("public"));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

mongoose.connect("mongodb://localhost:27017/ArtGallery");
var db = mongoose.connection;
db.on("error", () =>
  console.log("There is an error in connecting to the database")
);
db.once("open", () => console.log("Connected to Database"));

app.post("/register", (req, res) => {
  var name = req.body.name;
  var dob = req.body.dob;
  var email = req.body.email;
  var password = req.body.psw;

  db.collection("login").findOne({ email: email }, (err, result) => {
    if (err) {
      throw err;
    }
    if (result) {
        return res.send("<script>alert('User already exists'); window.location.href='/register.html';</script>");
    } else {
      var data = {
        name: name,
        dob: dob,
        email: email,
        password: password,
      };
      db.collection("login").insertOne(data, (err, collection) => {
        if (err) {
          throw err;
        }
        console.log("Data Inserted Successfully");
        return res.redirect("fs.html");
      });
    }
  });
});

app.get("/", (req, res) => {
  res.set({
    "Allow-acces-Allow-Origin": "*",
  });
  return res.redirect("register.html");
});

const server = app.listen(3011, () => {
  console.log("Listening on port 3011");
  console.log(`Server is running at http://localhost:3011`);
});

