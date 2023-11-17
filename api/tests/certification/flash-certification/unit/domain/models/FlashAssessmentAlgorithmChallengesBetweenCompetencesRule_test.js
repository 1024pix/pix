import { FlashAssessmentAlgorithmChallengesBetweenCompetencesRule } from '../../../../../../src/certification/flash-certification/domain/model/FlashAssessmentAlgorithmChallengesBetweenCompetencesRule.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Domain | Models | FlashAssessmentAlgorithm | FlashAssessmentAlgorithmChallengesBetweenCompetencesRule', function () {
  describe('#isApplicable', function () {
    describe('when challengesBetweenSameCompetence is 0', function () {
      it('should return false', function () {
        const configuration = {
          challengesBetweenSameCompetence: 0,
        };

        expect(FlashAssessmentAlgorithmChallengesBetweenCompetencesRule.isApplicable(configuration)).to.be.false;
      });
    });

    describe('when challengesBetweenSameCompetence is greater than 0', function () {
      it('should return false', function () {
        const configuration = {
          challengesBetweenSameCompetence: 1,
        };

        expect(FlashAssessmentAlgorithmChallengesBetweenCompetencesRule.isApplicable(configuration)).to.be.true;
      });
    });
  });

  describe('#execute', function () {
    describe('when challengesBetweenSameCompetence is 2', function () {
      describe('when there are remaining challenges', function () {
        it('should remove the challenges corresponding to competences answered in the last 2 challenges', function () {
          const competence1Id = 'competence1Id';
          const competence2Id = 'competence2Id';
          const competence3Id = 'competence3Id';
          const answeredChallengeCompetence1 = domainBuilder.buildSkill({
            id: 'chall1.1',
            competenceId: competence1Id,
          });

          const unansweredChallengeCompetence1 = domainBuilder.buildSkill({
            id: 'chall1.2',
            competenceId: competence1Id,
          });

          const answeredChallengeCompetence2 = domainBuilder.buildSkill({
            id: 'chall2.1',
            competenceId: competence2Id,
          });

          const unansweredChallengeCompetence2 = domainBuilder.buildSkill({
            id: 'chall2.2',
            competenceId: competence2Id,
          });

          const answeredChallengeCompetence3 = domainBuilder.buildSkill({
            id: 'chall3.1',
            competenceId: competence3Id,
          });

          const unansweredChallengeCompetence3 = domainBuilder.buildSkill({
            id: 'chall3.2',
            competenceId: competence3Id,
          });

          const allChallenges = [
            answeredChallengeCompetence1,
            answeredChallengeCompetence2,
            answeredChallengeCompetence3,
            unansweredChallengeCompetence1,
            unansweredChallengeCompetence2,
            unansweredChallengeCompetence3,
          ];

          const answer1 = domainBuilder.buildAnswer({
            challengeId: 'chall1.1',
          });

          const answer2 = domainBuilder.buildAnswer({
            challengeId: 'chall2.1',
          });
          const answer3 = domainBuilder.buildAnswer({
            challengeId: 'chall3.1',
          });

          const assessmentAnswers = [answer1, answer2, answer3];

          const options = {
            assessmentAnswers,
            allChallenges,
            availableChallenges: allChallenges,
            challengesBetweenSameCompetence: 2,
          };

          const expectedChallenges = FlashAssessmentAlgorithmChallengesBetweenCompetencesRule.execute(options);

          expect(expectedChallenges).to.deep.equal([answeredChallengeCompetence1, unansweredChallengeCompetence1]);
        });
      });

      describe('when there are noremaining challenges', function () {
        it('should return all the previously available challenges', function () {
          const competence1Id = 'competence1Id';
          const competence2Id = 'competence2Id';
          const answeredChallengeCompetence1 = domainBuilder.buildSkill({
            id: 'chall1.1',
            competenceId: competence1Id,
          });

          const unansweredChallengeCompetence1 = domainBuilder.buildSkill({
            id: 'chall1.2',
            competenceId: competence1Id,
          });

          const answeredChallengeCompetence2 = domainBuilder.buildSkill({
            id: 'chall2.1',
            competenceId: competence2Id,
          });

          const unansweredChallengeCompetence2 = domainBuilder.buildSkill({
            id: 'chall2.2',
            competenceId: competence2Id,
          });

          const allChallenges = [
            answeredChallengeCompetence1,
            answeredChallengeCompetence2,
            unansweredChallengeCompetence1,
            unansweredChallengeCompetence2,
          ];

          const answer1 = domainBuilder.buildAnswer({
            challengeId: 'chall1.1',
          });

          const answer2 = domainBuilder.buildAnswer({
            challengeId: 'chall2.1',
          });

          const assessmentAnswers = [answer1, answer2];

          const options = {
            assessmentAnswers,
            allChallenges,
            availableChallenges: allChallenges,
            challengesBetweenSameCompetence: 2,
          };

          const expectedChallenges = FlashAssessmentAlgorithmChallengesBetweenCompetencesRule.execute(options);

          expect(expectedChallenges).to.deep.equal(allChallenges);
        });
      });
    });
  });
});
