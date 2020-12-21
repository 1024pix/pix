const HapiSwagger = require('hapi-swagger');
const Pack = require('../package');

const swaggerOptionsLivretScolaire = {
  routeTag: 'livret-scolaire',
  info: {
    'title': 'Welcome to the Pix open api catalog',
    'version': Pack.version,
  },
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
  jsonPath: '/swagger.json'
};


const swaggers = [ swaggerOptionsLivretScolaire, swaggerOptionsIn, ].map(_buildSwaggerArgs);
module.exports = swaggers;

function _buildSwaggerArgs(swaggerOptions)
{
  return [{
    plugin: HapiSwagger,
    options: swaggerOptions,
  }, {
    routes: {prefix: '/' + swaggerOptions.routeTag},
  }]
}
