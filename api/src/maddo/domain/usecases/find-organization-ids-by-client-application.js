import { PromiseUtils } from '../../../shared/infrastructure/utils/promise-utils.js';

export async function findOrganizationIdsByClientApplication({
  clientId,
  clientApplicationRepository,
  organizationRepository,
}) {
  const jurisdiction = await clientApplicationRepository.getJurisdiction(clientId);

  const tagsRules = jurisdiction?.rules?.filter((rule) => rule.name === 'tags') ?? [];

  const rulesOrganizationIds = await PromiseUtils.mapSeries(tagsRules, (rule) =>
    organizationRepository.findIdsByTagNames(rule.value),
  );

  return Array.from(new Set(rulesOrganizationIds.flat()));
}
