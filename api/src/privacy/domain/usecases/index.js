import * as userRepository from '../../../identity-access-management/infrastructure/repositories/user.repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import * as emailRepository from '../../../shared/mail/infrastructure/repositories/email.repository.js';
import { adminMemberRepository } from '../../../team/infrastructure/repositories/admin-member.repository.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import { anonymizeServices } from '../services/anonymize-services/index.js';
import * as eventJobPublisherService from '../../../shared/infrastructure/events/event-job-publisher-service.js';
import { anonymizeUserByAdmin } from './anonymize-user-by-admin.usecase.js';
import { selfAnonymizeByUser } from './self-anonymize-by-user.usecase.js';

const repositories = {
  userRepository,
  emailRepository,
  adminMemberRepository,
};

const services = {
  anonymizeServices,
  eventJobPublisherService,
};

const usecasesWithoutInjectedDependencies = {
  anonymizeUserByAdmin,
  selfAnonymizeByUser,
};

const dependencies = Object.assign({}, repositories, services);

export const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);
