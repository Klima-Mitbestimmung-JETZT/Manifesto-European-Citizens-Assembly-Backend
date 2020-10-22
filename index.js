"use strict";
require("dotenv").config();
const nodemailer = require("nodemailer");
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const app = express();
const log = console.log;
const PORT = process.env.PORT || 3000;

var upload = multer();
var bodyParser = require("body-parser");
// Configuring our data parsing
app.use(
  bodyParser.urlencoded({
    extend: true,
  })
);
app.use(express.json());

app.post("/signee", upload.single("logo"), (req, res) => {
  // res.sendFile(path.join(__dirname + '/contact-us.html'));
  //TODO
  //send email here
  if (!req.body) return res.send("No body");
  if (!req.body.organisation) return res.send("no organisation");
  if (!req.body.website) return res.send("no website");
  if (!req.body.signeeNames) return res.send("no signeeNames");
  if (!req.body.email) return res.send("no email");
  if (!req.body.phone) req.body.phone = "<i>Keine Telefonnummer eingegebn</i>";

  let message = `Folgender Eintrag ist auf der Webiste des offenen Briefs (https://www.klima-rat.org) eingegangen: <br><br>
  Meine Organisation: ${req.body.organisation}<br>
  Website: ${req.body.website}<br>
  Die Namen der Unterzeichnenden: ${req.body.signeeNames}<br><br>

  Ich bin damit einverstanden, dass das Logo unserer Organisation (entweder dieser Mail beigefügt oder von der Website unserer Organisation) auf der Website des Briefs angezeigt wird.<br><br>
  Bitte kontaktieren Sie mich ggf. unter diesen Daten für eine Verifizierung:<br>
  E-Mail: ${req.body.email}<br>
  Telefon: ${req.body.phone}<br>`;

  let attachment;

  if (req.file && req.file.fieldname === "logo") {
    attachment = {
      filename: req.file.originalname,
      content: Buffer.alloc(req.file.size, req.file.buffer),
    };
  } else {
    log("no logo");
  }

  sendMail(req.body.email, message, attachment)
    .then((response) => {
      res.send({ message: "Message sent succesfully" });
    })
    .catch((err) => {
      log(err);
      res.status(500).json({ message: "Internal Error" }).send();
    });
});

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_SECURE === "true" ? true : false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER, // generated ethereal user
    pass: process.env.MAIL_PASSWORD, // generated ethereal password
  },
});

// async..await is not allowed in global scope, must use a wrapper
var sendMail = (from, message, attachment) => {
  return new Promise(async (resolve, reject) => {
    try {
      let transportObject = {
        from: from, // sender address
        to: process.env.MAIL_TO, // list of receivers
        subject: process.env.MAIL_SUBJECT, // Subject line
        text: message, // plain text body
        html: message, // html body
      };
      if (attachment) {
        transportObject.attachments = [attachment];
      }
      // send mail with defined transport object
      let info = await transporter.sendMail(transportObject);

      resolve("Message sent: " + info.messageId);
    } catch (error) {
      reject(error);
    }
  });
};

app.listen(PORT, () => log("Server is starting on PORT,", PORT));
