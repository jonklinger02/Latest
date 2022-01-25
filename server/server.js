const express = require("express");
const bodyParser = require("body-parser");
const moongoose = require("mongoose");
const app = express();
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");

const password = "DevPass123";
const mongoUri = `mongodb+srv://admin:${password}@devtools.cvoex.mongodb.net/userDB?retryWrites=true&w=majority`;

moongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

///////////Middlewares///////////
app.use(bodyParser.json());
app.use(cookieParser());
const { authenticate } = require("./middleware/auth");
// let authenticate = (req, res, next) => {
//   let token = req.cookies.auth;
//   User.findByToken(token, (err, user) => {
//     if (err) throw err;
//     if (!user) res.status(401).send({ message: "bad token" });
//     //res.status(200).send(user);
//     req.email = user.email;
//     req.token = token;
//     next();
//   });
// };

///////////Models///////////
const { User } = require("./models/user");

///////////ROUTES///////////
app.post("/api/user", authenticate, (req, res) => {
  const user = new User({
    email: req.body.email,
    password: req.body.password,
  });

  user.save((err, doc) => {
    if (err) res.status(400).send(err);
    res.status(200).send(doc);
  });
});

app.post("/api/user/login", (req, res) => {
  //1 - find user, if good then next
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) res.json({ message: "user not found" });

    //2 - validate password (compare string with hash)
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (err) throw err;
      if (!isMatch)
        return res.status(400).json({
          message: "Bad Password",
        });

      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);
        res.cookie("auth", user.token).send("ok");
      });
      //res.status(200).send(isMatch);
    });
  });
});

app.get("/api/books", (req, res) => {
  // let token = req.cookies.auth;
  // User.findByToken(token, (err, user) => {
  //   if (err) throw err;
  //   if (!user) res.status(401).send({ message: "bad token" });
  //   res.status(200).send(user);
  // });
  //res.status(200).send("working");
});

///////////Ports///////////
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`started on port ${port}`);
});
