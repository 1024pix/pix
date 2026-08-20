import * as scoringService from '../../../../../../src/evaluation/domain/services/scoring/scoring-service.js';
import {
  MAX_REACHABLE_LEVEL,
  MAX_REACHABLE_PIX_BY_COMPETENCE,
  PIX_COUNT_BY_LEVEL,
} from '../../../../../../src/shared/constants.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Service | Scoring Service', function () {
  describe('#calculateScoringInformationForCompetence', function () {
    it('should return the information about pix score and level for given competence', function () {
      // given
      const validatedSkills = [
        domainBuilder.buildSkill({ id: 'skill1', pixValue: 3.7 }),
        domainBuilder.buildSkill({ id: 'skill2', pixValue: 4.4 }),
        domainBuilder.buildSkill({ id: 'skill3', pixValue: 1.2 }),
      ];

      const expectedScoring = {
        realTotalPixScoreForCompetence: 9.3,
        pixScoreForCompetence: 9,
        currentLevel: 1,
        pixAheadForNextLevel: 1,
      };

      // when
      const scoring = scoringService.calculateScoringInformationForCompetence({ validatedSkills });

      // then
      expect(scoring).to.deep.equal(expectedScoring);
    });

    it('should return the information about pix score and level for one competence blocked with max information', function () {
      // given
      const validatedSkills = [
        domainBuilder.buildSkill({ id: 'skill1', pixValue: MAX_REACHABLE_PIX_BY_COMPETENCE }),
        domainBuilder.buildSkill({ id: 'skill2', pixValue: PIX_COUNT_BY_LEVEL }),
        domainBuilder.buildSkill({ id: 'skill3', pixValue: PIX_COUNT_BY_LEVEL }),
      ];

      const expectedScoring = {
        realTotalPixScoreForCompetence: MAX_REACHABLE_PIX_BY_COMPETENCE + PIX_COUNT_BY_LEVEL * 2,
        pixScoreForCompetence: MAX_REACHABLE_PIX_BY_COMPETENCE,
        currentLevel: MAX_REACHABLE_LEVEL,
        pixAheadForNextLevel: 0,
      };

      // when
      const scoring = scoringService.calculateScoringInformationForCompetence({ validatedSkills });

      // then
      expect(scoring).to.be.deep.equal(expectedScoring);
    });

    context('when we allow an excess in pix or level', function () {
      it('should return the information about pix score and level for one competence blocked not blocked', function () {
        // given
        const validatedSkills = [
          domainBuilder.buildSkill({ id: 'skill1', pixValue: MAX_REACHABLE_PIX_BY_COMPETENCE }),
          domainBuilder.buildSkill({ id: 'skill2', pixValue: PIX_COUNT_BY_LEVEL }),
          domainBuilder.buildSkill({ id: 'skill3', pixValue: PIX_COUNT_BY_LEVEL }),
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
          validatedSkills,
          allowExcessLevel,
          allowExcessPix,
        });

        // then
        expect(scoring).to.be.deep.equal(expectedScoring);
      });
    });
  });

  describe('#calculatePixScore', function () {
    it('returns the Pix score and limit the score by competence', function () {
      const unreachableScore = MAX_REACHABLE_PIX_BY_COMPETENCE + 3000;
      const maxPixValue = MAX_REACHABLE_PIX_BY_COMPETENCE;
      const belowMaxPixValue = 1;
      const expectedPixScore = 2 * maxPixValue + belowMaxPixValue;

      const validatedSkills = [
        domainBuilder.buildSkill({
          id: 'skill1.1',
          competenceId: 'competenceEarnedPixCapped',
          pixValue: unreachableScore,
        }),
        domainBuilder.buildSkill({
          id: 'skill2.1',
          competenceId: 'competence2',
          pixValue: maxPixValue,
        }),
        domainBuilder.buildSkill({
          id: 'skill2.2',
          competenceId: 'competence3',
          pixValue: belowMaxPixValue,
        }),
      ];

      expect(scoringService.calculatePixScore(validatedSkills)).to.be.equal(expectedPixScore);
    });
  });
});
