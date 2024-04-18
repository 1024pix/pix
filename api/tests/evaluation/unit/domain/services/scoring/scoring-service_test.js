import {
  MAX_REACHABLE_LEVEL,
  MAX_REACHABLE_PIX_BY_COMPETENCE,
  PIX_COUNT_BY_LEVEL,
} from '../../../../../../lib/domain/constants.js';
import * as scoringService from '../../../../../../src/evaluation/domain/services/scoring/scoring-service.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

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
        realTotalPixScoreForCompetence: MAX_REACHABLE_PIX_BY_COMPETENCE + PIX_COUNT_BY_LEVEL * 2,
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
          realTotalPixScoreForCompetence: MAX_REACHABLE_PIX_BY_COMPETENCE + PIX_COUNT_BY_LEVEL * 2,
          pixScoreForCompetence: MAX_REACHABLE_PIX_BY_COMPETENCE + PIX_COUNT_BY_LEVEL * 2,
          currentLevel: MAX_REACHABLE_LEVEL + 2,
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
      const unreachableScore = MAX_REACHABLE_PIX_BY_COMPETENCE + 3000;
      const maxEarnedPixByKnowledgeElement = MAX_REACHABLE_PIX_BY_COMPETENCE;
      const belowMaxEarnedPix = 1;
      const expectedPixScore = 2 * maxEarnedPixByKnowledgeElement + belowMaxEarnedPix;

      const knowledgeElements = [
        domainBuilder.buildKnowledgeElement({
          competenceId: 'competenceEarnedPixCapped',
          skillId: 'skill1.1',
          earnedPix: unreachableScore,
        }),
        domainBuilder.buildKnowledgeElement({
          competenceId: 'competence2',
          skillId: 'skill2.1',
          earnedPix: maxEarnedPixByKnowledgeElement,
        }),
        domainBuilder.buildKnowledgeElement({
          competenceId: 'competence3',
          skillId: 'skill2.2',
          earnedPix: belowMaxEarnedPix,
        }),
      ];

      expect(scoringService.calculatePixScore(knowledgeElements)).to.be.equal(expectedPixScore);
    });
  });
});
