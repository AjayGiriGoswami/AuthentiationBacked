const express = require("express");
const router = new express.Router();
const userdb = require("../Model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const authenticate = require("../Middlewear/authenticate");
const KEY = "AjayGiriGoswami2580";
const nodemailer = require("nodemailer");

// for user register

router.post("/register", async (req, res) => {
  // get the data from client
  const { fname, email, password, cpassword } = req.body;

  if (!fname || !email || !password || !cpassword) {
    res.status(422).json({ error: "fill all the detilas" });
  }

  try {
    const preuser = await userdb.findOne({ email: email });
    if (preuser) {
      res.status(422).json({ status: 422 });
    } else if (password !== cpassword) {
      res
        .status(404)
        .json({ error: "Password and Confirm Password Not Match" });
    } else {
      const finalUser = new userdb({
        fname,
        email,
        password,
        cpassword,
      });

      const storeData = await finalUser.save();
      //   console.log(storeData);
      res.status(201).json({ status: 201, storeData });
    }
  } catch (error) {
    res.status(450).json({ status: 450, error });
  }
});

// Login  User

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(422).json({ error: "fill all the detilas" });
  }

  try {
    const userValid = await userdb.findOne({ email: email });
    if (!userValid) {
      res.status(404).json({ status: 404 });
    } else {
      const isMatch = await bcrypt.compare(password, userValid.password);
      if (!isMatch) {
        res.status(420).json({ status: 420 });
      } else {
        // token generate
        const token = await userValid.generateAuthtoken();

        // cookiegenerate
        res.cookie("usercookie", token, {
          expires: new Date(Date.now() + 9000000),
          httpOnly: true,
        });

        const result = {
          userValid,
          token,
        };
        res.status(201).json({ status: 201, result });
      }
    }
  } catch (error) {
    res.status(401).json(error);
    console.log("catch block");
  }
});

// user valid
router.get("/validuser", authenticate, async (req, res) => {
  try {
    const validuserone = await userdb.findOne({ _id: req.userid });
    res.status(201).json({ status: 201, validuserone });
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
});

// Logout api
router.get("/logout", authenticate, async (req, res) => {
  try {
    req.rootUser.tokens = req.rootUser.tokens.filter((curelem) => {
      return curelem.token !== req.token;
    });

    res.clearCookie("usercookie", { path: "/" });

    req.rootUser.save();

    res.status(201).json({ status: 201 });
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
});

// Forgot Password Link

router.post("/Forgot", async (req, res) => {
  const { email } = req.body;
  // console.log(req.body);
  try {
    const userValid = await userdb.findOne({ email: email });
    if (!userValid) {
      res.status(420).json({ status: 420 });
    }
    const token = jwt.sign({ id: userValid.id }, KEY, { expiresIn: "5m" });
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ajay124767@gmail.com",
        pass: "ezmf comm qsqx xqsc",
      },
    });

    var mailOptions = {
      from: "ajay124767@gmail.com",
      to: email,
      subject: "Reset Your Passowrd",
      text: `"Link is Expires in 5 minute " http://localhost:3000/restpassword/${userValid._id}/${token}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Error sending email" });
      } else {
        return res.status(201).json({ status: 201 });
      }
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/Rest-Password/:id/:token", async (req, res) => {
  try {
    const { id, token } = req.params;
    const { password } = req.body;

    if (!id || !token) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const decode = await jwt.verify(token, process.env.KEY);

    if (!decode || !decode.id) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const userId = decode.id;

    const user = await userData.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashpassword = await bcrypt.hash(password, 10);

    await userData.findByIdAndUpdate(userId, { password: hashpassword });

    res.status(201).json({ status: 201 });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token has expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    } else {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

module.exports = router;
