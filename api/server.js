import Hapi from '@hapi/hapi';
import Oppsy from 'oppsy';

import { config } from './lib/config.js';
import { routes } from './lib/routes.js';
import { plugins } from './lib/infrastructure/plugins/index.js';
import { swaggers } from './lib/swaggers.js';
import { authentication } from './lib/infrastructure/authentication.js';
import { handleFailAction } from './lib/validate.js';
import { monitoringTools } from './lib/infrastructure/monitoring-tools.js';
import { deserializer } from './lib/infrastructure/serializers/jsonapi/deserializer.js';
import { knex } from './db/knex-database-connection.js';

// bounded context migration
import { evaluationRoutes } from './src/evaluation/routes.js';

import { certificationSessionRoutes } from './src/certification/session/routes.js';
import {
  attachTargetProfileRoutes,
  complementaryCertificationRoutes,
} from './src/certification/complementary-certification/routes.js';
import { scenarioSimulatorRoutes } from './src/certification/flash-certification/routes.js';
import { certificationCourseRoutes } from './src/certification/course/routes.js';
import { setupErrorHandling } from './config/server-setup-error-handling.js';

import { learnerManagementRoutes } from './src/prescription/learner-management/routes.js';
import { learnerListRoutes } from './src/prescription/organization-learner/routes.js';
import { targetProfileRoutes } from './src/prescription/target-profile/routes.js';
import { campaignRoutes } from './src/prescription/campaign/routes.js';

import { prescriberManagementRoutes } from './src/shared/prescriber-management/routes.js';

import { devcompRoutes } from './src/devcomp/routes.js';

import { schoolRoutes } from './src/school/routes.js';

import { authenticationRoutes } from './src/authentication/application/routes.js';

const certificationRoutes = [
  certificationSessionRoutes,
  attachTargetProfileRoutes,
  complementaryCertificationRoutes,
  certificationCourseRoutes,
];
const prescriptionRoutes = [learnerManagementRoutes, learnerListRoutes, targetProfileRoutes, campaignRoutes];
const sharedRoutes = [prescriberManagementRoutes];

monitoringTools.installHapiHook();

const { logOpsMetrics, port, logging } = config;
const createServer = async () => {
  const server = createBareServer();

  if (logOpsMetrics) await enableOpsMetrics(server);

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
    router: {
      isCaseSensitive: false,
      stripTrailingSlash: true,
    },
  };

  return new Hapi.server(serverConfiguration);
};

const enableOpsMetrics = async function (server) {
  const oppsy = new Oppsy(server);

  oppsy.on('ops', (data) => {
    const knexPool = knex.client.pool;
    server.log(['ops'], {
      ...data,
      knexPool: {
        used: knexPool.numUsed(),
        free: knexPool.numFree(),
        pendingAcquires: knexPool.numPendingAcquires(),
        pendingCreates: knexPool.numPendingCreates(),
      },
    });
  });

  oppsy.start(logging.emitOpsEventEachSeconds * 1000);
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
  server.auth.scheme(authentication.schemeName, authentication.scheme);
  authentication.strategies.forEach((strategy) => {
    server.auth.strategy(strategy.name, authentication.schemeName, strategy.configuration);
  });
  server.auth.default(authentication.defaultStrategy);
};

const setupRoutesAndPlugins = async function (server) {
  const configuration = [].concat(
    plugins,
    routes,
    authenticationRoutes,
    evaluationRoutes,
    scenarioSimulatorRoutes,
    devcompRoutes,
    schoolRoutes,
    ...certificationRoutes,
    ...sharedRoutes,
    ...prescriptionRoutes,
  );
  await server.register(configuration);
};

const setupOpenApiSpecification = async function (server) {
  for (const swaggerRegisterArgs of swaggers) {
    await server.register(...swaggerRegisterArgs);
  }
};

export { createServer };
