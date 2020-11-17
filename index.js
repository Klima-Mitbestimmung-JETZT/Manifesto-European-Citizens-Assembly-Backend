"use strict";
require("dotenv").config();
const nodemailer = require("nodemailer");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const app = express();
const log = console.log;
const PORT = process.env.PORT || 3000;
var morgan = require("morgan");

// Load custom contentfulService
const contentfulService = require("./contentful");

var upload = multer();
var bodyParser = require("body-parser");

// Configuring our data parsing
app.use(
  bodyParser.urlencoded({
    extend: true,
  })
);
app.use(express.json());
app.use(morgan("combined"));

let whitelist = process.env.WHITELIST_URLS.split(",");

log(`Whitlelist: ${JSON.stringify(whitelist)}`);
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin
      if (!origin) return callback(null, true);
      if (whitelist.indexOf(origin) === -1) {
        var message =
          "The CORS policy for this origin doesnt " +
          "allow access from the particular origin.";
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

app.post("/contact", (req, res) => {
  if (!req.body) return res.status(400).send("No body");
  if (!req.body.email) return res.status(400).send("No email");
  if (!req.body.name) return res.status(400).send("No name");
  if (!req.body.message) return res.status(400).send("No message");

  res.status(200).send({ message: "Message received succesfully" });

  let message = `Folgende Kontaktanfrage ist auf der Webiste des offenen Briefs (https://www.klima-rat.org) eingegangen: <br><br>
  
  Name: ${req.body.name}<br>
  E-Mail: ${req.body.email}<br>
  Telefon: ${
    req.body.phone ? req.body.phone : "<i>Keine Telefonnummer eingegeben</i>"
  }<br><br>
  
  Mit der Nachricht:<br>
  ${req.body.message}`;

  sendMail(req.body.email, process.env.MAIL_CONTACT_SUBJECT, message).catch(
    (err) => {
      log(err);
      log(
        new Error(
          `Could not send Contact request by ${
            req.body.email
          }, with data: ${JSON.stringify(req.body)})`
        )
      );
    }
  );
});

app.post("/signee", upload.single("logo"), (req, res) => {
  // res.sendFile(path.join(__dirname + '/contact-us.html'));
  //TODO
  //send email here
  if (!req.body) return res.status(400).send("No body");
  if (!req.body.organisation) return res.status(400).send("no organisation");
  if (!req.body.website) return res.status(400).send("no website");
  if (!req.body.listOfSigningNames)
    return res.status(400).send("no listOfSigningNames");
  if (!req.body.name) return res.status(400).send("no name");
  if (!req.body.email) return res.status(400).send("no email");

  res.status(200).send({ message: "Message received succesfully" });

  let message = `Folgender Eintrag ist auf der Webiste des offenen Briefs (https://www.klima-rat.org) eingegangen: <br><br>
  Meine Organisation: ${req.body.organisation}<br>
  Website: ${req.body.website}<br>
  Die Namen der Unterzeichnenden: ${req.body.listOfSigningNames}<br><br>

  Ich bin damit einverstanden, dass das Logo unserer Organisation (entweder dieser Mail beigefügt oder von der Website unserer Organisation) auf der Website des Briefs angezeigt wird.<br><br>
  Bitte kontaktieren Sie mich ggf. unter diesen Daten für eine Verifizierung:<br><br>
  Name: ${req.body.name}<br>
  E-Mail: ${req.body.email}<br>
  Telefon: ${
    req.body.phone ? req.body.phone : "<i>Keine Telefonnummer eingegeben</i>"
  }<br><br>
  
  Mit der Nachricht:<br>
  ${req.body.message ? req.body.message : "<i>Keine Nachricht eingegeben</i>"}
  `;

  let logo;

  if (req.file) {
    logo = {
      filename: req.file.originalname,
      content: Buffer.alloc(req.file.size, req.file.buffer),
    };
  } else {
    log("No logo");
  }

  contentfulService
    .createSignee(req.body, logo)
    .then((signee) => {
      log(`Signee created: ${JSON.stringify(signee)}`);
    })
    .catch((err) => {
      log(
        `Internal Error - Could not create Signee in Contentful for request made by ${
          req.body.email
        }, with data: ${JSON.stringify(req.body)}`
      );
      log(err);
    });

  sendMail(req.body.email, process.env.MAIL_SUBJECT, message, logo).catch(
    (err) => {
      log(err);
      log(
        `Internal Error - Could not send Signee request made by ${
          req.body.email
        }, with data: ${JSON.stringify(req.body)}`
      );
    }
  );
});

/*app.get("/signees", async (err, res) => {
  contentfulService
    .getSignees()
    .then((file) => {
      res
        .header("Content-Type", "text/csv, charset=utf-8")
        .attachment("Aktuelle-Unterzeichner-des-Offenen-Briefs.csv")
        .send(file);
    })
    .catch((err) => res.status(500).send(err));
});*/

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
var sendMail = (from, subject, message, attachment) => {
  return new Promise(async (resolve, reject) => {
    try {
      let transportObject = {
        from: from, // sender address
        to: process.env.MAIL_TO, // list of receivers
        subject: subject, // Subject line
        text: message, // plain text body
        html: message, // html body
      };
      if (attachment) {
        transportObject.attachments = [attachment];
      }
      // send mail with defined transport object
      let info = await transporter.sendMail(transportObject);

      log(`Message sent: ${JSON.stringify(info)}`);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

app.listen(PORT, () => log("Server is starting on PORT,", PORT));
