const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');
const { expect, domainBuilder, sinon, catchErr } = require('../../../test-helper');
const Campaign = require('../../../../lib/domain/models/Campaign');
const Assessment = require('../../../../lib/domain/models/Assessment');
const { ArchivedCampaignError, AssessmentNotCompletedError, AlreadySharedCampaignParticipationError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Models | CampaignParticipation', () => {

  describe('#getTargetProfileId', () => {

    it('should return the targetProfileId from campaign associated', () => {
      // given
      const campaign = domainBuilder.buildCampaign.ofTypeAssessment();
      const campaignParticipation = new CampaignParticipation({
        id: 1,
        campaign,
        assessmentId: 1,
      });

      // when
      const targetProfileId = campaignParticipation.getTargetProfileId();

      // then
      expect(targetProfileId).to.equal(campaign.targetProfile.id);
    });

    it('should return null if has not campaign', () => {
      // given
      const campaignParticipation = new CampaignParticipation({
        id: 1,
        campaign: null,
        assessmentId: 1,
      });

      // when
      const targetProfileId = campaignParticipation.getTargetProfileId();

      // then
      expect(targetProfileId).to.equal(null);
    });

  });

  describe('lastAssessment', () => {

    it('should retrieve the last assessment by creation date', () => {
      const campaignParticipation = new CampaignParticipation({
        assessments: [
          { createdAt: new Date('2010-10-02') },
          { createdAt: new Date('2010-10-06') },
          { createdAt: new Date('2010-10-04') },
        ],
      });
      expect(campaignParticipation.lastAssessment)
        .to.deep.equal({ createdAt: new Date('2010-10-06') });
    });

  });

  describe('share', () => {

    context('when the campaign is not archived', () => {
      let clock;
      const now = new Date('2021-09-25');

      beforeEach(() => {
        clock = sinon.useFakeTimers(now.getTime());
      });

      afterEach(() => {
        clock.restore();
      });

      context('when the campaign is already shared', () => {
        it('throws an AlreadySharedCampaignParticipationError error', async () => {
          const campaign = domainBuilder.buildCampaign({ type: Campaign.types.PROFILES_COLLECTION });
          const campaignParticipation = new CampaignParticipation({ campaign, isShared: true });

          const error = await catchErr(campaignParticipation.share, campaignParticipation)();

          expect(error).to.be.an.instanceOf(AlreadySharedCampaignParticipationError);
        });
      });

      context('when the campaign as the type PROFILES_COLLECTION', () => {
        it('share the CampaignParticipation', () => {
          const campaign = domainBuilder.buildCampaign({ type: Campaign.types.PROFILES_COLLECTION });
          const campaignParticipation = new CampaignParticipation({ campaign });

          campaignParticipation.share();

          expect(campaignParticipation.isShared).to.be.true;
          expect(campaignParticipation.sharedAt).to.deep.equals(now);
        });
      });

      context('when the campaign as the type ASSESSMENT', () => {
        context('when there is no assessment', () => {
          it('throws an AssessmentNotCompletedError', async () => {
            const campaign = domainBuilder.buildCampaign({ type: Campaign.types.ASSESSMENT });
            const campaignParticipation = new CampaignParticipation({ campaign, assessments: [] });

            const error = await catchErr(campaignParticipation.share, campaignParticipation)();

            expect(error).to.be.an.instanceOf(AssessmentNotCompletedError);
          });
        });

        context('when the last assessment is not completed', () => {

          it('throws an AssessmentNotCompletedError', async () => {
            const campaign = domainBuilder.buildCampaign({ type: Campaign.types.ASSESSMENT });
            const assessments = [
              domainBuilder.buildAssessment({ createdAt: new Date('2020-01-01'), state: Assessment.states.COMPLETED }),
              domainBuilder.buildAssessment({ createdAt: new Date('2020-01-02'), state: Assessment.states.STARTED }),
            ];
            const campaignParticipation = new CampaignParticipation({ campaign, assessments });

            const error = await catchErr(campaignParticipation.share, campaignParticipation)();

            expect(error).to.be.an.instanceOf(AssessmentNotCompletedError);
          });
        });

        context('when the last assessment is completed', () => {

          it('share the CampaignParticipation', () => {
            const campaign = domainBuilder.buildCampaign({ type: Campaign.types.ASSESSMENT });
            const assessments = [
              domainBuilder.buildAssessment({ createdAt: new Date('2020-03-01'), state: Assessment.states.COMPLETED }),
              domainBuilder.buildAssessment({ createdAt: new Date('2020-01-01'), state: Assessment.states.STARTED }),
            ];
            const campaignParticipation = new CampaignParticipation({ campaign, assessments });

            campaignParticipation.share();

            expect(campaignParticipation.isShared).to.be.true;
            expect(campaignParticipation.sharedAt).to.deep.equals(now);
          });
        });
      });
    });

    context('when the campaign is archived', () => {
      it('throws an ArchivedCampaignError error', async () => {
        const campaign = domainBuilder.buildCampaign({ archivedAt: new Date() });
        const campaignParticipation = new CampaignParticipation({ campaign });

        const error = await catchErr(campaignParticipation.share, campaignParticipation)();

        expect(error).to.be.an.instanceOf(ArchivedCampaignError);
        expect(error.message).to.equals('Cannot share results on an archived campaign.');
      });
    });
  });

  describe('canComputeValidatedSkillsCount', () => {
    context('when the campaign as the type PROFILES_COLLECTION', () => {
      it('returns false', () => {
        const campaign = domainBuilder.buildCampaign({ type: Campaign.types.PROFILES_COLLECTION });
        const campaignParticipation = new CampaignParticipation({ campaign });

        const canComputeValidatedSkillsCount = campaignParticipation.canComputeValidatedSkillsCount();

        expect(canComputeValidatedSkillsCount).to.be.false;
      });
    });

    context('when the campaign as the type ASSESSMENT', () => {
      it('returns true', () => {
        const campaign = domainBuilder.buildCampaign({ type: Campaign.types.ASSESSMENT });
        const campaignParticipation = new CampaignParticipation({ campaign });

        const canComputeValidatedSkillsCount = campaignParticipation.canComputeValidatedSkillsCount();

        expect(canComputeValidatedSkillsCount).to.be.true;
      });
    });
  });
});
