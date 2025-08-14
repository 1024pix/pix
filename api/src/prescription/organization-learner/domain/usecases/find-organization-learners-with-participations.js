import Joi from 'joi';

import { tagRepository as injectedTagRepository } from '../../../../organizational-entities/infrastructure/repositories/tag.repository.js';
import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import * as injectedOrganizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import * as injectedCampaignParticipationOverviewRepository from '../../../campaign-participation/infrastructure/repositories/campaign-participation-overview-repository.js';
import * as injectedLibOrganizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';

const userIdsSchema = Joi.array().items(Joi.number());

const findOrganizationLearnersWithParticipations = withTransaction(async function ({
  userIds,
  campaignParticipationOverviewRepository = injectedCampaignParticipationOverviewRepository,
  organizationRepository = injectedOrganizationRepository,
  libOrganizationLearnerRepository = injectedLibOrganizationLearnerRepository,
  tagRepository = injectedTagRepository,
} = {}) {
  const validationResult = userIdsSchema.validate(userIds);

  if (validationResult.error) {
    return [];
  }

  const organizationLearners = (
    await Promise.all(
      userIds.map((userId) => {
        return libOrganizationLearnerRepository.findByUserId({ userId });
      }),
    )
  ).flat();

  return Promise.all(
    organizationLearners.map(async (organizationLearner) => {
      const organization = await organizationRepository.get(organizationLearner.organizationId);
      const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByOrganizationLearnerId({
        organizationLearnerId: organizationLearner.id,
      });
      const tags = await tagRepository.findByIds(organization.tags.map((tag) => tag.id));

      return {
        organizationLearner,
        organization,
        campaignParticipations: campaignParticipationOverviews,
        tagNames: tags.map((tag) => tag.name),
      };
    }),
  );
});

export { findOrganizationLearnersWithParticipations };
