const { expect } = require('../../../test-helper');
const CampaignAssessmentParticipationSummary = require('../../../../lib/domain/read-models/CampaignAssessmentParticipationSummary');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Unit | Domain | Models | CampaignAssessmentParticipationSummary', () => {

  describe('#status', () => {
    context('when isShared is true',()   => {
      it('returns SHARED as status', () => {
        const campaignAssessmentParticipationSummary = new CampaignAssessmentParticipationSummary({
          targetedSkillCount: 1,
          validatedTargetedSkillCount: 1,
          isShared: true
        });

        expect(campaignAssessmentParticipationSummary.status).equal(CampaignAssessmentParticipationSummary.statuses.SHARED);
      });
    });

    context('when isShared is false',()   => {
      context('when state is Assessment.states.COMPLETED',()   => {
        it('returns SHARED as status', () => {
          const campaignAssessmentParticipationSummary = new CampaignAssessmentParticipationSummary({
            targetedSkillCount: 1,
            validatedTargetedSkillCount: 1,
            isShared: false,
            state: Assessment.states.COMPLETED
          });

          expect(campaignAssessmentParticipationSummary.status).equal(CampaignAssessmentParticipationSummary.statuses.COMPLETED);
        });

        context('when state is Assessment.states.ONGOING',()   => {
          it('returns SHARED as status', () => {
            const campaignAssessmentParticipationSummary = new CampaignAssessmentParticipationSummary({
              targetedSkillCount: 1,
              validatedTargetedSkillCount: 1,
              isShared: false,
              state: Assessment.states.ONGOING
            });

            expect(campaignAssessmentParticipationSummary.status).equal(CampaignAssessmentParticipationSummary.statuses.ONGOING);
          });
        });
      });
    });
  });

  describe('#masteryPercentage', () => {

    context('when status is SHARED',  () => {
      context('when targetedSkillCount = 0', () => {

        it('should compute a masteryPercentage of 0', () => {
          const targetedSkillCount = 0;
          const campaignAssessmentParticipationSummary = new CampaignAssessmentParticipationSummary({
            targetedSkillCount,
            validatedTargetedSkillCount: 'anything',
            isShared: true
          });

          expect(campaignAssessmentParticipationSummary.masteryPercentage).equal(0);
        });
      });

      context('when targetedSkillCount != 0', () => {

        it('should compute a masteryPercentage accordingly', () => {
          const targetedSkillCount = 40;
          const validatedSkillCount = 10;
          const campaignAssessmentParticipationSummary = new CampaignAssessmentParticipationSummary({
            targetedSkillCount,
            validatedTargetedSkillCount: validatedSkillCount,
            isShared: true
          });

          expect(campaignAssessmentParticipationSummary.masteryPercentage).equal(25);
        });

        it('should compute a masteryPercentage accordingly with rounded value', () => {
          const targetedSkillCount = 30;
          const validatedSkillCount = 10;
          const campaignAssessmentParticipationSummary = new CampaignAssessmentParticipationSummary({
            targetedSkillCount,
            validatedTargetedSkillCount: validatedSkillCount,
            isShared: true
          });

          expect(campaignAssessmentParticipationSummary.masteryPercentage).equal(33);
        });
      });
    });

    context('when status is not SHARED',  () => {
      it('should compute a masteryPercentage accordingly', () => {
        const campaignAssessmentParticipationSummary = new CampaignAssessmentParticipationSummary({
          status: CampaignAssessmentParticipationSummary.statuses.ONGOING,
          targetedSkillCount: 1,
          validatedTargetedSkillCount: 1,
          isShared: false
        });

        expect(campaignAssessmentParticipationSummary.masteryPercentage).equal(undefined);
      });
    });
  });
});
