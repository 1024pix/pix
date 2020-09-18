const { expect, domainBuilder } = require('../../../test-helper');
const CampaignAssessmentParticipationCompetenceResult = require('../../../../lib/domain/read-models/CampaignAssessmentParticipationCompetenceResult');

describe('Unit | Domain | Models | CampaignAssessmentParticipationCompetenceResult', () => {

  describe('constructor', () => {
    it('should correctly initialize the competence data', () => {
      const targetedCompetence = domainBuilder.buildCompetence({
        id: 'rec123',
        name: 'competence1',
        index: '1.1',
      });

      const campaignAssessmentParticipationCompetenceResult = new CampaignAssessmentParticipationCompetenceResult({
        targetedCompetence,
      });

      expect(campaignAssessmentParticipationCompetenceResult.id).equal('rec123');
      expect(campaignAssessmentParticipationCompetenceResult.name).equal('competence1');
      expect(campaignAssessmentParticipationCompetenceResult.index).equal('1.1');
    });

    it('should return the area color', () => {
      const targetedCompetence = domainBuilder.buildCompetence({
        area: domainBuilder.buildArea({ color: 'red' }),
      });

      const campaignAssessmentParticipationCompetenceResult = new CampaignAssessmentParticipationCompetenceResult({
        targetedCompetence,
      });

      expect(campaignAssessmentParticipationCompetenceResult.areaColor).equal('red');
    });
  });
});
