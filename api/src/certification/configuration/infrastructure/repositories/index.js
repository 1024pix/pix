import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as sessionsApi from '../../../enrolment/application/api/sessions-api.js';
import * as sessionsRepository from './sessions-repository.js';

/**
 * @typedef {sessionsRepository} SessionsRepository
 **/
const repositoriesWithoutInjectedDependencies = {
  sessionsRepository,
};

/**
 * @typedef {sessionsApi} SessionsApi
 **/
const dependencies = { sessionsApi };
const configurationRepositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);

export { configurationRepositories };
