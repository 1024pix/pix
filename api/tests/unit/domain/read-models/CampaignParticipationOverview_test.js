const CampaignParticipationOverview = require('../../../../lib/domain/read-models/CampaignParticipationOverview');
const CampaignParticipationStatuses = require('../../../../lib/domain/models/CampaignParticipationStatuses');
const { expect, domainBuilder } = require('../../../test-helper');

const { SHARED, STARTED } = CampaignParticipationStatuses;

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
      expect(campaignParticipationOverview.stageCollection).to.deep.equal(stageCollection);
      expect(campaignParticipationOverview.organizationName).to.equal('Pix');
      expect(campaignParticipationOverview.status).to.equal(SHARED);
      expect(campaignParticipationOverview.campaignCode).to.equal('campaignCode');
      expect(campaignParticipationOverview.campaignTitle).to.equal('campaignTitle');
      expect(campaignParticipationOverview.masteryRate).to.equal(0.5);
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

  describe('#validatedStagesCount', function () {
    context('when the participation is shared', function () {
      context('when the campaign has stages', function () {
        it('should return validated stages count', function () {
          const stageCollection = domainBuilder.buildStageCollectionForUserCampaignResults({
            campaignId: 3,
            stages: [
              {
                threshold: 0,
              },
              {
                threshold: 10,
              },
              {
                threshold: 30,
              },
              {
                threshold: 70,
              },
            ],
          });
          const campaignParticipationOverview = new CampaignParticipationOverview({
            status: SHARED,
            validatedSkillsCount: 1,
            stageCollection,
            masteryRate: '0.5',
          });

          expect(campaignParticipationOverview.validatedStagesCount).to.equal(3);
        });
      });

      context("when the campaign doesn't have stages", function () {
        it('should return null', function () {
          const stageCollection = domainBuilder.buildStageCollectionForUserCampaignResults({
            campaignId: 3,
            stages: [],
          });
          const campaignParticipationOverview = new CampaignParticipationOverview({
            status: SHARED,
            validatedSkillsCount: 2,
            totalSkillsCount: 3,
            stageCollection,
          });

          expect(campaignParticipationOverview.validatedStagesCount).to.equal(null);
        });
      });
    });

    context('when the participation is not shared', function () {
      it('should return null', function () {
        const stageCollection = domainBuilder.buildStageCollectionForUserCampaignResults({
          campaignId: 3,
          stages: [
            {
              threshold: 0,
            },
            {
              threshold: 10,
            },
            {
              threshold: 30,
            },
            {
              threshold: 70,
            },
          ],
        });
        const campaignParticipationOverview = new CampaignParticipationOverview({
          status: STARTED,
          validatedSkillsCount: 2,
          totalSkillsCount: 3,
          stageCollection,
        });

        expect(campaignParticipationOverview.validatedStagesCount).to.equal(null);
      });
    });
  });

  describe('#totalStagesCount', function () {
    context('the campaign has stages', function () {
      it('should return the count of stages with a threshold over 0', function () {
        const stageCollection = domainBuilder.buildStageCollectionForUserCampaignResults({
          campaignId: 3,
          stages: [
            {
              threshold: 0,
            },
            {
              threshold: 3,
            },
            {
              threshold: 5,
            },
            {
              threshold: 8,
            },
            {
              threshold: 11,
            },
            {
              threshold: 14,
            },
          ],
        });
        const campaignParticipationOverview = new CampaignParticipationOverview({
          status: SHARED,
          stageCollection,
        });

        expect(campaignParticipationOverview.totalStagesCount).to.equal(6);
      });
    });

    context("campaign doesn't have stages", function () {
      it('should return 0', function () {
        const stageCollection = domainBuilder.buildStageCollectionForUserCampaignResults({
          campaignId: 3,
          stages: [],
        });
        const campaignParticipationOverview = new CampaignParticipationOverview({
          status: SHARED,
          stageCollection,
        });

        expect(campaignParticipationOverview.totalStagesCount).to.equal(0);
      });
    });
  });
});
