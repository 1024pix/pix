import * as organizationLearnerRepository from '../../../../../src/organizational-entities/infrastructure/repositories/organization-learner.repository.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Organizational-Entities | Infrastructure | Repositories | Organization-Learner', function () {
  describe('#findAllLearnerWithAtLeastOneParticipationByOrganizationId', function () {
    let registeredParticipantId, unRegisteredParticipantId, organizationId;

    beforeEach(async function () {
      const anonymousUserId = databaseBuilder.factory.buildUser({
        lastName: '',
        firstName: '',
        isAnonymous: true,
      }).id;
      organizationId = databaseBuilder.factory.buildOrganization().id;
      registeredParticipantId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;
      unRegisteredParticipantId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        userId: anonymousUserId,
      }).id;
      await databaseBuilder.commit();
    });

    it('should return count of active linked learner on account with at least one participation for given organizationId', async function () {
      databaseBuilder.factory.buildCampaignParticipation({
        organizationLearnerId: registeredParticipantId,
      });

      await databaseBuilder.commit();

      const result =
        await organizationLearnerRepository.findAllLearnerWithAtLeastOneParticipationByOrganizationId(organizationId);

      expect(result.totalRegisteredParticipant).to.equal(1);
      expect(result.totalUnRegisteredParticipant).to.equal(0);
    });

    it('should return count of active not linked learner on account with at least one participation for given organizationId', async function () {
      databaseBuilder.factory.buildCampaignParticipation({
        organizationLearnerId: unRegisteredParticipantId,
      });

      await databaseBuilder.commit();

      const result =
        await organizationLearnerRepository.findAllLearnerWithAtLeastOneParticipationByOrganizationId(organizationId);

      expect(result.totalRegisteredParticipant).to.equal(0);
      expect(result.totalUnRegisteredParticipant).to.equal(1);
    });

    it('should not count an active learner several times for given organizationId', async function () {
      databaseBuilder.factory.buildCampaignParticipation({
        organizationLearnerId: registeredParticipantId,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        organizationLearnerId: registeredParticipantId,
      });

      await databaseBuilder.commit();

      const result =
        await organizationLearnerRepository.findAllLearnerWithAtLeastOneParticipationByOrganizationId(organizationId);

      expect(result.totalRegisteredParticipant).to.equal(1);
    });

    it('should return 0 for active learner without participation', async function () {
      const result =
        await organizationLearnerRepository.findAllLearnerWithAtLeastOneParticipationByOrganizationId(organizationId);

      expect(result.totalRegisteredParticipant).to.equal(0);
    });

    it('should return 0 for active learner with deleted participation', async function () {
      databaseBuilder.factory.buildCampaignParticipation({
        organizationLearnerId: registeredParticipantId,
        deletedAt: new Date(),
      });
      await databaseBuilder.commit();

      const result =
        await organizationLearnerRepository.findAllLearnerWithAtLeastOneParticipationByOrganizationId(organizationId);

      expect(result.totalRegisteredParticipant).to.equal(0);
    });

    it('should return 0 for active learner with at least one participation from another organization', async function () {
      const { id: activeOrganizationLearnerFromAnotherOrganizationId } =
        databaseBuilder.factory.buildOrganizationLearner();
      databaseBuilder.factory.buildCampaignParticipation({
        organizationLearnerId: activeOrganizationLearnerFromAnotherOrganizationId,
      });
      await databaseBuilder.commit();

      const result =
        await organizationLearnerRepository.findAllLearnerWithAtLeastOneParticipationByOrganizationId(organizationId);

      expect(result.totalRegisteredParticipant).to.equal(0);
    });

    it('should return 0 for deleted learner', async function () {
      const deletedById = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        deletedAt: new Date(),
        deletedBy: deletedById,
      });
      await databaseBuilder.commit();

      const result =
        await organizationLearnerRepository.findAllLearnerWithAtLeastOneParticipationByOrganizationId(organizationId);

      expect(result.totalRegisteredParticipant).to.equal(0);
    });
  });
});
