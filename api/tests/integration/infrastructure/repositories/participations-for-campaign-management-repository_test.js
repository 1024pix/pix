const { expect, databaseBuilder } = require('../../../test-helper');
const participationsForCampaignManagementRepository = require('../../../../lib/infrastructure/repositories/participations-for-campaign-management-repository');
const _ = require('lodash');
const ParticipationForCampaignManagement = require('../../../../lib/domain/models/ParticipationForCampaignManagement');

describe('Integration | Repository | Participations-For-Campaign-Management', function () {
  describe('#findPaginatedParticipationsForCampaignManagement', function () {
    let page;
    let campaignId;

    beforeEach(async function () {
      campaignId = databaseBuilder.factory.buildCampaign().id;
      await databaseBuilder.commit();

      page = { number: 1, size: 3 };
    });

    context('when the given campaign has no participations', function () {
      it('should return an empty array', async function () {
        // given
        databaseBuilder.factory.buildCampaignParticipation();
        await databaseBuilder.commit();

        // when
        const { models: participationsForCampaignManagement } =
          await participationsForCampaignManagementRepository.findPaginatedParticipationsForCampaignManagement({
            campaignId,
            page,
          });

        // then
        expect(participationsForCampaignManagement).to.be.empty;
      });
    });

    context('when the given campaign has participations', function () {
      it('should return only participations for given campaign', async function () {
        // given
        const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration();
        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          schoolingRegistrationId: schoolingRegistration.id,
          participantExternalId: 'special',
        });
        const otherCampaignId = databaseBuilder.factory.buildCampaign().id;
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaignId,
          schoolingRegistrationId: schoolingRegistration.id,
        });
        await databaseBuilder.commit();

        // when
        const { models: participationsForCampaignManagement } =
          await participationsForCampaignManagementRepository.findPaginatedParticipationsForCampaignManagement({
            campaignId,
            page,
          });

        // then
        expect(participationsForCampaignManagement).to.have.lengthOf(1);
        expect(participationsForCampaignManagement[0].participantExternalId).to.equal(
          campaignParticipation.participantExternalId
        );
      });

      it('should return participations with all attributes', async function () {
        // given
        const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
          lastName: 'King',
          firstName: 'Arthur',
        });
        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          schoolingRegistrationId: schoolingRegistration.id,
        });
        await databaseBuilder.commit();

        // when
        const { models: participationsForCampaignManagement } =
          await participationsForCampaignManagementRepository.findPaginatedParticipationsForCampaignManagement({
            campaignId,
            page,
          });

        // then
        expect(participationsForCampaignManagement[0]).to.be.instanceOf(ParticipationForCampaignManagement);
        expect(participationsForCampaignManagement[0]).to.deep.equal({
          id: campaignParticipation.id,
          lastName: schoolingRegistration.lastName,
          firstName: schoolingRegistration.firstName,
          participantExternalId: campaignParticipation.participantExternalId,
          status: campaignParticipation.status,
          createdAt: campaignParticipation.createdAt,
          sharedAt: campaignParticipation.sharedAt,
        });
      });

      it('should sort participations by ascending lastName and then ascending firstName', async function () {
        // given
        const schoolingRegistrationId1 = databaseBuilder.factory.buildSchoolingRegistration({
          lastName: 'Baobab',
          firstName: 'Anatole',
        }).id;
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          schoolingRegistrationId: schoolingRegistrationId1,
          participantExternalId: '2',
        });
        const schoolingRegistrationId2 = databaseBuilder.factory.buildSchoolingRegistration({
          lastName: 'Baobab',
          firstName: 'Bernard',
        }).id;
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          schoolingRegistrationId: schoolingRegistrationId2,
          participantExternalId: '3',
        });
        const schoolingRegistrationId3 = databaseBuilder.factory.buildSchoolingRegistration({
          lastName: 'Athele',
          firstName: 'Peu importe',
        }).id;
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          schoolingRegistrationId: schoolingRegistrationId3,
          participantExternalId: '1',
        });

        await databaseBuilder.commit();

        // when
        const { models: participationsForCampaignManagement } =
          await participationsForCampaignManagementRepository.findPaginatedParticipationsForCampaignManagement({
            campaignId,
            page,
          });

        // then
        expect(_.map(participationsForCampaignManagement, 'participantExternalId')).to.exactlyContainInOrder([
          '1',
          '2',
          '3',
        ]);
      });
    });

    context('when participations amount exceed page size', function () {
      it('should return page size number of participations', async function () {
        page = { number: 2, size: 2 };

        _.times(4, () => databaseBuilder.factory.buildCampaignParticipation({ campaignId }));
        const expectedPagination = { page: 2, pageSize: 2, pageCount: 2, rowCount: 4 };
        await databaseBuilder.commit();
        // when
        const { models: participationsForCampaignManagement, meta: pagination } =
          await participationsForCampaignManagementRepository.findPaginatedParticipationsForCampaignManagement({
            campaignId,
            page,
          });

        // then
        expect(participationsForCampaignManagement).to.have.lengthOf(2);
        expect(pagination).to.include(expectedPagination);
      });
    });
  });
});
