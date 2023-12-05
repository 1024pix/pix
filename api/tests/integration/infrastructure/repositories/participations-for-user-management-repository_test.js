import { expect, databaseBuilder } from '../../../test-helper.js';
import * as participationsForUserManagementRepository from '../../../../lib/infrastructure/repositories/participations-for-user-management-repository.js';
import _ from 'lodash';
import { CampaignParticipationForUserManagement } from '../../../../lib/domain/read-models/CampaignParticipationForUserManagement.js';
import { CampaignParticipationStatuses } from '../../../../src/prescription/shared/domain/constants.js';

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

      it('should sort participations by ascending campaign code', async function () {
        const campaignId1 = databaseBuilder.factory.buildCampaign({ code: 'AAAAAAA' }).id;
        const campaignId2 = databaseBuilder.factory.buildCampaign({ code: 'BBBBBBB' }).id;
        const campaignId3 = databaseBuilder.factory.buildCampaign({ code: 'CCCCCCC' }).id;
        // given
        databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: campaignId3,
          participantExternalId: '3',
          createdAt: new Date('2020-01-02'),
        });
        databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: campaignId1,
          participantExternalId: '1',
          createdAt: new Date('2020-01-01'),
        });
        databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: campaignId2,
          participantExternalId: '2',
          createdAt: new Date('2020-01-03'),
        });

        await databaseBuilder.commit();

        // when
        const participationsForUserManagement = await participationsForUserManagementRepository.findByUserId(userId);

        // then
        expect(_.map(participationsForUserManagement, 'campaignCode')).to.exactlyContainInOrder([
          'AAAAAAA',
          'BBBBBBB',
          'CCCCCCC',
        ]);
      });

      it('should sort participations by descending sharedAt when campaign code is the same', async function () {
        const campaignId = databaseBuilder.factory.buildCampaign({ code: 'AAAAAAA' }).id;
        // given
        databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          participantExternalId: 'January23',
          createdAt: new Date('2020-01-02'),
          sharedAt: new Date('2023-01-01'),
          isImproved: true,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          participantExternalId: 'May23',
          createdAt: new Date('2020-01-01'),
          sharedAt: new Date('2023-05-01'),
        });
        databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          participantExternalId: 'March23',
          createdAt: new Date('2020-01-03'),
          sharedAt: new Date('2023-03-01'),
          isImproved: true,
        });

        await databaseBuilder.commit();

        // when
        const participationsForUserManagement = await participationsForUserManagementRepository.findByUserId(userId);

        // then
        expect(_.map(participationsForUserManagement, 'participantExternalId')).to.exactlyContainInOrder([
          'May23',
          'March23',
          'January23',
        ]);
      });

      it('should sort participations first by ascending campaignCode and after by sharedAt', async function () {
        const campaignId1 = databaseBuilder.factory.buildCampaign({ code: 'AAAAAAA' }).id;
        const campaignId2 = databaseBuilder.factory.buildCampaign({ code: 'BBBBBBB' }).id;
        // given
        databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: campaignId2,
          participantExternalId: 'BBBB-MAY23',
          createdAt: new Date('2020-01-02'),
          sharedAt: new Date('2023-05-01'),
        });
        databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: campaignId1,
          participantExternalId: 'AAAA-JANUARY23',
          createdAt: new Date('2020-01-01'),
          sharedAt: new Date('2023-01-01'),
        });
        databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: campaignId2,
          participantExternalId: 'BBBB-FEBRUARY23',
          createdAt: new Date('2020-01-03'),
          sharedAt: new Date('2023-02-01'),
          isImproved: true,
        });

        await databaseBuilder.commit();

        // when
        const participationsForUserManagement = await participationsForUserManagementRepository.findByUserId(userId);

        // then
        expect(_.map(participationsForUserManagement, 'participantExternalId')).to.exactlyContainInOrder([
          'AAAA-JANUARY23',
          'BBBB-MAY23',
          'BBBB-FEBRUARY23',
        ]);
      });
    });
  });
});
