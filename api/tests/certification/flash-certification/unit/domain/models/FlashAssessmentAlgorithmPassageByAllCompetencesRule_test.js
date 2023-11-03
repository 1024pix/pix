import { FlashAssessmentAlgorithmPassageByAllCompetencesRule } from '../../../../../../src/certification/flash-certification/domain/model/FlashAssessmentAlgorithmPassageByAllCompetencesRule.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Domain | Models | FlashAssessmentAlgorithm | FlashAssessmentAlgorithmPassageByAllCompetencesRule', function () {
  describe('#isApplicable', function () {
    describe('when enablePassageByAllCompetences is false', function () {
      it('should return false', function () {
        const configuration = {
          enablePassageByAllCompetences: false,
          warmUpLength: 1,
          answers: [],
        };

        expect(FlashAssessmentAlgorithmPassageByAllCompetencesRule.isApplicable(configuration)).to.be.false;
      });
    });
    describe('when enablePassageByAllCompetences is true AND answers length is smaller than warmUpLength', function () {
      it('should return false', function () {
        const configuration = {
          enablePassageByAllCompetences: true,
          warmUpLength: 2,
          answers: [],
        };

        expect(FlashAssessmentAlgorithmPassageByAllCompetencesRule.isApplicable(configuration)).to.be.false;
      });
    });
    describe('when the enablePassageByAllCompetences is true AND answers length is bigger or equal than warmUpLength', function () {
      it('should return true', function () {
        const configuration = {
          enablePassageByAllCompetences: true,
          warmUpLength: 0,
          answers: [],
        };

        expect(FlashAssessmentAlgorithmPassageByAllCompetencesRule.isApplicable(configuration)).to.be.true;
      });
    });
  });

  describe('#execute', function () {
    it('should return the challenges with non answered competences', function () {
      const unansweredCompetenceUnansweredChallenge = domainBuilder.buildChallenge({
        id: 'challenge1',
        competenceId: 'competenceId1',
      });

      const answeredCompetenceUnansweredChallenge = domainBuilder.buildChallenge({
        id: 'challenge2',
        competenceId: 'competenceId2',
      });

      const answeredCompetenceAnsweredChallenge = domainBuilder.buildChallenge({
        id: 'challenge3',
        competenceId: 'competenceId2',
      });

      const allChallenges = [
        unansweredCompetenceUnansweredChallenge,
        answeredCompetenceUnansweredChallenge,
        answeredCompetenceAnsweredChallenge,
      ];

      const allAnswers = [
        domainBuilder.buildAnswer({
          challengeId: answeredCompetenceAnsweredChallenge.id,
        }),
      ];

      expect(
        FlashAssessmentAlgorithmPassageByAllCompetencesRule.execute({
          allChallenges,
          allAnswers,
          availableChallenges: allChallenges,
          warmUpLength: 0,
        }),
      ).to.deep.equal([unansweredCompetenceUnansweredChallenge]);
    });
  });
});
