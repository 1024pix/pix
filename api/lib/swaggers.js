import HapiSwagger from 'hapi-swagger';
import applicationPackage from '../package.json';

const swaggerOptionsAuthorizationServer = {
  routeTag: 'authorization-server',
  info: {
    title: 'Welcome to the Pix Authorization server',
    version: applicationPackage.version,
  },
  jsonPath: '/swagger.json',
};

const swaggerOptionsLivretScolaire = {
  routeTag: 'livret-scolaire',
  info: {
    title: 'Welcome to the Pix LSU/LSL open api',
    version: applicationPackage.version,
  },
  jsonPath: '/swagger.json',
};

const swaggerOptionsPoleEmploi = {
  routeTag: 'pole-emploi',
  info: {
    title: 'Pix Pôle emploi open api',
    version: applicationPackage.version,
  },
  jsonPath: '/swagger.json',
};

const swaggerOptionsIn = {
  basePath: '/api',
  grouping: 'tags',
  routeTag: 'api',
  info: {
    title: 'Welcome to the Pix api catalog',
    version: applicationPackage.version,
  },
  documentationPath: '/documentation',
  jsonPath: '/swagger.json',
};

function _buildSwaggerArgs(swaggerOptions) {
  return [
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
    {
      routes: { prefix: '/' + swaggerOptions.routeTag },
    },
  ];
}

const swaggers = [
  swaggerOptionsAuthorizationServer,
  swaggerOptionsLivretScolaire,
  swaggerOptionsPoleEmploi,
  swaggerOptionsIn,
].map(_buildSwaggerArgs);

export default swaggers;
