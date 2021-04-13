const HapiSwagger = require('hapi-swagger');
const applicationPackage = require('../package.json');

const swaggerOptionsAuthorizationServer = {
  routeTag: 'authorization-server',
  info: {
    'title': 'Welcome to the Pix Authorization server',
    'version': applicationPackage.version,
  },
  jsonPath: '/swagger.json',
};

const swaggerOptionsLivretScolaire = {
  routeTag: 'livret-scolaire',
  info: {
    'title': 'Welcome to the Pix LSU/LSL open api',
    'version': applicationPackage.version,
  },
  jsonPath: '/swagger.json',
};

const swaggerOptionsIn = {
  basePath: '/api',
  grouping: 'tags',
  routeTag: 'api',
  info: {
    'title': 'Welcome to the Pix api catalog',
    'version': applicationPackage.version,
  },
  documentationPath: '/documentation',
  jsonPath: '/swagger.json',
};

function _buildSwaggerArgs(swaggerOptions)
{
  return [{
    plugin: HapiSwagger,
    options: swaggerOptions,
  }, {
    routes: { prefix: '/' + swaggerOptions.routeTag },
  }];
};

const swaggers = [ swaggerOptionsAuthorizationServer, swaggerOptionsLivretScolaire, swaggerOptionsIn ].map(_buildSwaggerArgs);

module.exports = swaggers;
