import dayjs from 'dayjs';

import { CampaignParticipationStatuses, CampaignTypes } from '../../../../src/prescription/shared/domain/constants.js';
import { CampaignParticipationOverview } from '../../../../src/prescription/shared/domain/read-models/CampaignParticipationOverview.js';
import { domainBuilder, expect, sinon } from '../../../test-helper.js';

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
        campaignName: 'campaignName',
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
      expect(campaignParticipationOverview.campaignName).to.equal('campaignName');
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

  describe('#computeCanRetry', function () {
    let clock;
    const now = new Date('2023-01-15');

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('should return true when all conditions are met', function () {
      // given
      const campaignParticipationOverview = domainBuilder.buildCampaignParticipationOverview({
        status: SHARED,
        sharedAt: dayjs(now).subtract(5, 'days').toDate(),
        masteryRate: 0.8,
        isCampaignMultipleSendings: true,
        isOrganizationLearnerActive: true,
        campaignType: CampaignTypes.ASSESSMENT,
        campaignArchivedAt: null,
        deletedAt: null,
      });

      // when
      const result = campaignParticipationOverview.computeCanRetry();

      // then
      expect(result).to.be.true;
    });

    it('should return false when organization learner is not active', function () {
      // given
      const campaignParticipationOverview = domainBuilder.buildCampaignParticipationOverview({
        status: SHARED,
        sharedAt: dayjs(now).subtract(5, 'days').toDate(),
        masteryRate: 0.8,
        isCampaignMultipleSendings: true,
        isOrganizationLearnerDisabled: true,
        campaignType: CampaignTypes.ASSESSMENT,
        campaignArchivedAt: null,
        deletedAt: null,
      });

      // when
      const result = campaignParticipationOverview.computeCanRetry();

      // then
      expect(result).to.be.false;
    });

    it('should return false when campaign participation is disabled (archived)', function () {
      // given
      const campaignParticipationOverview = domainBuilder.buildCampaignParticipationOverview({
        status: SHARED,
        sharedAt: dayjs(now).subtract(5, 'days').toDate(),
        masteryRate: 0.8,
        isCampaignMultipleSendings: true,
        isOrganizationLearnerActive: true,
        campaignType: CampaignTypes.ASSESSMENT,
        campaignArchivedAt: dayjs(now).subtract(1, 'day').toDate(),
        deletedAt: null,
      });

      // when
      const result = campaignParticipationOverview.computeCanRetry();

      // then
      expect(result).to.be.false;
    });

    it('should return false when campaign participation is disabled (deleted)', function () {
      // given
      const campaignParticipationOverview = domainBuilder.buildCampaignParticipationOverview({
        status: SHARED,
        sharedAt: dayjs(now).subtract(5, 'days').toDate(),
        masteryRate: 0.8,
        isCampaignMultipleSendings: true,
        isOrganizationLearnerActive: true,
        campaignType: CampaignTypes.ASSESSMENT,
        campaignArchivedAt: null,
        deletedAt: dayjs(now).subtract(1, 'day').toDate(),
      });

      // when
      const result = campaignParticipationOverview.computeCanRetry();

      // then
      expect(result).to.be.false;
    });

    it('should return false when campaign does not allow multiple sendings', function () {
      // given
      const campaignParticipationOverview = domainBuilder.buildCampaignParticipationOverview({
        status: SHARED,
        sharedAt: dayjs(now).subtract(5, 'days').toDate(),
        masteryRate: 0.8,
        isCampaignMultipleSendings: false,
        isOrganizationLearnerActive: true,
        campaignType: CampaignTypes.ASSESSMENT,
        campaignArchivedAt: null,
        deletedAt: null,
      });

      // when
      const result = campaignParticipationOverview.computeCanRetry();

      // then
      expect(result).to.be.false;
    });

    it('should return false when participation is not shared', function () {
      // given
      const campaignParticipationOverview = domainBuilder.buildCampaignParticipationOverview({
        status: STARTED,
        sharedAt: null,
        masteryRate: 0.8,
        isCampaignMultipleSendings: true,
        isOrganizationLearnerActive: true,
        campaignType: CampaignTypes.ASSESSMENT,
        campaignArchivedAt: null,
        deletedAt: null,
      });

      // when
      const result = campaignParticipationOverview.computeCanRetry();

      // then
      expect(result).to.be.false;
    });

    it('should return false when minimum delay before retrying has not passed', function () {
      // given
      const campaignParticipationOverview = domainBuilder.buildCampaignParticipationOverview({
        status: SHARED,
        sharedAt: dayjs(now).subtract(3, 'days').toDate(), // Less than 4 days
        masteryRate: 0.8,
        isCampaignMultipleSendings: true,
        isOrganizationLearnerActive: true,
        campaignType: CampaignTypes.ASSESSMENT,
        campaignArchivedAt: null,
        deletedAt: null,
      });

      // when
      const result = campaignParticipationOverview.computeCanRetry();

      // then
      expect(result).to.be.false;
    });

    it('should return false when mastery rate is 100% and campaign type is ASSESSMENT', function () {
      // given
      const campaignParticipationOverview = domainBuilder.buildCampaignParticipationOverview({
        status: SHARED,
        sharedAt: dayjs(now).subtract(5, 'days').toDate(),
        masteryRate: 1.0, // 100%
        isCampaignMultipleSendings: true,
        isOrganizationLearnerActive: true,
        campaignType: CampaignTypes.ASSESSMENT,
        campaignArchivedAt: null,
        deletedAt: null,
      });

      // when
      const result = campaignParticipationOverview.computeCanRetry();

      // then
      expect(result).to.be.false;
    });

    it('should return true when mastery rate is 100% but campaign type is EXAM', function () {
      // given
      const campaignParticipationOverview = domainBuilder.buildCampaignParticipationOverview({
        status: SHARED,
        sharedAt: dayjs(now).subtract(5, 'days').toDate(),
        masteryRate: 1.0, // 100%
        isCampaignMultipleSendings: true,
        isOrganizationLearnerActive: true,
        campaignType: CampaignTypes.EXAM,
        campaignArchivedAt: null,
        deletedAt: null,
      });

      // when
      const result = campaignParticipationOverview.computeCanRetry();

      // then
      expect(result).to.be.true;
    });

    it('should return false when sharedAt is null', function () {
      // given
      const campaignParticipationOverview = domainBuilder.buildCampaignParticipationOverview({
        status: SHARED,
        sharedAt: null,
        masteryRate: 0.8,
        isCampaignMultipleSendings: true,
        isOrganizationLearnerActive: true,
        campaignType: CampaignTypes.ASSESSMENT,
        campaignArchivedAt: null,
        deletedAt: null,
      });

      // when
      const result = campaignParticipationOverview.computeCanRetry();

      // then
      expect(result).to.be.false;
    });
  });

  describe('#_timeBeforeRetryingPassed', function () {
    let clock;
    const now = new Date('2023-01-15');

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('should return true when delay has passed', function () {
      // given
      const campaignParticipationOverview = domainBuilder.buildCampaignParticipationOverview();
      const sharedAt = dayjs(now).subtract(5, 'days').toDate();

      // when
      const result = campaignParticipationOverview._timeBeforeRetryingPassed(sharedAt);

      // then
      expect(result).to.be.true;
    });

    it('should return false when delay has not passed', function () {
      // given
      const campaignParticipationOverview = domainBuilder.buildCampaignParticipationOverview();
      const sharedAt = dayjs(now).subtract(3, 'days').toDate(); // Less than 4 days

      // when
      const result = campaignParticipationOverview._timeBeforeRetryingPassed(sharedAt);

      // then
      expect(result).to.be.false;
    });

    it('should return false when sharedAt is null', function () {
      // given
      const campaignParticipationOverview = domainBuilder.buildCampaignParticipationOverview();

      // when
      const result = campaignParticipationOverview._timeBeforeRetryingPassed(null);

      // then
      expect(result).to.be.false;
    });
  });
});
