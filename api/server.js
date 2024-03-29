import Hapi from '@hapi/hapi';
import Oppsy from 'oppsy';

import { setupErrorHandling } from './config/server-setup-error-handling.js';
import { setupOidcAuthenticationServiceRegistry } from './config/setup-oidc-authentication-service-registry.js';
import { knex } from './db/knex-database-connection.js';
import { config } from './lib/config.js';
import { authentication } from './lib/infrastructure/authentication.js';
import { monitoringTools } from './lib/infrastructure/monitoring-tools.js';
import { plugins } from './lib/infrastructure/plugins/index.js';
import { deserializer } from './lib/infrastructure/serializers/jsonapi/deserializer.js';
import { routes } from './lib/routes.js';
import { swaggers } from './lib/swaggers.js';
import { handleFailAction } from './lib/validate.js';
import { authenticationRoutes } from './src/authentication/application/routes.js';
import {
  attachTargetProfileRoutes,
  complementaryCertificationRoutes,
} from './src/certification/complementary-certification/routes.js';
import { certificationCourseRoutes } from './src/certification/course/routes.js';
import { flashCertificationRoutes } from './src/certification/flash-certification/routes.js';
import { scoringRoutes } from './src/certification/scoring/routes.js';
import { certificationSessionRoutes } from './src/certification/session/routes.js';
import { devcompRoutes } from './src/devcomp/routes.js';
import { evaluationRoutes } from './src/evaluation/routes.js';
import { organizationalEntitiesRoutes } from './src/organizational-entities/application/routes.js';
import { campaignRoutes } from './src/prescription/campaign/routes.js';
import { campaignParticipationsRoutes } from './src/prescription/campaign-participation/routes.js';
import { learnerManagementRoutes } from './src/prescription/learner-management/routes.js';
import { organizationLearnerRoutes } from './src/prescription/organization-learner/routes.js';
import { organizationPlaceRoutes } from './src/prescription/organization-place/routes.js';
import { targetProfileRoutes } from './src/prescription/target-profile/routes.js';
import { schoolRoutes } from './src/school/routes.js';
import { prescriberManagementRoutes } from './src/shared/prescriber-management/routes.js';
// bounded context migration
import { sharedRoutes } from './src/shared/routes.js';

const certificationRoutes = [
  certificationSessionRoutes,
  attachTargetProfileRoutes,
  complementaryCertificationRoutes,
  certificationCourseRoutes,
  scoringRoutes,
];

const prescriptionRoutes = [
  learnerManagementRoutes,
  organizationLearnerRoutes,
  targetProfileRoutes,
  campaignRoutes,
  organizationPlaceRoutes,
  campaignParticipationsRoutes,
];
const prescriptionSharedRoutes = [prescriberManagementRoutes];

monitoringTools.installHapiHook();

const { logOpsMetrics, port, logging } = config;
const createServer = async (serverOptions = {}) => {
  const server = createBareServer();

  if (logOpsMetrics) await enableOpsMetrics(server);

  setupErrorHandling(server);

  setupAuthentication(server);

  await setupRoutesAndPlugins(server);

  await setupOpenApiSpecification(server);

  setupDeserialization(server);

  await setupOidcAuthenticationServiceRegistry(serverOptions.oidcProviderServices);

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
    organizationalEntitiesRoutes,
    sharedRoutes,
    evaluationRoutes,
    flashCertificationRoutes,
    devcompRoutes,
    schoolRoutes,
    ...certificationRoutes,
    ...prescriptionRoutes,
    ...prescriptionSharedRoutes,
  );
  await server.register(configuration);
};

const setupOpenApiSpecification = async function (server) {
  for (const swaggerRegisterArgs of swaggers) {
    await server.register(...swaggerRegisterArgs);
  }
};

export { createServer };
