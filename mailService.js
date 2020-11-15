require("dotenv").config();

const nodemailer = require("nodemailer");

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

module.exports.sendMail = (from, subject, message, attachment) => {
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
      transporter
        .sendMail(transportObject)
        .then((res) => resolve(res))
        .catch((err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
};
