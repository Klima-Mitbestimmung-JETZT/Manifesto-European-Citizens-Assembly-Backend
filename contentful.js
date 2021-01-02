require("dotenv").config();

const contentful = require("contentful-management");
const { parse } = require("json2csv");

// Configure the fields, which should be parsed from json into csv
const fields = [
  "email",
  "phone",
  "firstname",
  "lastname",
  "website",
  "organisation",
];
const opts = { fields };

const client = contentful.createClient({
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
});

client.getSpace(process.env.CONTENTFUL_SPACE).then((space) => {
  this.space = space;
  this.space
    .getEnvironment(process.env.CONTENTFUL_ENVIRONMENT)
    .then((environment) => (this.environment = environment));
});

module.exports.createOrganisation = (organisation, logo) => {
  return new Promise((resolve, reject) => {
    if (!this.environment) {
      reject("No environment");
    }

    let organisationFields = {
      contactPerson: {},
      website: {},
      listOfSigningNames: {},
      email: {},
      phone: {},
      name: {},
      logo: {},
    };

    organisationFields.contactPerson[process.env.CONTENTFUL_LOCALE] = organisation.name;
    organisationFields.listOfSigningNames[process.env.CONTENTFUL_LOCALE] =
    organisation.listOfSigningNames;
    organisationFields.website[process.env.CONTENTFUL_LOCALE] = organisation.website;
    organisationFields.email[process.env.CONTENTFUL_LOCALE] = organisation.email;
    organisationFields.phone[process.env.CONTENTFUL_LOCALE] = organisation.phone;
    organisationFields.name[process.env.CONTENTFUL_LOCALE] = organisation.organisation;

    let logoFields;

    if (logo) {
      let file = {};
      file[process.env.CONTENTFUL_LOCALE] = {
        contentType: "image/" + logo.filename.split(".").pop(),
        fileName: logo.filename,
        file: logo.content,
      };

      logoFields = {
        title: {},
        file: file,
      };
    }

    if (logoFields) {
      this.environment
        .createAssetFromFiles({ fields: logoFields })
        .then((asset) => asset.processForAllLocales())
        .then((asset) => asset.publish())
        .then((asset) => {
          organisationFields.logo[process.env.CONTENTFUL_LOCALE] = {
            sys: { type: "Link", linkType: "Asset", id: asset.sys.id },
          };
          this.environment
            .createEntry("organisation", {
              fields: organisationFields,
            })
            .then((response) => resolve(response));
        })
        .catch((err) => reject(err));
    } else {
      this.environment
        .createEntry("organisation", {
          fields: organisationFields,
        })
        .then((response) => resolve(response));
    }
  });
};

module.exports.getSignees = () => {
  return new Promise((resolve, reject) => {
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
            content_type: "organisation",
            "sys.id[in]": signeeIdsQueryString,
            order: "fields.name",
          })
          .then((entries) => {
            entries.items.forEach((entry) => {
              let signee = {};
              for (key in entry.fields) {
                switch (key) {
                  case "contactPerson":
                    let ansprechpartnerin =
                      entry.fields[key][process.env.CONTENTFUL_LOCALE];

                    signee["firstname"] = ansprechpartnerin.substr(
                      0,
                      ansprechpartnerin.indexOf(" ")
                    );
                    signee["lastname"] = ansprechpartnerin.substr(
                      ansprechpartnerin.indexOf(" ") + 1
                    );
                    break;
                  case "name":
                    signee["organisation"] =
                      entry.fields[key][process.env.CONTENTFUL_LOCALE];
                    break;
                  default:
                    signee[key] =
                      entry.fields[key][process.env.CONTENTFUL_LOCALE];
                }
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
