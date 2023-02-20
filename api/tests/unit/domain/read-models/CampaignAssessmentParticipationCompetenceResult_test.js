import { expect, domainBuilder } from '../../../test-helper';
import CampaignAssessmentParticipationCompetenceResult from '../../../../lib/domain/read-models/CampaignAssessmentParticipationCompetenceResult';

describe('Unit | Domain | Models | CampaignAssessmentParticipationCompetenceResult', function () {
  describe('constructor', function () {
    it('should correctly initialize the competence data', function () {
      const competence = domainBuilder.buildCompetence({
        id: 'rec123',
        name: 'competence1',
        index: '1.1',
        areaId: 'area1',
      });
      const area = domainBuilder.buildArea({ id: 'area1' });

      const campaignAssessmentParticipationCompetenceResult = new CampaignAssessmentParticipationCompetenceResult({
        campaignParticipationId: '1',
        area,
        competence,
      });

      expect(campaignAssessmentParticipationCompetenceResult.id).equal('1-rec123');
      expect(campaignAssessmentParticipationCompetenceResult.name).equal('competence1');
      expect(campaignAssessmentParticipationCompetenceResult.index).equal('1.1');
    });

    it('should return the area color', function () {
      const competence = domainBuilder.buildCompetence({
        id: 'rec123',
        areaId: 'area1',
      });
      const area = domainBuilder.buildArea({ id: 'area1', color: 'red' });

      const campaignAssessmentParticipationCompetenceResult = new CampaignAssessmentParticipationCompetenceResult({
        area,
        competence,
      });

      expect(campaignAssessmentParticipationCompetenceResult.areaColor).equal('red');
    });
  });
});
