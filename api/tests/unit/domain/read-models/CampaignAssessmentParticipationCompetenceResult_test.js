const { expect } = require('../../../test-helper');
const CampaignAssessmentParticipationCompetenceResult = require('../../../../lib/domain/read-models/CampaignAssessmentParticipationCompetenceResult');
const Area = require('../../../../lib/domain/models/Area');

describe('Unit | Domain | Models | CampaignAssessmentParticipationCompetenceResult', () => {

  describe('#areaColor', () => {
    it('returns the area color', () => {
      const campaignAssessmentParticipationCompetenceResult = new CampaignAssessmentParticipationCompetenceResult({
        area: new Area({ color: 'red' })
      });

      expect(campaignAssessmentParticipationCompetenceResult.areaColor).equal('red');
    });
  });
});
