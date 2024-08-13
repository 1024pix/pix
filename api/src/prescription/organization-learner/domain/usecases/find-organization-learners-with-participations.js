import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';

const findOrganizationLearnersWithParticipations = withTransaction(async function ({
  userIds,
  campaignParticipationOverviewRepository,
  organizationRepository,
  libOrganizationLearnerRepository,
  tagRepository,
}) {
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
      const participations = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
        userId: organizationLearner.userId,
        page: { number: 1, size: 1000 },
      });
      const tags = await tagRepository.findByIds(organization.tags.map((tag) => tag.id));

      return {
        organizationLearner,
        organization,
        participations: participations.campaignParticipationOverviews,
        tagNames: tags.map((tag) => tag.name),
      };
    }),
  );
});

export { findOrganizationLearnersWithParticipations };
