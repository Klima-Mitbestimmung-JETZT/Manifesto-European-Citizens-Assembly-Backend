require("dotenv").config();

const contentful = require("contentful-management");
const { parse } = require("json2csv");

// Configure the fields, which should be parsed from json into csv
const fields = ["eMail", "ansprechpartnerin", "telefon", "name", "website"];
const opts = { fields };

const client = contentful.createClient({
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
});

var space;
var environment;

client.getSpace(process.env.CONTENTFUL_SPACE).then((space) => {
  this.space = space;
  this.space
    .getEnvironment(process.env.CONTENTFUL_ENVIRONMENT)
    .then((environment) => (this.environment = environment));
});

module.exports.getSignees = () => {
  return new Promise((resolve, reject) => {
    // This API call will request an entry with the specified ID from the space defined at the top, using a space-specific access token.
    if (!this.environment) {
      reject("No environment");
    }

    this.environment
      .getEntry("2aDDbb4AjEQdCo0IW7AnLm", { include: 2 })
      .then((entry) => {
        let signeeIdsQueryString = "";
        let signees = [];
        entry.fields.signees[process.env.CONTENTFUL_LOCALE].forEach(
          (element) => {
            signeeIdsQueryString = signeeIdsQueryString + "," + element.sys.id;
          }
        );

        this.environment
          .getEntries({
            content_type: "unterzeichnender",
            "sys.id[in]": signeeIdsQueryString,
            order: "fields.name",
          })
          .then((entries) => {
            entries.items.forEach((entry) => {
              let signee = {};
              for (key in entry.fields) {
                signee[key] = entry.fields[key][process.env.CONTENTFUL_LOCALE];
              }
              signees.push(signee);
            });
            const csv = parse(signees, opts);
            resolve(csv);
          });
      })
      .catch((err) => reject(err));
  });
};
