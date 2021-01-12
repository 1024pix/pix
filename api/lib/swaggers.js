const HapiSwagger = require('hapi-swagger');
const Pack = require('../package');

const swaggerOptionsAuthorizationServer = {
  routeTag: 'authorization-server',
  info: {
    'title': 'Welcome to the Pix Authorization server',
    'version': Pack.version,
  },
  jsonPath: '/swagger.json',
};

const swaggerOptionsLivretScolaire = {
  routeTag: 'livret-scolaire',
  info: {
    'title': 'Welcome to the Pix LSU/LSL open api',
    'version': Pack.version,
  },
  jsonPath: '/swagger.json',
};

const swaggerOptionsIn = {
  basePath: '/api',
  grouping: 'tags',
  routeTag: 'api',
  info: {
    'title': 'Welcome to the Pix api catalog',
    'version': Pack.version,
  },
  documentationPath: '/documentation',
  jsonPath: '/swagger.json',
};

const swaggers = [ swaggerOptionsAuthorizationServer, swaggerOptionsLivretScolaire, swaggerOptionsIn ].map(_buildSwaggerArgs);
module.exports = swaggers;

function _buildSwaggerArgs(swaggerOptions)
{
  return [{
    plugin: HapiSwagger,
    options: swaggerOptions,
  }, {
    routes: { prefix: '/' + swaggerOptions.routeTag },
  }];
}
