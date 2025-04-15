import Oppsy from '@1024pix/oppsy';
import Hapi from '@hapi/hapi';
import { parse } from 'neoqs';

import { setupErrorHandling } from './config/server-setup-error-handling.js';
import { databaseConnections } from './db/database-connections.js';
import { knex } from './db/knex-database-connection.js';
import { authentication } from './lib/infrastructure/authentication.js';
import * as parcoursupRoutes from './src/certification/results/application/parcoursup-route.js';
import { identityAccessManagementRoutes } from './src/identity-access-management/application/routes.js';
import * as campaignsRoutes from './src/maddo/application/campaigns-routes.js';
import * as organizationsRoutes from './src/maddo/application/organizations-routes.js';
import * as replicationsRoutes from './src/maddo/application/replications-routes.js';
import { Metrics } from './src/monitoring/infrastructure/metrics.js';
import * as healthcheckRoutes from './src/shared/application/healthcheck/index.js';
import { config } from './src/shared/config.js';
import { monitoringTools } from './src/shared/infrastructure/monitoring-tools.js';
import { plugins } from './src/shared/infrastructure/plugins/index.js';
import { deserializer } from './src/shared/infrastructure/serializers/jsonapi/deserializer.js';
import { swaggers } from './src/shared/swaggers.js';
import { handleFailAction } from './src/shared/validate.js';

monitoringTools.installHapiHook();

const { logOpsMetrics, port, logging } = config;
const createMaddoServer = async () => {
  const server = createBareServer();

  // initialisation of Datadog link for metrics publication
  const metrics = new Metrics({ config });
  server.directMetrics = metrics;

  if (logOpsMetrics) {
    // OPS metrics via direct metrics
    if (config.featureToggles.isDirectMetricsEnabled) await enableOpsMetrics(server, metrics);
    // OPS metrics via Oppsy
    if (!config.featureToggles.isOppsyDisabled) await enableLegacyOpsMetrics(server);
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

const enableOpsMetrics = async function (server, metrics) {
  metrics.addRecurrentMetrics(
    [
      { type: 'gauge', name: 'captain.api.memory.rss', value: 'rss' },
      { type: 'gauge', name: 'captain.api.memory.heapTotal', value: 'heapTotal' },
      { type: 'gauge', name: 'captain.api.memory.heapUsed', value: 'heapUsed' },
      { type: 'gauge', name: 'captain.api.conteneur', constValue: 1 },
    ],
    5000,
    process.memoryUsage,
  );

  server.pixCustomIntervals = metrics.intervals;

  const gaugeConnections = (pool) => () => {
    metrics.addMetricPoint({ type: 'gauge', name: 'captain.api.knex.db_connections_used', value: pool.numUsed() });
    metrics.addMetricPoint({ type: 'gauge', name: 'captain.api.knex.db_connections_free', value: pool.numFree() });
    metrics.addMetricPoint({
      type: 'gauge',
      name: 'captain.api.knex.db_connections_pending_creation',
      value: pool.numPendingCreates(),
    });
    metrics.addMetricPoint({
      type: 'gauge',
      name: 'captain.api.knex.db_connections_pending_destroy',
      value: pool.pendingDestroys.length,
    });
  };

  const client = knex.client;
  gaugeConnections(client.pool)();

  client.pool.on('createSuccess', gaugeConnections(client.pool));
  client.pool.on('acquireSuccess', gaugeConnections(client.pool));
  client.pool.on('release', gaugeConnections(client.pool));
  client.pool.on('destroySuccess', gaugeConnections(client.pool));

  server.events.on('response', (request) => {
    const info = request.info;

    const statusCode = request.raw.res.statusCode;
    const responseTime = (info.completed !== undefined ? info.completed : info.responded) - info.received;

    metrics.addMetricPoint({
      type: 'histogram',
      name: 'captain.api.duration',
      tags: [`method:${request.route.method}`, `route:${request.route.path}`, `statusCode:${statusCode}`],
      value: responseTime,
    });
  });
};

const enableLegacyOpsMetrics = async function (server) {
  const oppsy = new Oppsy(server);

  oppsy.on('ops', (data) => {
    server.log(['ops'], {
      ...data,
      ...databaseConnections.getPoolMetrics(),
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
  server.auth.scheme(authentication.schemes.jwt.name, authentication.schemes.jwt.scheme);
  const jwtApplicationStrategy = authentication.strategies.jwtApplication;
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
    campaignsRoutes,
    healthcheckRoutes,
    organizationsRoutes,
    replicationsRoutes,
    parcoursupRoutes,
  ];
  const routesWithOptions = routes.map((route) => ({
    plugin: route,
    options: { tags: ['maddo'] },
  }));

  await server.register([...plugins, ...routesWithOptions]);
};

const setupOpenApiSpecification = async function (server) {
  for (const swaggerRegisterArgs of swaggers) {
    await server.register(...swaggerRegisterArgs);
  }
};

export { createMaddoServer };
