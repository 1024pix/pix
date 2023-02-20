import { expect } from '../../../test-helper';
import Assessment from '../../../../lib/domain/models/Assessment';
import CampaignAssessmentParticipation from '../../../../lib/domain/read-models/CampaignAssessmentParticipation';

describe('Unit | Domain | Models | CampaignAssessmentParticipation', function () {
  describe('#progression', function () {
    context('when state is STARTED', function () {
      context('when testedSkillsCount = 0', function () {
        it('should compute a progression of 0', function () {
          const testedSkillsCount = 0;
          const campaignAssessmentParticipation = new CampaignAssessmentParticipation({
            state: Assessment.states.STARTED,
            testedSkillsCount,
            targetedSkillsCount: 10,
          });

          expect(campaignAssessmentParticipation.progression).equal(0);
        });
      });

      context('when testedSkillsCount != 0', function () {
        it('should compute a progression accordingly', function () {
          const targetedSkillsCount = 40;
          const testedSkillsCount = 10;
          const campaignAssessmentParticipation = new CampaignAssessmentParticipation({
            state: Assessment.states.STARTED,
            testedSkillsCount,
            targetedSkillsCount,
          });

          expect(campaignAssessmentParticipation.progression).equal(0.25);
        });

        it('should compute a progression accordingly with rounded value', function () {
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

    context('when state is COMPLETED', function () {
      it('should return 100', function () {
        const campaignAssessmentParticipation = new CampaignAssessmentParticipation({
          assessmentState: Assessment.states.COMPLETED,
        });

        expect(campaignAssessmentParticipation.progression).equal(1);
      });
    });
  });
  describe('masteryRate', function () {
    context('when the masteryRate is null', function () {
      it('should return null for the masteryRate', function () {
        // when
        const campaignAssessmentParticipation = new CampaignAssessmentParticipation({ masteryRate: null });

        // then
        expect(campaignAssessmentParticipation.masteryRate).to.equal(null);
      });
    });

    context('when the masteryRate is undefined', function () {
      it('should return null for the masteryRate', function () {
        // when
        const campaignAssessmentParticipation = new CampaignAssessmentParticipation({
          masteryRate: undefined,
        });

        // then
        expect(campaignAssessmentParticipation.masteryRate).to.equal(null);
      });
    });

    context('when the masteryRate equals to 0', function () {
      it('should return 0 for the masteryRate', function () {
        // when
        const campaignAssessmentParticipation = new CampaignAssessmentParticipation({
          masteryRate: 0,
        });

        // then
        expect(campaignAssessmentParticipation.masteryRate).to.equal(0);
      });
    });

    context('when the masteryRate is a string', function () {
      it('should return the number for the masteryRate', function () {
        // when
        const campaignAssessmentParticipation = new CampaignAssessmentParticipation({
          masteryRate: '0.75',
        });

        // then
        expect(campaignAssessmentParticipation.masteryRate).to.equal(0.75);
      });
    });
  });
});
