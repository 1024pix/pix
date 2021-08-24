const { expect } = require('../../../test-helper');
const Assessment = require('../../../../lib/domain/models/Assessment');
const CampaignAssessmentParticipation = require('../../../../lib/domain/read-models/CampaignAssessmentParticipation');

describe('Unit | Domain | Models | CampaignAssessmentParticipation', function() {
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

          expect(campaignAssessmentParticipation.progression).equal(0.25);
        });

        it('should compute a progression accordingly with rounded value', function() {
          const targetedSkillsCount = 30;
          const testedSkillsCount = 10;
          const campaignAssessmentParticipation = new CampaignAssessmentParticipation({
            state: Assessment.states.STARTED,
            testedSkillsCount,
            targetedSkillsCount,
          });

          expect(campaignAssessmentParticipation.progression).equal(0.33);
        });
      });
    });

    context('when state is COMPLETED', function() {
      it('should return 100', function() {
        const campaignAssessmentParticipation = new CampaignAssessmentParticipation({
          assessmentState: Assessment.states.COMPLETED,
        });

        expect(campaignAssessmentParticipation.progression).equal(1);
      });
    });
  });
});
