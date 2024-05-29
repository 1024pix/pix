import perf_hooks from 'node:perf_hooks';

import _ from 'lodash';

import * as eventBusBuilder from '../../../../../lib/infrastructure/events/EventBusBuilder.js';
import { EventDispatcher } from '../../../../../lib/infrastructure/events/EventDispatcher.js';
import { EventDispatcherLogger } from '../../../../../lib/infrastructure/events/EventDispatcherLogger.js';
import { monitoringTools as MonitoringTools } from '../../../../../lib/infrastructure/monitoring-tools.js';
import * as campaignParticipationRepository from '../../../../../lib/infrastructure/repositories/campaign-participation-repository.js';
import * as campaignRepository from '../../../../../lib/infrastructure/repositories/campaign-repository.js';
import * as targetProfileRepository from '../../../../../lib/infrastructure/repositories/target-profile-repository.js';
import { config } from '../../../../shared/config.js';
import * as assessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';
import * as authenticationMethodRepository from '../../../../shared/infrastructure/repositories/authentication-method-repository.js';
import * as organizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import * as userRepository from '../../../../shared/infrastructure/repositories/user-repository.js';
import { injectDefaults } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import * as disabledPoleEmploiNotifier from '../../infrastructure/externals/disabled-pole-emploi-notifier.js';
import * as poleEmploiNotifier from '../../infrastructure/externals/pole-emploi-notifier.js';
import * as poleEmploiSendingRepository from '../../infrastructure/repositories/pole-emploi-sending-repository.js';
import { handlePoleEmploiParticipationFinished } from './handle-pole-emploi-participation-finished.js';
import { handlePoleEmploiParticipationStarted } from './handle-pole-emploi-participation-started.js';

const { performance } = perf_hooks;

function requirePoleEmploiNotifier() {
  if (config.poleEmploi.pushEnabled) {
    return poleEmploiNotifier;
  } else {
    return disabledPoleEmploiNotifier;
  }
}

const dependencies = {
  assessmentRepository,
  authenticationMethodRepository,
  campaignRepository,
  campaignParticipationRepository,
  logger,
  organizationRepository,
  poleEmploiNotifier: requirePoleEmploiNotifier(),
  poleEmploiSendingRepository,
  targetProfileRepository,
  userRepository,
};

const handlersToBeInjected = {
  handlePoleEmploiParticipationFinished,
  handlePoleEmploiParticipationStarted,
};

function buildEventDispatcher(handlersStubs) {
  const eventDispatcher = new EventDispatcher(new EventDispatcherLogger(MonitoringTools, config, performance));

  const handlersNames = _.map(handlersToBeInjected, (handler) => handler.name);

  if (_.some(handlersNames, (name) => _.isEmpty(name))) {
    throw new Error('All handlers must have a name. Handlers : ' + handlersNames.join(', '));
  }
  if (_.uniq(handlersNames).length !== handlersNames.length) {
    throw new Error('All handlers must have a unique name. Handlers : ' + handlersNames.join(', '));
  }

  const handlers = { ...handlersToBeInjected, ...handlersStubs };

  for (const key in handlers) {
    const inject = _.partial(injectDefaults, dependencies);
    const injectedHandler = inject(handlers[key]);
    injectedHandler.handlerName = handlers[key].name;
    for (const eventType of handlersToBeInjected[key].eventTypes) {
      eventDispatcher.subscribe(eventType, injectedHandler);
    }
  }
  return eventDispatcher;
}

const eventDispatcher = buildEventDispatcher({});
const eventBus = eventBusBuilder.build();
const _forTestOnly = {
  handlers: handlersToBeInjected,
  buildEventDispatcher: function (stubbedHandlers) {
    return buildEventDispatcher(stubbedHandlers);
  },
};

export { _forTestOnly, eventBus, eventDispatcher };
