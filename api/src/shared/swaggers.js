import HapiSwagger from 'hapi-swagger';

import { config } from '../../config/config.js';
import packageJSON from '../../package.json' with { type: 'json' };
import { logger } from './infrastructure/utils/logger.js';

/**
 * System wide Open API configuration
 * Contains basic Open Api configuration
 * @abstract
 */
class PixOpenApiBaseDefinition {
  /**
   * @param {Object} params
   * @param {string} params.endpoint API documentation endpoint
   *                                 example: "endpoint=/test"
   */
  constructor({ endpoint }) {
    if (!endpoint) {
      throw new TypeError('Open Api definition requires an endpoint definition');
    }

    /**
     * Open Api endpoint definition will be exposed under this endpoint
     * @type {string}
     * @public
     */
    this.endpoint = endpoint;

    /**
     * Swagger configuration that builds the swagger.json and Swagger UI endpoints
     * @type {Object}
     * @public
     */
    this.swaggerConfiguration = {
      OAS: 'v3.0',
      routeTag: (tags) => tags.includes('api') && !tags.includes('healthcheck'),
      info: {
        title: 'Welcome to the Pix api catalog',
        version: packageJSON.version,
      },
      jsonPath: '/swagger.json',
      swaggerUIPath: '/documentation/swaggerui/',
      uiOptions: {
        url: 'swagger.json',
      },
      securityDefinitions: {
        bearerAuth: {
          name: 'Authorization',
          scheme: 'Bearer',
          in: 'header',
          description: 'Example: "Bearer <MY_TOKEN>" (without the double quote)',
          type: 'apiKey',
        },
      },
      security: [{ bearerAuth: [], jwt: [] }],
    };
  }
}

class AuthorizationServer extends PixOpenApiBaseDefinition {
  constructor() {
    super({ endpoint: '/authorization-server' });
    this.swaggerConfiguration.info.title = 'Welcome to the Pix Authorization server';
    this.swaggerConfiguration.routeTag = 'authorization-server';
  }
}

class LivretScolaire extends PixOpenApiBaseDefinition {
  constructor() {
    super({ endpoint: '/livret-scolaire' });
    this.swaggerConfiguration.info.title = 'Welcome to the Pix LSU/LSL Open Api';
    this.swaggerConfiguration.routeTag = 'livret-scolaire';
  }
}

class PoleEmploi extends PixOpenApiBaseDefinition {
  constructor() {
    super({ endpoint: '/pole-emploi' });
    this.swaggerConfiguration.info.title = 'Pix Pôle emploi Open Api';
    this.swaggerConfiguration.routeTag = 'pole-emploi';
  }
}

class PixAPI extends PixOpenApiBaseDefinition {
  constructor() {
    super({ endpoint: '/api' });
    this.swaggerConfiguration.grouping = 'tags';
    this.swaggerConfiguration.tagsGroupingFilter = (tag) => !['api', 'maddo'].includes(tag);
  }
}

/**
 * Open API definitions that are exposed via APIM
 * Extend this class to expose tour endpoints via the ApiManager
 * @abstract
 */
class ApiManagerAccess extends PixOpenApiBaseDefinition {
  /**
   * @param {Object} params
   * @param {string} params.appIdentifier will expose API documentation under this identifier
   *                                       example: "appIdentifier=test" produces "/documentation/test"
   */
  constructor({ appIdentifier }) {
    if (!appIdentifier) {
      throw new TypeError('API manager configuration requires an app identifier');
    }

    // Api Manager documentation are all grouped under same endpoint
    super({ endpoint: `/documentation/${appIdentifier}` });

    // Group Swagger static assets under our app endpoint
    this.swaggerConfiguration.documentationPath = '/';
    this.swaggerConfiguration.swaggerUIPath = '/';
    this.swaggerConfiguration.jsonPath = '/openapi.json';
    this.swaggerConfiguration.uiOptions.url = `${this.endpoint}${this.swaggerConfiguration.jsonPath}`;

    // UI won't display the internal api base path externally
    this.swaggerConfiguration.pathReplacements = [
      {
        replaceIn: 'all',
        pattern: /api\/(?:application\/)?/,
        replacement: '',
      },
    ];
    this.#addExternalPartnersAccess();
  }

  /**
   * Create documentation partners accesspoint based on Pix backend APIM configuration
   * @see {@link https://learn.openapis.org/specification/servers.html}
   */
  #addExternalPartnersAccess() {
    const serverUrl = this.#buildUrl(config.apiManager.url);
    if (serverUrl) {
      this.swaggerConfiguration.servers = [
        {
          url: serverUrl,
          description: 'External Partners access',
        },
      ];
    }
  }

  #buildUrl(baseUrl) {
    try {
      return new URL(baseUrl).href;
    } catch (error) {
      // Cannot crash the server for a missing URI
      logger.error(error);
    }
  }
}

class Parcoursup extends ApiManagerAccess {
  constructor() {
    super({ appIdentifier: 'parcoursup' });
    this.swaggerConfiguration.info.title = 'Pix Parcoursup Open Api';
    this.swaggerConfiguration.routeTag = 'parcoursup';
  }
}

class Maddo extends ApiManagerAccess {
  constructor() {
    super({ appIdentifier: 'maddo' });
    this.swaggerConfiguration.info.title = 'Api de mise à disposition de données Pix';
    this.swaggerConfiguration.grouping = 'tags';
    this.swaggerConfiguration.tagsGroupingFilter = (tag) => !['api', 'maddo'].includes(tag);
  }
}

const buildHapiPlugin = (clazz) => {
  const apiDefinition = new clazz();

  return [
    {
      plugin: HapiSwagger,
      options: apiDefinition.swaggerConfiguration,
    },
    {
      routes: { prefix: apiDefinition.endpoint },
    },
  ];
};

export const swaggers = [PixAPI, AuthorizationServer, LivretScolaire, PoleEmploi].map(buildHapiPlugin);

export const maddoSwaggers = [Maddo, Parcoursup].map(buildHapiPlugin);
