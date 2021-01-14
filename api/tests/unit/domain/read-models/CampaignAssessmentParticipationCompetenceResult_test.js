const { expect, domainBuilder } = require('../../../test-helper');
const CampaignAssessmentParticipationCompetenceResult = require('../../../../lib/domain/read-models/CampaignAssessmentParticipationCompetenceResult');

describe('Unit | Domain | Models | CampaignAssessmentParticipationCompetenceResult', () => {

  describe('constructor', () => {
    it('should correctly initialize the competence data', () => {
      const targetedCompetence = domainBuilder.buildTargetedCompetence({
        id: 'rec123',
        name: 'competence1',
        index: '1.1',
        areaId: 'area1',
      });
      const targetedArea = domainBuilder.buildTargetedArea({ id: 'area1' });

      const campaignAssessmentParticipationCompetenceResult = new CampaignAssessmentParticipationCompetenceResult({
        campaignParticipationId: '1',
        targetedArea,
        targetedCompetence,
      });

      expect(campaignAssessmentParticipationCompetenceResult.id).equal('1-rec123');
      expect(campaignAssessmentParticipationCompetenceResult.name).equal('competence1');
      expect(campaignAssessmentParticipationCompetenceResult.index).equal('1.1');
    });

    it('should return the area color', () => {
      const targetedCompetence = domainBuilder.buildTargetedCompetence({
        id: 'rec123',
        areaId: 'area1',
      });
      const targetedArea = domainBuilder.buildTargetedArea({ id: 'area1', color: 'red' });

      const campaignAssessmentParticipationCompetenceResult = new CampaignAssessmentParticipationCompetenceResult({
        targetedArea,
        targetedCompetence,
      });

      expect(campaignAssessmentParticipationCompetenceResult.areaColor).equal('red');
    });
  });
});
