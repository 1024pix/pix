import { PromiseUtils } from '../../../shared/infrastructure/utils/promise-utils.js';
import * as injectedClientApplicationRepository from '../../infrastructure/repositories/client-application-repository.js';
import * as injectedOrganizationRepository from '../../infrastructure/repositories/organization-repository.js';

export async function findOrganizationIdsByClientApplication({
  clientId,
  clientApplicationRepository = injectedClientApplicationRepository,
  organizationRepository = injectedOrganizationRepository,
} = {}) {
  const jurisdiction = await clientApplicationRepository.getJurisdiction(clientId);

  const tagsRules = jurisdiction.rules.filter((rule) => rule.name === 'tags');

  const rulesOrganizationIds = await PromiseUtils.mapSeries(tagsRules, (rule) =>
    organizationRepository.findIdsByTagNames(rule.value),
  );

  return Array.from(new Set(rulesOrganizationIds.flat()));
}
