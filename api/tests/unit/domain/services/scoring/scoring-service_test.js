import scoringService from '../../../../../lib/domain/services/scoring/scoring-service';
import {
  PIX_COUNT_BY_LEVEL,
  MAX_REACHABLE_LEVEL,
  MAX_REACHABLE_PIX_BY_COMPETENCE,
} from '../../../../../lib/domain/constants';
import { expect, domainBuilder } from '../../../../test-helper';

describe('Unit | Service | Scoring Service', function () {
  describe('#calculateScoringInformationForCompetence', function () {
    it('should return the information about pix score and level for given competence', function () {
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
      const scoring = scoringService.calculateScoringInformationForCompetence({ knowledgeElements });

      // then
      expect(scoring).to.deep.equal(expectedScoring);
    });

    it('should return the information about pix score and level for one competence blocked with max information', function () {
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
        pixAheadForNextLevel: 0,
      };

      // when
      const scoring = scoringService.calculateScoringInformationForCompetence({ knowledgeElements });

      // then
      expect(scoring).to.be.deep.equal(expectedScoring);
    });

    context('when we allow an excess in pix or level', function () {
      it('should return the information about pix score and level for one competence blocked not blocked', function () {
        // given
        const knowledgeElements = [
          domainBuilder.buildKnowledgeElement({ earnedPix: MAX_REACHABLE_PIX_BY_COMPETENCE }),
          domainBuilder.buildKnowledgeElement({ earnedPix: PIX_COUNT_BY_LEVEL }),
          domainBuilder.buildKnowledgeElement({ earnedPix: PIX_COUNT_BY_LEVEL }),
        ];
        const allowExcessLevel = true;
        const allowExcessPix = true;
        const expectedScoring = {
          realTotalPixScoreForCompetence: 56,
          pixScoreForCompetence: 56,
          currentLevel: 7,
          pixAheadForNextLevel: 0,
        };

        // when
        const scoring = scoringService.calculateScoringInformationForCompetence({
          knowledgeElements,
          allowExcessLevel,
          allowExcessPix,
        });

        // then
        expect(scoring).to.be.deep.equal(expectedScoring);
      });
    });
  });

  describe('#calculatePixScore', function () {
    it('returns the Pix score and limit the score', function () {
      const knowledgeElements = [
        domainBuilder.buildKnowledgeElement({ competenceId: 'competence1', skillId: 'skill1.1', earnedPix: 8 }),
        domainBuilder.buildKnowledgeElement({ competenceId: 'competence1', skillId: 'skill1.2', earnedPix: 35 }),
        domainBuilder.buildKnowledgeElement({ competenceId: 'competence2', skillId: 'skill2.1', earnedPix: 1 }),
      ];

      expect(scoringService.calculatePixScore(knowledgeElements)).to.be.equal(41);
    });
  });
});
