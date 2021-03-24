const { expect } = require('../../../test-helper');
const Assessment = require('../../../../lib/domain/models/Assessment');
const CampaignAssessmentParticipation = require('../../../../lib/domain/read-models/CampaignAssessmentParticipation');

describe('Unit | Domain | Models | CampaignAssessmentParticipation', function() {

  describe('#validatedSkillsCount', function() {
    context('when status is SHARED', function() {
      it('should compute a validatedSkillsCount of 0', function() {
        const campaignAssessmentParticipation = new CampaignAssessmentParticipation({
          validatedSkillsCount: 0,
          isShared: true,
        });

        expect(campaignAssessmentParticipation.validatedSkillsCount).equal(0);
      });

      it('should compute a validatedSkillsCount of 7', function() {
        const campaignAssessmentParticipation = new CampaignAssessmentParticipation({
          validatedSkillsCount: 7,
          isShared: true,
        });

        expect(campaignAssessmentParticipation.validatedSkillsCount).equal(7);
      });
    });

    context('when status is not SHARED', function() {
      it('should compute a validatedSkillsCount of 7', function() {
        const campaignAssessmentParticipation = new CampaignAssessmentParticipation({
          validatedSkillsCount: 7,
          isShared: false,
        });

        expect(campaignAssessmentParticipation.validatedSkillsCount).equal(undefined);
      });
    });
  });

  describe('#masteryPercentage', function() {

    context('when status is SHARED', function() {
      context('when there are no skills in target profile', function() {
        it('should compute a masteryPercentage of 0', function() {
          const targetedSkillsCount = 0;
          const campaignAssessmentParticipation = new CampaignAssessmentParticipation({
            targetedSkillsCount,
            validatedSkillsCount: 'anything',
            isShared: true,
          });

          expect(campaignAssessmentParticipation.masteryPercentage).equal(0);
        });
      });

      context('when there are skills in target profile', function() {
        it('should compute a masteryPercentage accordingly', function() {
          const targetedSkillsCount = 40;
          const validatedSkillsCount = 10;
          const campaignAssessmentParticipation = new CampaignAssessmentParticipation({
            targetedSkillsCount,
            validatedSkillsCount,
            isShared: true,
          });

          expect(campaignAssessmentParticipation.masteryPercentage).equal(25);
        });

        it('should compute a masteryPercentage accordingly with rounded value', function() {
          const targetedSkillsCount = 30;
          const validatedSkillsCount = 10;
          const campaignAssessmentParticipation = new CampaignAssessmentParticipation({
            targetedSkillsCount,
            validatedSkillsCount,
            isShared: true,
          });

          expect(campaignAssessmentParticipation.masteryPercentage).equal(33);
        });
      });
    });

    context('when status is not SHARED', function() {
      it('should return undefined', function() {
        const campaignAssessmentParticipation = new CampaignAssessmentParticipation({
          targetedSkillsCount: 1,
          validatedSkillsCount: 1,
          isShared: false,
        });

        expect(campaignAssessmentParticipation.masteryPercentage).equal(undefined);
      });
    });
  });

  describe('#progression', function() {

    context('when state is STARTED', function() {
      context('when testedSkillsCount = 0', function() {
        it('should compute a progression of 0', function() {
          const testedSkillsCount = 0;
          const campaignAssessmentParticipation = new CampaignAssessmentParticipation({
            state: Assessment.states.STARTED,
            testedSkillsCount,
            targetedSkillsCount: 10,
          });

          expect(campaignAssessmentParticipation.progression).equal(0);
        });
      });

      context('when testedSkillsCount != 0', function() {
        it('should compute a progression accordingly', function() {
          const targetedSkillsCount = 40;
          const testedSkillsCount = 10;
          const campaignAssessmentParticipation = new CampaignAssessmentParticipation({
            state: Assessment.states.STARTED,
            testedSkillsCount,
            targetedSkillsCount,
          });

          expect(campaignAssessmentParticipation.progression).equal(25);
        });

        it('should compute a progression accordingly with rounded value', function() {
          const targetedSkillsCount = 30;
          const testedSkillsCount = 10;
          const campaignAssessmentParticipation = new CampaignAssessmentParticipation({
            state: Assessment.states.STARTED,
            testedSkillsCount,
            targetedSkillsCount,
          });

          expect(campaignAssessmentParticipation.progression).equal(33);
        });
      });
    });

    context('when state is COMPLETED', function() {
      it('should return 100', function() {
        const campaignAssessmentParticipation = new CampaignAssessmentParticipation({
          assessmentState: Assessment.states.COMPLETED,
        });

        expect(campaignAssessmentParticipation.progression).equal(100);
      });
    });
  });
});
