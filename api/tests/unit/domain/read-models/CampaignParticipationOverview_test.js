import { CampaignParticipationOverview } from '../../../../lib/domain/read-models/CampaignParticipationOverview.js';
import { CampaignParticipationStatuses } from '../../../../src/prescription/shared/domain/constants.js';
import { expect, domainBuilder, sinon } from '../../../test-helper.js';
import { config } from '../../../../lib/config.js';

const { SHARED } = CampaignParticipationStatuses;

describe('Unit | Domain | Read-Models | CampaignParticipationOverview', function () {
  describe('constructor', function () {
    it('should create CampaignParticipationOverview', function () {
      // when
      const stageCollection = domainBuilder.buildStageCollectionForUserCampaignResults({ campaignId: 3, stages: [] });
      const campaignParticipationOverview = new CampaignParticipationOverview({
        id: 3,
        createdAt: new Date('2020-02-15T15:00:34Z'),
        status: SHARED,
        sharedAt: new Date('2020-03-15T15:00:34Z'),
        stageCollection,
        organizationName: 'Pix',
        campaignCode: 'campaignCode',
        campaignTitle: 'campaignTitle',
        masteryRate: 0.5,
      });

      // then
      expect(campaignParticipationOverview.id).to.equal(3);
      expect(campaignParticipationOverview.createdAt).to.deep.equal(new Date('2020-02-15T15:00:34Z'));
      expect(campaignParticipationOverview.sharedAt).to.deep.equal(new Date('2020-03-15T15:00:34Z'));
      expect(campaignParticipationOverview.isShared).to.be.true;
      expect(campaignParticipationOverview.organizationName).to.equal('Pix');
      expect(campaignParticipationOverview.status).to.equal(SHARED);
      expect(campaignParticipationOverview.campaignCode).to.equal('campaignCode');
      expect(campaignParticipationOverview.campaignTitle).to.equal('campaignTitle');
      expect(campaignParticipationOverview.masteryRate).to.equal(0.5);
    });

    describe('when the campaign is an autonomous course', function () {
      it('should return Pix as organization name', function () {
        // given
        sinon.stub(config.autonomousCourse, 'autonomousCoursesOrganizationId').value(777);
        const campaignParticipationOverview = new CampaignParticipationOverview({
          organizationName: 'Other organization name',
          organizationId: 777,
        });

        // when / then
        expect(campaignParticipationOverview.organizationName).to.equal('Pix');
      });
    });

    describe('masteryRate', function () {
      context('when the masteryRate is undefined', function () {
        it('should return null for the masteryRate', function () {
          // when
          const stageCollection = domainBuilder.buildStageCollectionForUserCampaignResults({
            campaignId: 3,
            stages: [],
          });
          const campaignParticipationOverview = new CampaignParticipationOverview({
            stageCollection,
            masteryRate: undefined,
          });

          // then
          expect(campaignParticipationOverview.masteryRate).to.equal(null);
        });
      });
      context('when the masteryRate is null', function () {
        it('should return null for the masteryRate', function () {
          // when
          const stageCollection = domainBuilder.buildStageCollectionForUserCampaignResults({
            campaignId: 3,
            stages: [],
          });
          const campaignParticipationOverview = new CampaignParticipationOverview({
            stageCollection,
            masteryRate: null,
          });

          // then
          expect(campaignParticipationOverview.masteryRate).to.equal(null);
        });
      });

      context('when the masteryRate equals to 0', function () {
        it('should return 0 for the masteryRate', function () {
          // when
          const stageCollection = domainBuilder.buildStageCollectionForUserCampaignResults({
            campaignId: 3,
            stages: [],
          });
          const campaignParticipationOverview = new CampaignParticipationOverview({
            stageCollection,
            masteryRate: 0,
          });

          // then
          expect(campaignParticipationOverview.masteryRate).to.equal(0);
        });
      });

      context('when the masteryRate is a string', function () {
        it('should return the number for the masteryRate', function () {
          // when
          const stageCollection = domainBuilder.buildStageCollectionForUserCampaignResults({
            campaignId: 3,
            stages: [],
          });
          const campaignParticipationOverview = new CampaignParticipationOverview({
            stageCollection,
            masteryRate: '0.75',
          });

          // then
          expect(campaignParticipationOverview.masteryRate).to.equal(0.75);
        });
      });
    });
  });
});
