import * as organizationFeatureAPI from '../../../../organizational-entities/application/api/organization-features-api.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as campaignsAPI from '../../../campaign/application/api/campaigns-api.js';
import * as knowledgeElementSnapshotAPI from '../../../campaign/application/api/knowledge-element-snapshots-api.js';
import * as campaignParticipantRepository from './campaign-participant-repository.js';
import * as participantResultsSharedRepository from './participant-results-shared-repository.js';

const repositoriesWithoutInjectedDependencies = {
  campaignParticipantRepository,
  participantResultsSharedRepository,
};

const dependencies = {
  organizationFeatureAPI,
  knowledgeElementSnapshotAPI,
  campaignsAPI,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);

export { repositories };
