const path = require('path');

module.exports = {

  rootPath: path.normalize(__dirname + '/..'),

  port: (process.env.NODE_ENV !== 'test') ? parseInt(process.env.PORT, 10) || 3000 : null,

  environment: process.env.NODE_ENV || 'development',

  hapi: {
    options: {}
  }

};
