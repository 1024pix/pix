# Configurer local network domains

It is possible to access Pix applications with `*.dev.pix.<tld>` domains instead of `localhost:port`:

- Mon Pix
  - http://app.dev.pix.fr/
  - http://app.dev.pix.org/
- Orga
  - http://orga.dev.pix.fr/
  - http://orga.dev.pix.org/
- Admin
  - http://admin.dev.pix.fr/
- Certif
  - http://certif.dev.pix.fr/

To configure local domains, copy host name declarations of the [hosts.txt](./hosts.txt) file in your system’s hosts file (eg. `/etc/hosts`).

Start the Docker container:

```bash
npm run domains:start
```

Stop the container:

```bash
npm run domains:stop
```
