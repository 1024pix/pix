import { OrganizationLearnerList } from '../models/OrganizationLearnerList.js';

const deleteOrganizationLearners = async function ({
  organizationLearnerIds,
  userId,
  organizationId,
  organizationLearnerRepository,
  campaignParticipationRepository,
}) {
  const organizationLearnerIdsFromOrganization =
    await organizationLearnerRepository.findOrganizationLearnerIdsByOrganizationId({
      organizationId,
    });

  const organizationLearnerList = new OrganizationLearnerList({
    organizationId,
    organizationLearnerIds: organizationLearnerIdsFromOrganization,
  });

  organizationLearnerList.canDeleteOrganizationLearners(organizationLearnerIds, userId);
  await campaignParticipationRepository.removeByOrganizationLearnerIds({
    organizationLearnerIds,
    userId,
  });

  await organizationLearnerRepository.removeByIds({ organizationLearnerIds, userId });
};

export { deleteOrganizationLearners };
