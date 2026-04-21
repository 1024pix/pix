import { CampaignAssessmentParticipation } from '../../../../../../src/prescription/campaign-participation/domain/models/CampaignAssessmentParticipation.js';

describe('Unit | Domain | Models | CampaignAssessmentParticipation', function () {
  describe('#progression', function () {
    it('should return progression on instantiation ', function () {
      // when
      const campaignAssessmentParticipation = new CampaignAssessmentParticipation({ progression: 0.5 });

      // then
      expect(campaignAssessmentParticipation.progression).to.equal(0.5);
    });

    it('should return set progression', function () {
      // when
      const campaignAssessmentParticipation = new CampaignAssessmentParticipation({ progression: null });
      campaignAssessmentParticipation.setProgression(0.2);
      // then
      expect(campaignAssessmentParticipation.progression).to.equal(0.2);
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
