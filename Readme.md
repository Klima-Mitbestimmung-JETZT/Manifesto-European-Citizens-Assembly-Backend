# Backend für offenen Brief Klima-Bürgerrat

## Branching

1. `Main`- Zweig vom Branch `Master` für die Veröffentlichtung des Codes auf GitHub.
1. `Master`- Produktive Version des Backends mit Upstream auf Hosting Platform.

## Benötigte .env

- `MAIL_HOST` - URL of the SMTP server
- `MAIL_PORT` - Number for port of the SMTP server
- `MAIL_SECURE` - Boolean flag for the SMTP server
- `MAIL_USER` - User for the SMTP server
- `MAIL_PASSWORD` - Password for the SMTP server
- `MAIL_TO` - Mailadress to which the requests are forwarded
- `MAIL_SUBJECT` - String for the Mail Subject of signee requests
- `MAIL_CONTACT_SUBJECT` - String for the Mail Subject of contact requests
- `CONTENTFUL_SPACE` - Contentful SPACE ID
- `CONTENTFUL_ACCESS_KEY` - Contentful API Key
- `WHITELIST_URLS`- Comma seperated URLs
