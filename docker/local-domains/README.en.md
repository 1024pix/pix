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

## Using with a firewall

If your system is protected by a firewall, this can prevent the Caddy Docker container
from accessing the various NodeJS servers running on the host.

The access to the host from the `pix_local` Docker network must then be allowed.

Here is a configuration example for [ufw](https://launchpad.net/ufw) Linux’s firewall :

```bash
ufw allow in on br-$(docker network ls --quiet --filter name=pix_local) to 0.0.0.0/0 port 3000,4200:4205 proto tcp
```

It allows access from the `pix_local` bridge network interface to all V4 IPs on ports 3000 and 4200 through 4205 for TCP protocols.

> [!NOTE]  
> This command must be executed as administrator (`sudo`).

## Using local network domains from a Docker container

Local network domains are available on Docker network named `pix_local`.

In order to use these domains from a container defined in another Docker compose configuration, the following configuration may be used :

```yaml
services:
  service1:
    image: ...
    # service1 is connected to default network and pix_local network,
    # it will be able to access local network domains.
    networks:
      - default
      - pix_local

  # Without configuration, service2 is connected only to default network,
  # it won’t be able to access local network domains.
  service2:
    image: ...

networks:
  # Define a default network for communication
  # between containers declared in this configuration.
  default:
  # Define pix_local as an external network.
  pix_local:
    name: pix_local
    external: true
```
