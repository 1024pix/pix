import { expect } from 'chai';

import { CampaignAssessmentResult } from '../../../../../src/lti/domain/models/CampaignAssessmentResult.js';

describe('Unit | LTI | Domain | Model | CampaignAssessmentResult', function () {
  describe('#constructor', function () {
    it('keeps the mastery rate and only competence level attributes', function () {
      // when
      const result = new CampaignAssessmentResult({
        campaignParticipationId: 1,
        masteryRate: 0.42,
        competences: [
          {
            id: 'recCompetence1',
            index: '1.1',
            name: 'Mener une recherche',
            description: 'ignored',
            maxLevel: 3,
            reachedLevel: 2,
            levelsPerTube: [],
          },
        ],
      });

      // then
      expect(result).to.deep.equal({
        campaignParticipationId: 1,
        masteryRate: 0.42,
        competences: [
          { id: 'recCompetence1', index: '1.1', name: 'Mener une recherche', maxLevel: 3, reachedLevel: 2 },
        ],
      });
    });

    it('defaults mastery rate to null and competences to an empty array', function () {
      // when
      const result = new CampaignAssessmentResult({ campaignParticipationId: 1 });

      // then
      expect(result.masteryRate).to.be.null;
      expect(result.competences).to.deep.equal([]);
    });
  });
});
