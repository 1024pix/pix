const { expect, databaseBuilder } = require('../../../test-helper');
const { campaignParticipationOverviewFactory } = databaseBuilder.factory;
const Assessment = require('../../../../lib/domain/models/Assessment');
const campaignParticipationOverviewRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-overview-repository');
const _ = require('lodash');

describe('Integration | Repository | Campaign Participation Overview', () => {
  let userId;

  beforeEach(async () => {
    userId = databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();
  });

  describe('#findByUserIdWithFilters', () => {

    context('when there is no filter', () => {

      it('retrieves information about campaign participation, campaign and organization', async () => {
        const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile();
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({ name: 'Organization ABCD' });
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ title: 'Campaign ABCD', code: 'ABCD', archivedAt: new Date('2020-01-03'), organizationId, targetProfileId });
        const { id: participationId } = databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId, createdAt: new Date('2020-01-01'), sharedAt: new Date('2020-01-02'), validatedSkillsCount: 12 });
        databaseBuilder.factory.buildAssessment({ campaignParticipationId: participationId, state: Assessment.states.STARTED });
        await databaseBuilder.commit();

        const { campaignParticipationOverviews: [campaignParticipation] } = await campaignParticipationOverviewRepository.findByUserIdWithFilters({ userId });

        expect(campaignParticipation).to.deep.equal({
          id: participationId,
          createdAt: new Date('2020-01-01'),
          sharedAt: new Date('2020-01-02'),
          isShared: true,
          campaignCode: 'ABCD',
          campaignTitle: 'Campaign ABCD',
          campaignArchivedAt: new Date('2020-01-03'),
          organizationName: 'Organization ABCD',
          assessmentState: Assessment.states.STARTED,
          validatedSkillsCount: 12,
          targetProfileId,
          totalSkillsCount: undefined,
        });
      });

      it('should retrieve all campaign participation of the user', async () => {
        const { id: participation1Id } = campaignParticipationOverviewFactory.build({ userId });
        const { id: participation2Id } = campaignParticipationOverviewFactory.build({ userId });
        campaignParticipationOverviewFactory.build();
        await databaseBuilder.commit();

        const { campaignParticipationOverviews } = await campaignParticipationOverviewRepository.findByUserIdWithFilters({ userId });
        const campaignParticipationUserIds = _.map(campaignParticipationOverviews, 'id');

        expect(campaignParticipationUserIds).to.exactlyContain([participation1Id, participation2Id]);
      });

      it('should retrieve only campaign participation that have an assessment', async () => {
        const { id: participation1Id } = campaignParticipationOverviewFactory.build({ userId });
        const { id: participation2Id } = campaignParticipationOverviewFactory.build({ userId });
        databaseBuilder.factory.buildCampaignParticipation({ userId });
        await databaseBuilder.commit();

        const { campaignParticipationOverviews } = await campaignParticipationOverviewRepository.findByUserIdWithFilters({ userId });
        const campaignParticipationUserIds = _.map(campaignParticipationOverviews, 'id');

        expect(campaignParticipationUserIds).to.exactlyContain([participation1Id, participation2Id]);
      });

      it('retrieves information about the most recent assessment of campaign participation', async () => {
        const { id: participationId } = databaseBuilder.factory.buildCampaignParticipation({ userId });
        databaseBuilder.factory.buildAssessment({ campaignParticipationId: participationId, state: Assessment.states.ABORTED, createdAt: new Date('2020-01-01') });
        databaseBuilder.factory.buildAssessment({ campaignParticipationId: participationId, state: Assessment.states.STARTED, createdAt: new Date('2020-01-02') });
        databaseBuilder.factory.buildAssessment({ campaignParticipationId: participationId, state: Assessment.states.COMPLETED, createdAt: new Date('2020-01-03') });
        await databaseBuilder.commit();

        const { campaignParticipationOverviews: [campaignParticipation] } = await campaignParticipationOverviewRepository.findByUserIdWithFilters({ userId });

        expect(campaignParticipation.assessmentState).to.equal(Assessment.states.COMPLETED);
      });

      it('retrieves pagination information', async () => {
        const { id: oldestParticipation } = campaignParticipationOverviewFactory.buildOnGoing({ userId, assessmentCreatedAt: new Date('2020-01-01') });
        campaignParticipationOverviewFactory.buildOnGoing({ userId, assessmentCreatedAt: new Date('2020-01-02') });
        await databaseBuilder.commit();
        const page = { number: 2, size: 1 };

        const {
          campaignParticipationOverviews,
          pagination,
        } = await campaignParticipationOverviewRepository.findByUserIdWithFilters({ userId, page });

        expect(campaignParticipationOverviews[0].id).to.equal(oldestParticipation);
        expect(pagination).to.deep.equal({
          page: 2,
          pageSize: 1,
          rowCount: 2,
          pageCount: 2,
        });
      });

    });

    context('when there are filters', () => {
      let onGoingParticipation;
      let toShareParticipation;
      let endedParticipation;
      let archivedParticipation;

      beforeEach(async () => {
        onGoingParticipation = campaignParticipationOverviewFactory.build({ userId, assessmentState: Assessment.states.STARTED, sharedAt: null });
        toShareParticipation = campaignParticipationOverviewFactory.build({ userId, assessmentState: Assessment.states.COMPLETED, sharedAt: null });
        endedParticipation = campaignParticipationOverviewFactory.build({ userId, sharedAt: new Date('2020-01-02') });
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ archivedAt: new Date('2020-01-02') });
        archivedParticipation = campaignParticipationOverviewFactory.build({ userId, sharedAt: null, campaignId });

        await databaseBuilder.commit();
      });

      context('the filter is ONGOING', () => {
        it('returns participation with a started assessment', async () => {
          const states = ['ONGOING'];
          const { campaignParticipationOverviews } = await campaignParticipationOverviewRepository.findByUserIdWithFilters({ userId, states });

          expect(campaignParticipationOverviews[0].id).to.equal(onGoingParticipation.id);
          expect(campaignParticipationOverviews).to.have.lengthOf(1);
        });
      });

      context('the filter is TO_SHARE', () => {
        it('returns participation with a completed assessment', async () => {
          const states = ['TO_SHARE'];
          const { campaignParticipationOverviews } = await campaignParticipationOverviewRepository.findByUserIdWithFilters({ userId, states });

          expect(campaignParticipationOverviews[0].id).to.equal(toShareParticipation.id);
          expect(campaignParticipationOverviews).to.have.lengthOf(1);
        });
      });

      context('the filter is ENDED', () => {
        it('returns shared participation', async () => {
          const states = ['ENDED'];
          const { campaignParticipationOverviews } = await campaignParticipationOverviewRepository.findByUserIdWithFilters({ userId, states });

          expect(campaignParticipationOverviews[0].id).to.equal(endedParticipation.id);
          expect(campaignParticipationOverviews).to.have.lengthOf(1);
        });
      });

      context('the filter is ARCHIVED', () => {
        it('returns participation where the campaign is archived', async () => {
          const states = ['ARCHIVED'];
          const { campaignParticipationOverviews } = await campaignParticipationOverviewRepository.findByUserIdWithFilters({ userId, states });

          expect(campaignParticipationOverviews[0].id).to.equal(archivedParticipation.id);
          expect(campaignParticipationOverviews).to.have.lengthOf(1);
        });
      });

      context('when there are several statuses given for the status filter', () => {
        it('returns only participations which matches with the given statuses', async () => {
          const states = ['ONGOING', 'TO_SHARE'];
          const { campaignParticipationOverviews } = await campaignParticipationOverviewRepository.findByUserIdWithFilters({ userId, states });

          expect(_.map(campaignParticipationOverviews, 'id')).to.exactlyContain([ onGoingParticipation.id, toShareParticipation.id]);
        });
      });
    });

    context('order', () => {
      context('when all campaign participation have different status', ()=> {
        it('orders all campaign participation by status', async () => {
          const { id: participationArchived } = campaignParticipationOverviewFactory.buildArchived({ userId });
          const { id: participationEndedId } = campaignParticipationOverviewFactory.buildEnded({ userId });
          const { id: participationOnGoingId } = campaignParticipationOverviewFactory.buildOnGoing({ userId });
          const { id: participationToShareId } = campaignParticipationOverviewFactory.buildToShare({ userId });
          await databaseBuilder.commit();

          const { campaignParticipationOverviews } = await campaignParticipationOverviewRepository.findByUserIdWithFilters({ userId });
          const campaignParticipationIds = _.map(campaignParticipationOverviews, 'id');

          expect(campaignParticipationIds).to.exactlyContainInOrder([participationToShareId, participationOnGoingId, participationEndedId, participationArchived]);
        });
      });

      context('when there are campaign participation with the same status', () => {
        it('orders all campaign participation by assessment creation date', async () => {
          const { id: oldestParticipation } = campaignParticipationOverviewFactory.buildOnGoing({ userId, assessmentCreatedAt: new Date('2020-01-01') });
          const { id: newestParticipation } = campaignParticipationOverviewFactory.buildOnGoing({ userId, assessmentCreatedAt: new Date('2020-01-02') });
          await databaseBuilder.commit();

          const { campaignParticipationOverviews } = await campaignParticipationOverviewRepository.findByUserIdWithFilters({ userId });
          const campaignParticipationIds = _.map(campaignParticipationOverviews, 'id');

          expect(campaignParticipationIds).to.exactlyContainInOrder([newestParticipation, oldestParticipation]);
        });
      });

      context('when there are several campaign participation with the status ended', () => {
        it('orders campaign participation by sharing date then assessment creation date', async () => {
          const { id: firstParticipation } = campaignParticipationOverviewFactory.buildEnded({ userId, sharedAt: new Date('2020-01-01'), assessmentCreatedAt: new Date('2020-01-04') });
          const { id: secondParticipation } = campaignParticipationOverviewFactory.buildEnded({ userId, sharedAt: new Date('2020-01-02'), assessmentCreatedAt: new Date('2020-01-02') });
          const { id: lastParticipation } = campaignParticipationOverviewFactory.buildEnded({ userId, sharedAt: new Date('2020-01-02'), assessmentCreatedAt: new Date('2020-01-03') });

          await databaseBuilder.commit();

          const { campaignParticipationOverviews } = await campaignParticipationOverviewRepository.findByUserIdWithFilters({ userId });
          const campaignParticipationIds = _.map(campaignParticipationOverviews, 'id');

          expect(campaignParticipationIds).to.exactlyContainInOrder([lastParticipation, secondParticipation, firstParticipation ]);
        });
      });

      context('when there are several campaign participation with the status archived', () => {
        it('orders campaign participation by assessment creation date', async () => {
          const { id: firstParticipation } = campaignParticipationOverviewFactory.buildArchived({ userId, sharedAt: new Date('2020-01-01'), assessmentCreatedAt: new Date('2020-01-04') });
          const { id: lastParticipation } = campaignParticipationOverviewFactory.buildArchived({ userId, sharedAt: new Date('2020-01-02'), assessmentCreatedAt: new Date('2020-01-02') });
          const { id: secondParticipation } = campaignParticipationOverviewFactory.buildArchived({ userId, sharedAt: null, assessmentCreatedAt: new Date('2020-01-03') });

          await databaseBuilder.commit();

          const { campaignParticipationOverviews } = await campaignParticipationOverviewRepository.findByUserIdWithFilters({ userId });
          const campaignParticipationIds = _.map(campaignParticipationOverviews, 'id');

          expect(campaignParticipationIds).to.exactlyContainInOrder([firstParticipation, secondParticipation, lastParticipation]);
        });
      });
    });
  });
});
