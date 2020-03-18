const scoringService = require('../../../../../lib/domain/services/scoring/scoring-service');
const {
  PIX_COUNT_BY_LEVEL,
  MAX_REACHABLE_LEVEL,
  MAX_REACHABLE_PIX_BY_COMPETENCE,
} = require('../../../../../lib/domain/constants');

const { expect, domainBuilder } = require('../../../../test-helper');

describe('Unit | Service | Scoring Service', () => {

  describe('#calculateScoringInformationForCompetence', function() {

    it('should return the information about pix score and level for one competence', () => {
      // given
      const knowledgeElements = [
        domainBuilder.buildKnowledgeElement({ earnedPix: 3.7 }),
        domainBuilder.buildKnowledgeElement({ earnedPix: 4.4 }),
        domainBuilder.buildKnowledgeElement({ earnedPix: 1.2 }),
      ];

      const expectedScoring = {
        realTotalPixScoreForCompetence: 9.3,
        pixScoreForCompetence: 9,
        currentLevel: 1,
        pixAheadForNextLevel: 1,
      };

      // when
      const scoring = scoringService.calculateScoringInformationForCompetence(knowledgeElements);

      // then
      expect(scoring).to.be.deep.equal(expectedScoring);
    });

    it('should return the information about pix score and level for one competence blocked with max information', () => {
      // given
      const knowledgeElements = [
        domainBuilder.buildKnowledgeElement({ earnedPix: MAX_REACHABLE_PIX_BY_COMPETENCE }),
        domainBuilder.buildKnowledgeElement({ earnedPix: PIX_COUNT_BY_LEVEL }),
        domainBuilder.buildKnowledgeElement({ earnedPix: PIX_COUNT_BY_LEVEL }),
      ];

      const expectedScoring = {
        realTotalPixScoreForCompetence: 56,
        pixScoreForCompetence: MAX_REACHABLE_PIX_BY_COMPETENCE,
        currentLevel: MAX_REACHABLE_LEVEL,
        pixAheadForNextLevel: 0
      };

      // when
      const scoring = scoringService.calculateScoringInformationForCompetence(knowledgeElements);

      // then
      expect(scoring).to.be.deep.equal(expectedScoring);
    });

    context('when we do not block level and pix', () => {
      it('should return the information about pix score and level for one competence blocked not blocked', () => {
        // given
        const knowledgeElements = [
          domainBuilder.buildKnowledgeElement({ earnedPix: MAX_REACHABLE_PIX_BY_COMPETENCE }),
          domainBuilder.buildKnowledgeElement({ earnedPix: PIX_COUNT_BY_LEVEL }),
          domainBuilder.buildKnowledgeElement({ earnedPix: PIX_COUNT_BY_LEVEL }),
        ];
        const blockReachablePixAndLevel = false;
        const expectedScoring = {
          realTotalPixScoreForCompetence: 56,
          pixScoreForCompetence: 56,
          currentLevel: 7,
          pixAheadForNextLevel: 0
        };

        // when
        const scoring = scoringService.calculateScoringInformationForCompetence(knowledgeElements, blockReachablePixAndLevel);

        // then
        expect(scoring).to.be.deep.equal(expectedScoring);
      });

    });

  });
});
