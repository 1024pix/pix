import Oppsy from '@1024pix/oppsy';
import Hapi from '@hapi/hapi';
import { parse } from 'neoqs';

import { setupErrorHandling } from './config/server-setup-error-handling.js';
import { databaseConnections } from './db/database-connections.js';
import { knex } from './db/knex-database-connection.js';
import { authentication } from './lib/infrastructure/authentication.js';
import { routes } from './lib/routes.js';
import { bannerRoutes } from './src/banner/routes.js';
import {
  attachTargetProfileRoutes,
  complementaryCertificationRoutes,
} from './src/certification/complementary-certification/routes.js';
import { certificationConfigurationRoutes, scoWhitelistRoutes } from './src/certification/configuration/routes.js';
import { certificationEnrolmentRoutes } from './src/certification/enrolment/routes.js';
import { certificationEvaluationRoutes } from './src/certification/evaluation/routes.js';
import { flashCertificationRoutes } from './src/certification/flash-certification/routes.js';
import { certificationResultRoutes } from './src/certification/results/routes.js';
import { scoringRoutes } from './src/certification/scoring/routes.js';
import { certificationSessionRoutes } from './src/certification/session-management/routes.js';
import { devcompRoutes } from './src/devcomp/routes.js';
import { evaluationRoutes } from './src/evaluation/routes.js';
import { identityAccessManagementRoutes } from './src/identity-access-management/application/routes.js';
import { learningContentRoutes } from './src/learning-content/routes.js';
import { Metrics } from './src/monitoring/infrastructure/metrics.js';
import { organizationalEntitiesRoutes } from './src/organizational-entities/application/routes.js';
import { campaignRoutes } from './src/prescription/campaign/routes.js';
import { campaignParticipationsRoutes } from './src/prescription/campaign-participation/routes.js';
import { learnerManagementRoutes } from './src/prescription/learner-management/routes.js';
import { organizationLearnerRoutes } from './src/prescription/organization-learner/routes.js';
import { organizationLearnerFeatureRoutes } from './src/prescription/organization-learner-feature/routes.js';
import { organizationPlaceRoutes } from './src/prescription/organization-place/routes.js';
import { targetProfileRoutes } from './src/prescription/target-profile/routes.js';
import { profileRoutes } from './src/profile/routes.js';
import { questRoutes } from './src/quest/routes.js';
import { schoolRoutes } from './src/school/routes.js';
import { config } from './src/shared/config.js';
import { monitoringTools } from './src/shared/infrastructure/monitoring-tools.js';
import { plugins } from './src/shared/infrastructure/plugins/index.js';
import { deserializer } from './src/shared/infrastructure/serializers/jsonapi/deserializer.js';
// bounded context migration
import { sharedRoutes } from './src/shared/routes.js';
import { swaggers } from './src/shared/swaggers.js';
import { handleFailAction } from './src/shared/validate.js';
import { teamRoutes } from './src/team/application/routes.js';

const certificationRoutes = [
  attachTargetProfileRoutes,
  certificationConfigurationRoutes,
  certificationEnrolmentRoutes,
  certificationResultRoutes,
  certificationSessionRoutes,
  complementaryCertificationRoutes,
  scoringRoutes,
  scoWhitelistRoutes,
  certificationEvaluationRoutes,
];

const prescriptionRoutes = [
  learnerManagementRoutes,
  organizationLearnerRoutes,
  organizationLearnerFeatureRoutes,
  targetProfileRoutes,
  campaignRoutes,
  organizationPlaceRoutes,
  campaignParticipationsRoutes,
];

monitoringTools.installHapiHook();

const { logOpsMetrics, port, logging } = config;
const createServer = async () => {
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
  Object.values(authentication.strategies).forEach((strategy) => {
    server.auth.strategy(strategy.name, strategy.schemeName, strategy.configuration);
  });
  server.auth.default(authentication.strategies.jwtUser.name);
};

const setupRoutesAndPlugins = async function (server) {
  const configuration = [].concat(
    plugins,
    routes,
    identityAccessManagementRoutes,
    organizationalEntitiesRoutes,
    sharedRoutes,
    profileRoutes,
    questRoutes,
    evaluationRoutes,
    flashCertificationRoutes,
    devcompRoutes,
    schoolRoutes,
    teamRoutes,
    learningContentRoutes,
    ...certificationRoutes,
    ...prescriptionRoutes,
    bannerRoutes,
    {
      name: 'root',
      register: async function (server) {
        server.route([
          {
            method: 'GET',
            path: '/',
            config: {
              auth: false,
              handler: (_, h) => h.response().code(204),
            },
          },
        ]);
      },
    },
  );
  await server.register(configuration);
};

const setupOpenApiSpecification = async function (server) {
  for (const swaggerRegisterArgs of swaggers) {
    await server.register(...swaggerRegisterArgs);
  }
};

export { createServer };
