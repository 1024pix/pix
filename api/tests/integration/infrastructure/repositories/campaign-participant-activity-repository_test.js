const { expect, databaseBuilder } = require('../../../test-helper');
const campaignParticipantActivityRepository = require('../../../../lib/infrastructure/repositories/campaign-participant-activity-repository');
const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');
const Campaign = require('../../../../lib/domain/models/Campaign');

const { STARTED, SHARED, TO_SHARE } = CampaignParticipation.statuses;

describe('Integration | Repository | Campaign Participant activity', function () {
  describe('#findPaginatedByCampaignId', function () {
    let campaign;

    context('When there is an assessment for another campaign', function () {
      beforeEach(async function () {
        campaign = databaseBuilder.factory.buildAssessmentCampaign({});
        const otherCampaign = databaseBuilder.factory.buildCampaign();

        databaseBuilder.factory.buildAssessmentFromParticipation({
          participantExternalId: 'The good',
          campaignId: campaign.id,
        });

        databaseBuilder.factory.buildAssessmentFromParticipation({
          participantExternalId: 'The bad',
          campaignId: otherCampaign.id,
        });

        databaseBuilder.factory.buildAssessmentFromParticipation({
          participantExternalId: 'The ugly',
          campaignId: campaign.id,
        });

        await databaseBuilder.commit();
      });

      it('Returns a participation activity for each participant of the given campaign', async function () {
        const { campaignParticipantsActivities } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
        const participantExternalIds = campaignParticipantsActivities.map((activity) => activity.participantExternalId);

        expect(participantExternalIds).to.exactlyContain(['The good', 'The ugly']);
      });
    });

    context('When there are several participations for the same participant', function () {
      it('Returns one CampaignParticipantActivity with the most recent participation (isImproved = false)', async function () {
        //Given
        const campaign = databaseBuilder.factory.buildAssessmentCampaign({});
        const user = databaseBuilder.factory.buildUser();

        databaseBuilder.factory.buildAssessmentFromParticipation({
          participantExternalId: 'The bad',
          campaignId: campaign.id,
          status: STARTED,
          userId: user.id,
          isImproved: true,
        });

        databaseBuilder.factory.buildAssessmentFromParticipation({
          participantExternalId: 'The good',
          campaignId: campaign.id,
          status: STARTED,
          userId: user.id,
          isImproved: false,
        });

        await databaseBuilder.commit();

        //when
        const { campaignParticipantsActivities } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id });

        //then
        expect(campaignParticipantsActivities).to.have.lengthOf(1);
        expect(campaignParticipantsActivities[0].participantExternalId).to.equal('The good');
      });
    });

    context('when the campaign is assessment', function () {
      context('When there are several assessments for the same participant', function () {
        beforeEach(async function () {
          campaign = databaseBuilder.factory.buildAssessmentCampaign({});
          const user = databaseBuilder.factory.buildUser();
          databaseBuilder.factory.buildCampaignParticipation({
            campaignId: campaign.id,
            status: STARTED,
            userId: user.id,
          });

          await databaseBuilder.commit();
        });

        it('Returns one CampaignParticipantActivity with the most recent assessment', async function () {
          const { campaignParticipantsActivities } =
            await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
          const statuses = campaignParticipantsActivities.map((activity) => activity.status);

          expect(statuses).to.have.lengthOf(1);
          expect(statuses).to.exactlyContain([STARTED]);
        });
      });
    });

    context('when the campaign is profile collection', function () {
      context('when the participation is shared', function () {
        it('should return status shared', async function () {
          campaign = databaseBuilder.factory.buildCampaign({ type: Campaign.types.PROFILES_COLLECTION });
          databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id });
          await databaseBuilder.commit();

          const { campaignParticipantsActivities } =
            await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
          expect(campaignParticipantsActivities[0].status).to.equal(SHARED);
        });
      });

      context('when the participation is not shared', function () {
        it('should return status to share', async function () {
          campaign = databaseBuilder.factory.buildCampaign({ type: Campaign.types.PROFILES_COLLECTION });
          databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id, status: TO_SHARE });
          await databaseBuilder.commit();

          const { campaignParticipantsActivities } =
            await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
          expect(campaignParticipantsActivities[0].status).to.equal(TO_SHARE);
        });
      });
    });

    context('order', function () {
      it('should return participants activities ordered by last name then first name asc (including schooling registration data)', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        campaign = databaseBuilder.factory.buildAssessmentCampaign({ organizationId });
        const campaignParticipation = { campaignId: campaign.id };
        databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration(
          { firstName: 'Jaja', lastName: 'Le raplapla', organizationId },
          campaignParticipation,
          true
        );
        databaseBuilder.factory.buildCampaignParticipationWithUser(
          { firstName: 'jiji', lastName: 'Le riquiqui', organizationId },
          campaignParticipation,
          true
        );
        databaseBuilder.factory.buildCampaignParticipationWithUser(
          { firstName: 'Jojo', lastName: 'Le rococo', organizationId },
          campaignParticipation,
          true
        );
        databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration(
          { firstName: 'Juju', lastName: 'Le riquiqui', organizationId },
          campaignParticipation,
          true
        );

        await databaseBuilder.commit();

        // when
        const { campaignParticipantsActivities } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
        const names = campaignParticipantsActivities.map((result) => result.firstName);

        // then
        expect(names).exactlyContainInOrder(['Jaja', 'jiji', 'Juju', 'Jojo']);
      });
    });

    context('when there is a filter on division', function () {
      it('returns participants which have the correct division', async function () {
        campaign = databaseBuilder.factory.buildAssessmentCampaign({});

        databaseBuilder.factory.buildAssessmentFromParticipation(
          { participantExternalId: 'The good', campaignId: campaign.id },
          { id: 1 }
        );
        databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: campaign.organizationId,
          userId: 1,
          division: 'Good Guys Team',
        });

        databaseBuilder.factory.buildAssessmentFromParticipation(
          { participantExternalId: 'The bad', campaignId: campaign.id },
          { id: 2 }
        );
        databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: campaign.organizationId,
          userId: 2,
          division: 'Bad Guys Team',
        });

        databaseBuilder.factory.buildAssessmentFromParticipation(
          { participantExternalId: 'The ugly', campaignId: campaign.id },
          { id: 3 }
        );
        databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: campaign.organizationId,
          userId: 3,
          division: 'Ugly Guys Team',
        });

        await databaseBuilder.commit();

        // when
        const { campaignParticipantsActivities, pagination } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
            filters: { divisions: ['Good Guys Team', 'Ugly Guys Team'] },
          });

        const participantExternalIds = campaignParticipantsActivities.map((result) => result.participantExternalId);

        // then
        expect(participantExternalIds).to.exactlyContain(['The good', 'The ugly']);
        expect(pagination.rowCount).to.equal(2);
      });
    });

    context('when there is a filter on status', function () {
      it('returns participants which have the correct status', async function () {
        campaign = databaseBuilder.factory.buildAssessmentCampaign({});

        databaseBuilder.factory.buildAssessmentFromParticipation(
          { participantExternalId: 'The good', campaignId: campaign.id, status: STARTED },
          { id: 1 }
        );
        databaseBuilder.factory.buildSchoolingRegistration({ organizationId: campaign.organizationId, userId: 1 });

        databaseBuilder.factory.buildAssessmentFromParticipation(
          { participantExternalId: 'The bad', campaignId: campaign.id, status: TO_SHARE },
          { id: 2 }
        );
        databaseBuilder.factory.buildSchoolingRegistration({ organizationId: campaign.organizationId, userId: 2 });

        await databaseBuilder.commit();

        // when
        const { campaignParticipantsActivities, pagination } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
            filters: { status: STARTED },
          });

        const participantExternalIds = campaignParticipantsActivities.map((result) => result.participantExternalId);

        // then
        expect(participantExternalIds).to.exactlyContain(['The good']);
        expect(pagination.rowCount).to.equal(1);
      });
    });

    context('when there is a filter on group', function () {
      it('returns participants which have the correct group', async function () {
        campaign = databaseBuilder.factory.buildAssessmentCampaign({});

        databaseBuilder.factory.buildAssessmentFromParticipation(
          { participantExternalId: 'The good', campaignId: campaign.id },
          { id: 1 }
        );
        databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: campaign.organizationId,
          userId: 1,
          group: 'L1',
        });

        databaseBuilder.factory.buildAssessmentFromParticipation(
          { participantExternalId: 'The bad', campaignId: campaign.id, status: 'STARTED' },
          { id: 2 }
        );
        databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: campaign.organizationId,
          userId: 2,
          group: 'T1',
        });
        databaseBuilder.factory.buildAssessmentFromParticipation(
          { participantExternalId: 'The ugly', campaignId: campaign.id, status: 'STARTED' },
          { id: 3 }
        );
        databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: campaign.organizationId,
          userId: 3,
          group: 'T2',
        });

        await databaseBuilder.commit();

        // when
        const { campaignParticipantsActivities, pagination } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
            filters: { groups: ['L1', 'T2'] },
          });

        const participantExternalIds = campaignParticipantsActivities.map((result) => result.participantExternalId);

        // then
        expect(participantExternalIds).to.exactlyContain(['The good', 'The ugly']);
        expect(pagination.rowCount).to.equal(2);
      });
    });

    context('pagination', function () {
      beforeEach(async function () {
        campaign = databaseBuilder.factory.buildAssessmentCampaign({});

        const participation = { campaignId: campaign.id };
        databaseBuilder.factory.buildAssessmentFromParticipation(participation);
        databaseBuilder.factory.buildAssessmentFromParticipation(participation);

        await databaseBuilder.commit();
      });

      it('should return paginated campaign participations based on the given size and number', async function () {
        const page = { size: 1, number: 1 };

        const { campaignParticipantsActivities, pagination } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id, page });

        expect(campaignParticipantsActivities).to.have.lengthOf(1);
        expect(pagination).to.deep.equals({ page: 1, pageCount: 2, pageSize: 1, rowCount: 2 });
      });

      context('default pagination', function () {
        it('should return a page size of 25', async function () {
          const { pagination } = await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
          });

          expect(pagination.pageSize).to.equals(25);
        });
      });

      context('when there are zero rows', function () {
        beforeEach(async function () {
          campaign = databaseBuilder.factory.buildAssessmentCampaign({});

          await databaseBuilder.commit();
        });

        it('should return the first page with 0 elements', async function () {
          const { campaignParticipantsActivities, pagination } =
            await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id });

          expect(campaignParticipantsActivities).to.have.lengthOf(0);
          expect(pagination).to.deep.equals({ page: 1, pageCount: 0, pageSize: 25, rowCount: 0 });
        });
      });
    });
  });
});
