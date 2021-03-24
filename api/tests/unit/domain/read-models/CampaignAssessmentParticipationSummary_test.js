const { expect } = require('../../../test-helper');
const CampaignAssessmentParticipationSummary = require('../../../../lib/domain/read-models/CampaignAssessmentParticipationSummary');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Unit | Domain | Models | CampaignAssessmentParticipationSummary', function() {

  describe('#status', function() {
    context('when isShared is true', function() {
      it('returns SHARED as status', function() {
        const campaignAssessmentParticipationSummary = new CampaignAssessmentParticipationSummary({
          targetedSkillCount: 1,
          validatedTargetedSkillCount: 1,
          isShared: true,
        });

        expect(campaignAssessmentParticipationSummary.status).equal(CampaignAssessmentParticipationSummary.statuses.SHARED);
      });
    });

    context('when isShared is false', function() {
      context('when state is Assessment.states.COMPLETED', function() {
        it('returns SHARED as status', function() {
          const campaignAssessmentParticipationSummary = new CampaignAssessmentParticipationSummary({
            targetedSkillCount: 1,
            validatedTargetedSkillCount: 1,
            isShared: false,
            state: Assessment.states.COMPLETED,
          });

          expect(campaignAssessmentParticipationSummary.status).equal(CampaignAssessmentParticipationSummary.statuses.COMPLETED);
        });

        context('when state is Assessment.states.ONGOING', function() {
          it('returns SHARED as status', function() {
            const campaignAssessmentParticipationSummary = new CampaignAssessmentParticipationSummary({
              targetedSkillCount: 1,
              validatedTargetedSkillCount: 1,
              isShared: false,
              state: Assessment.states.ONGOING,
            });

            expect(campaignAssessmentParticipationSummary.status).equal(CampaignAssessmentParticipationSummary.statuses.ONGOING);
          });
        });
      });
    });
  });

  describe('#masteryPercentage', function() {

    context('when status is SHARED', function() {
      context('when targetedSkillCount = 0', function() {

        it('should compute a masteryPercentage of 0', function() {
          const targetedSkillCount = 0;
          const campaignAssessmentParticipationSummary = new CampaignAssessmentParticipationSummary({
            targetedSkillCount,
            validatedTargetedSkillCount: 'anything',
            isShared: true,
          });

          expect(campaignAssessmentParticipationSummary.masteryPercentage).equal(0);
        });
      });

      context('when targetedSkillCount != 0', function() {

        it('should compute a masteryPercentage accordingly', function() {
          const targetedSkillCount = 40;
          const validatedSkillCount = 10;
          const campaignAssessmentParticipationSummary = new CampaignAssessmentParticipationSummary({
            targetedSkillCount,
            validatedTargetedSkillCount: validatedSkillCount,
            isShared: true,
          });

          expect(campaignAssessmentParticipationSummary.masteryPercentage).equal(25);
        });

        it('should compute a masteryPercentage accordingly with rounded value', function() {
          const targetedSkillCount = 30;
          const validatedSkillCount = 10;
          const campaignAssessmentParticipationSummary = new CampaignAssessmentParticipationSummary({
            targetedSkillCount,
            validatedTargetedSkillCount: validatedSkillCount,
            isShared: true,
          });

          expect(campaignAssessmentParticipationSummary.masteryPercentage).equal(33);
        });
      });
    });

    context('when status is not SHARED', function() {
      it('should compute a masteryPercentage accordingly', function() {
        const campaignAssessmentParticipationSummary = new CampaignAssessmentParticipationSummary({
          status: CampaignAssessmentParticipationSummary.statuses.ONGOING,
          targetedSkillCount: 1,
          validatedTargetedSkillCount: 1,
          isShared: false,
        });

        expect(campaignAssessmentParticipationSummary.masteryPercentage).equal(undefined);
      });
    });
  });
});
