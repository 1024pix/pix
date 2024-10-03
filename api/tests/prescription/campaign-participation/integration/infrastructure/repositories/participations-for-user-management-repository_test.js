import { CampaignParticipationForUserManagement } from '../../../../../../src/prescription/campaign-participation/domain/models/CampaignParticipationForUserManagement.js';
import * as participationsForUserManagementRepository from '../../../../../../src/prescription/campaign-participation/infrastructure/repositories/participations-for-user-management-repository.js';
import { CampaignParticipationStatuses } from '../../../../../../src/prescription/shared/domain/constants.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

const { SHARED } = CampaignParticipationStatuses;

describe('Integration | Repository | Participations-For-User-Management', function () {
  describe('#findByUserId', function () {
    let userId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
    });

    context('when the given user has no participations', function () {
      it('should return an empty array', async function () {
        // given
        databaseBuilder.factory.buildCampaignParticipation();
        await databaseBuilder.commit();

        // when
        const participationsForUserManagement = await participationsForUserManagementRepository.findByUserId(userId);

        // then
        expect(participationsForUserManagement).to.be.empty;
      });
    });

    context('when the given user has participations', function () {
      it('should return only participations for given user', async function () {
        // given
        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          participantExternalId: 'special',
        });
        const otherUserId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCampaignParticipation({
          userId: otherUserId,
        });
        await databaseBuilder.commit();

        // when
        const participationsForUserManagement = await participationsForUserManagementRepository.findByUserId(userId);

        // then
        expect(participationsForUserManagement).to.have.lengthOf(1);
        expect(participationsForUserManagement[0].participantExternalId).to.equal(
          campaignParticipation.participantExternalId,
        );
      });

      it('should return participations with all attributes', async function () {
        // given
        const campaign = databaseBuilder.factory.buildCampaign({ code: 'FUNCODE' });
        const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          firstName: 'Blanche',
          lastName: 'Isserie',
        });
        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          organizationLearnerId: organizationLearner.id,
          campaignId: campaign.id,
          participantExternalId: '123',
          status: SHARED,
          createdAt: new Date('2010-10-10'),
          sharedAt: new Date('2010-10-11'),
        });

        await databaseBuilder.commit();

        // when
        const participationsForUserManagement = await participationsForUserManagementRepository.findByUserId(userId);

        // then
        expect(participationsForUserManagement[0]).to.be.instanceOf(CampaignParticipationForUserManagement);
        expect(participationsForUserManagement[0]).to.deep.includes({
          id: campaignParticipation.id,
          participantExternalId: campaignParticipation.participantExternalId,
          status: campaignParticipation.status,
          createdAt: campaignParticipation.createdAt,
          sharedAt: campaignParticipation.sharedAt,
          campaignId: campaign.id,
          campaignCode: campaign.code,
          organizationLearnerFullName: `${organizationLearner.firstName} ${organizationLearner.lastName}`,
        });
      });

      context('When a participation is deleted', function () {
        it('should return participation with deletion attributes', async function () {
          // given
          const deletingUser = databaseBuilder.factory.buildUser({ id: 666, firstName: 'The', lastName: 'Terminator' });
          const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
            userId,
            deletedAt: new Date('2010-10-12'),
            deletedBy: deletingUser.id,
          });

          await databaseBuilder.commit();

          // when
          const participationsForUserManagement = await participationsForUserManagementRepository.findByUserId(userId);

          // then
          expect(participationsForUserManagement[0]).to.deep.includes({
            deletedAt: campaignParticipation.deletedAt,
            deletedBy: campaignParticipation.deletedBy,
            deletedByFullName: 'The Terminator',
          });
        });
      });

      it('should sort participations by descending createdAt', async function () {
        const campaign1 = databaseBuilder.factory.buildCampaign();
        const campaign2 = databaseBuilder.factory.buildCampaign();
        const campaign3 = databaseBuilder.factory.buildCampaign();

        // given
        const participationToCampaign1InJanuary = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: campaign1.id,
          participantExternalId: 'Created-January',
          createdAt: new Date('2024-01-01'),
        });
        const participationToCampaign2InFebruary = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: campaign2.id,
          participantExternalId: 'Created-February',
          createdAt: new Date('2024-02-01'),
        });
        const participationToCampaign3InMarch = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: campaign3.id,
          participantExternalId: 'Created-March',
          createdAt: new Date('2024-03-01'),
        });

        await databaseBuilder.commit();

        // when
        const participationsForUserManagement = await participationsForUserManagementRepository.findByUserId(userId);

        // then
        expect(participationsForUserManagement[0].id).to.equal(participationToCampaign3InMarch.id);
        expect(participationsForUserManagement[1].id).to.equal(participationToCampaign2InFebruary.id);
        expect(participationsForUserManagement[2].id).to.equal(participationToCampaign1InJanuary.id);
      });

      it('should sort participations by ascending campaign code when createdAt is the same', async function () {
        const campaignA = databaseBuilder.factory.buildCampaign({ code: 'AAAAAAA' });
        const campaignB = databaseBuilder.factory.buildCampaign({ code: 'BBBBBBB' });
        const campaignC = databaseBuilder.factory.buildCampaign({ code: 'CCCCCCC' });

        // given
        const participationToCampaignC = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: campaignC.id,
          createdAt: new Date('2020-01-02'),
        });
        const participationToCampaignB = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: campaignB.id,
          createdAt: new Date('2020-01-02'),
        });
        const participationToCampaignA = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: campaignA.id,
          createdAt: new Date('2020-01-02'),
        });

        await databaseBuilder.commit();

        // when
        const participationsForUserManagement = await participationsForUserManagementRepository.findByUserId(userId);

        // then
        expect(participationsForUserManagement[0].id).to.equal(participationToCampaignA.id);
        expect(participationsForUserManagement[1].id).to.equal(participationToCampaignB.id);
        expect(participationsForUserManagement[2].id).to.equal(participationToCampaignC.id);
      });

      it('should sort participations by descending sharedAt when createdAt is the same and campaign code is the same', async function () {
        const campaign = databaseBuilder.factory.buildCampaign();
        // given
        const participationSharedInJanuary = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: campaign.id,
          participantExternalId: 'Shared-January',
          createdAt: new Date('2020-01-02'),
          sharedAt: new Date('2023-01-01'),
          isImproved: true,
        });
        const participationSharedInFebruary = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: campaign.id,
          participantExternalId: 'Shared-February',
          createdAt: new Date('2020-01-02'),
          sharedAt: new Date('2023-02-01'),
        });
        const participationSharedInMarch = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: campaign.id,
          participantExternalId: 'Shared-March',
          createdAt: new Date('2020-01-02'),
          sharedAt: new Date('2023-03-01'),
          isImproved: true,
        });

        await databaseBuilder.commit();

        // when
        const participationsForUserManagement = await participationsForUserManagementRepository.findByUserId(userId);

        // then
        expect(participationsForUserManagement[0].id).to.equal(participationSharedInMarch.id);
        expect(participationsForUserManagement[1].id).to.equal(participationSharedInFebruary.id);
        expect(participationsForUserManagement[2].id).to.equal(participationSharedInJanuary.id);
      });
    });
  });
});
