const contentful = require("contentful");
const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: process.env.CONTENTFUL_SPACE,
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: process.env.CONTENTFUL_ACCESS_KEY,
});
// This API call will request an entry with the specified ID from the space defined at the top, using a space-specific access token.
client
  .getEntry("2aDDbb4AjEQdCo0IW7AnLm", { include: 1 })
  .then((entry) => {
    entry.fields.signees
      .sort(function (a, b) {
        let textA = a.fields.name.toLowerCase();
        let textB = b.fields.name.toLowerCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      })
      .forEach((element) => {
        console.log(element.fields.name);
      });
  })
  .catch((err) => console.log(err));
