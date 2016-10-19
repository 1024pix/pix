## Installation

> Prerequesites: you must have Node 6.2.1+ installed.

```
$ git clone git@github.com:sgmap/pix-live.git pix
$ cd pix
$ make install
$ make test
$ (cd api && npm run db:migrate && npm run db:seed)
$ make serve-api                # in a new terminal or tab
$ make serve-live               # in a new terminal or tab
$ curl http://localhost:3000    # check PIX-API
$ open http://localhost:4200    # check PIX-Live
```

