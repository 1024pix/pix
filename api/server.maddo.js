import Oppsy from '@1024pix/oppsy';
import Hapi from '@hapi/hapi';
import { parse } from 'neoqs';

import { setupErrorHandling } from './config/server-setup-error-handling.js';
import { databaseConnectionRegistry } from './db/database-connection-registry.js';
import { livretScolaireRoute } from './src/certification/results/application/livret-scolaire-route.js';
import { parcoursupRoute } from './src/certification/results/application/parcoursup-route.js';
import { identityAccessManagementRoutes } from './src/identity-access-management/application/routes.js';
import * as serverAuthentication from './src/identity-access-management/infrastructure/server-authentication.js';
import { campaignsRoute } from './src/maddo/application/campaigns-routes.js';
import { menDashboardRoute } from './src/maddo/application/men-dashboard-routes.js';
import { organizationsRoute } from './src/maddo/application/organizations-routes.js';
import { replicationsRoute } from './src/maddo/application/replications-routes.js';
import { poleEmploiRoute } from './src/prescription/campaign-participation/application/pole-emploi-route.js';
import { healthcheckRoute } from './src/shared/application/healthcheck/index.js';
import { config } from './src/shared/config.js';
import { installHapiHook } from './src/shared/infrastructure/execution-context-manager.js';
import { instrumentHapiServer } from './src/shared/infrastructure/open-telemetry/hapi-tracing.js';
import { plugins } from './src/shared/infrastructure/plugins/index.js';
import { deserializer } from './src/shared/infrastructure/serializers/jsonapi/deserializer.js';
import { maddoSwaggers } from './src/shared/swaggers.js';
import { handleFailAction } from './src/shared/validate.js';

installHapiHook();

const { logOpsMetrics, port, logging } = config;
const createMaddoServer = async () => {
  const server = createBareServer();

  setupOpenTelemetry(server);

  if (logOpsMetrics && !config.metrics.isOppsyDisabled) {
    await enableOppsyMetrics(server);
  }

  setupErrorHandling(server);

  setupAuthentication(server);

  await setupRoutesAndPlugins(server);

  await setupOpenApiSpecification(server);

  setupDeserialization(server);

  return server;
};

const createBareServer = function () {
  const serverConfiguration = {
    compression: false,
    debug: { request: false, log: false },
    routes: {
      validate: {
        failAction: handleFailAction,
      },
      cors: {
        origin: ['*'],
        additionalHeaders: ['X-Requested-With'],
      },
      response: {
        emptyStatusCode: 204,
      },
    },
    port,
    query: {
      parser: (query) => parse(query),
    },
    router: {
      isCaseSensitive: false,
      stripTrailingSlash: true,
    },
  };

  // Force https on non-dev environments
  if (config.environment !== 'development') {
    serverConfiguration.routes.security = {
      hsts: {
        includeSubDomains: true,
        preload: true,
        maxAge: 31536000,
      },
    };
  }

  return new Hapi.server(serverConfiguration);
};

const enableOppsyMetrics = async function (server) {
  const oppsy = new Oppsy(server);

  oppsy.on('ops', (data) => {
    server.log(['ops'], {
      ...data,
      ...databaseConnectionRegistry.getPoolMetrics(),
    });
  });

  oppsy.start(logging.opsEventIntervalInSeconds * 1000);
  server.oppsy = oppsy;
};

const setupDeserialization = function (server) {
  server.ext('onPreHandler', async (request, h) => {
    if (request.payload?.data) {
      request.deserializedPayload = await deserializer.deserialize(request.payload);
    }
    return h.continue;
  });
};

const setupAuthentication = function (server) {
  server.auth.scheme(serverAuthentication.schemes.jwt.name, serverAuthentication.schemes.jwt.scheme);
  const jwtApplicationStrategy = serverAuthentication.strategies.jwtApplication;
  server.auth.strategy(
    jwtApplicationStrategy.name,
    jwtApplicationStrategy.schemeName,
    jwtApplicationStrategy.configuration,
  );
  server.auth.default(jwtApplicationStrategy.name);
};

const setupRoutesAndPlugins = async function (server) {
  const routes = [
    ...identityAccessManagementRoutes,
    campaignsRoute,
    healthcheckRoute,
    organizationsRoute,
    replicationsRoute,
    menDashboardRoute,
    parcoursupRoute,
    poleEmploiRoute,
    livretScolaireRoute,
  ];
  const routesWithOptions = routes.map((route) => ({
    plugin: route,
    options: { tags: ['maddo'] },
  }));

  await server.register([...plugins, ...routesWithOptions]);
};

const setupOpenApiSpecification = async function (server) {
  for (const swaggerRegisterArgs of maddoSwaggers) {
    await server.register(...swaggerRegisterArgs);
  }
};

const setupOpenTelemetry = function (server) {
  if (config.logging.otelEnabled) {
    instrumentHapiServer(server);
  }
};

export { createMaddoServer };
