import { FlashAssessmentAlgorithmForcedCompetencesRule } from '../../../../../../src/certification/flash-certification/domain/models/FlashAssessmentAlgorithmForcedCompetencesRule.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Domain | Models | FlashAssessmentAlgorithm | FlashAssessmentAlgorithmForcedCompetencesRule', function () {
  describe('#isApplicable', function () {
    describe('when there is NO forcedCompetences', function () {
      it('should return false', function () {
        const configuration = {
          forcedCompetences: [],
          warmUpLength: 1,
          answers: [],
        };

        expect(FlashAssessmentAlgorithmForcedCompetencesRule.isApplicable(configuration)).to.be.false;
      });
    });
    describe('when there is forcedCompetences AND answers length is smaller than warmUpLength', function () {
      it('should return false', function () {
        const configuration = {
          forcedCompetences: ['comp1'],
          warmUpLength: 2,
          answers: [],
        };

        expect(FlashAssessmentAlgorithmForcedCompetencesRule.isApplicable(configuration)).to.be.false;
      });
    });
    describe('when there is forcedCompetence AND answers length is bigger or equal than warmUpLength', function () {
      it('should return true', function () {
        const configuration = {
          forcedCompetences: ['comp1'],
          warmUpLength: 0,
          answers: [],
        };

        expect(FlashAssessmentAlgorithmForcedCompetencesRule.isApplicable(configuration)).to.be.true;
      });
    });
  });

  describe('#execute', function () {
    it('should return the challenges with forced competences ONLY', function () {
      const unansweredCompetenceUnansweredChallenge = domainBuilder.buildChallenge({
        id: 'challenge1',
        competenceId: 'competenceId1',
      });

      const unansweredCompetenceUnansweredForcedChallenge = domainBuilder.buildChallenge({
        id: 'challenge1forced',
        competenceId: 'comp1',
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
        unansweredCompetenceUnansweredForcedChallenge,
        answeredCompetenceUnansweredChallenge,
        answeredCompetenceAnsweredChallenge,
      ];

      const assessmentAnswers = [
        domainBuilder.buildAnswer({
          challengeId: answeredCompetenceAnsweredChallenge.id,
        }),
      ];

      expect(
        FlashAssessmentAlgorithmForcedCompetencesRule.execute({
          allChallenges,
          assessmentAnswers,
          availableChallenges: allChallenges,
          warmUpLength: 0,
          forcedCompetences: ['comp1'],
        }),
      ).to.deep.equal([unansweredCompetenceUnansweredForcedChallenge]);
    });

    it('should all the challenges if they are all answered', function () {
      const unansweredCompetenceUnansweredChallenge = domainBuilder.buildChallenge({
        id: 'challenge1',
        competenceId: 'competenceId1',
      });

      const answeredCompetenceUnansweredForcedChallenge = domainBuilder.buildChallenge({
        id: 'challenge1forced',
        competenceId: 'comp1',
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
        answeredCompetenceUnansweredForcedChallenge,
        answeredCompetenceUnansweredChallenge,
        answeredCompetenceAnsweredChallenge,
      ];

      const assessmentAnswers = [
        domainBuilder.buildAnswer({
          challengeId: answeredCompetenceAnsweredChallenge.id,
        }),
        domainBuilder.buildAnswer({
          challengeId: answeredCompetenceUnansweredForcedChallenge.id,
        }),
      ];

      expect(
        FlashAssessmentAlgorithmForcedCompetencesRule.execute({
          allChallenges,
          assessmentAnswers,
          availableChallenges: allChallenges,
          warmUpLength: 0,
          forcedCompetences: ['comp1'],
        }),
      ).to.deep.equal(allChallenges);
    });
  });
});
