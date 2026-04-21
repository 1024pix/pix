import { FlashAssessmentAlgorithmChallengesBetweenCompetencesRule } from '../../../../../../src/certification/evaluation/domain/models/FlashAssessmentAlgorithmChallengesBetweenCompetencesRule.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

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
          const answeredChallengeCompetence1 = domainBuilder.certification.evaluation.buildCalibratedChallenge({
            id: 'chall1.1',
            skill: domainBuilder.certification.evaluation.buildCalibratedChallengeSkill({
              competenceId: competence1Id,
            }),
          });

          const unansweredChallengeCompetence1 = domainBuilder.certification.evaluation.buildCalibratedChallenge({
            id: 'chall1.2',
            skill: domainBuilder.certification.evaluation.buildCalibratedChallengeSkill({
              competenceId: competence1Id,
            }),
          });

          const answeredChallengeCompetence2 = domainBuilder.certification.evaluation.buildCalibratedChallenge({
            id: 'chall2.1',
            skill: domainBuilder.certification.evaluation.buildCalibratedChallengeSkill({
              competenceId: competence2Id,
            }),
          });

          const unansweredChallengeCompetence2 = domainBuilder.certification.evaluation.buildCalibratedChallenge({
            id: 'chall2.2',
            skill: domainBuilder.certification.evaluation.buildCalibratedChallengeSkill({
              competenceId: competence2Id,
            }),
          });

          const answeredChallengeCompetence3 = domainBuilder.certification.evaluation.buildCalibratedChallenge({
            id: 'chall3.1',
            skill: domainBuilder.certification.evaluation.buildCalibratedChallengeSkill({
              competenceId: competence3Id,
            }),
          });

          const unansweredChallengeCompetence3 = domainBuilder.certification.evaluation.buildCalibratedChallenge({
            id: 'chall3.2',
            skill: domainBuilder.certification.evaluation.buildCalibratedChallengeSkill({
              competenceId: competence3Id,
            }),
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

          const answeredChallengeCompetence1 = domainBuilder.certification.evaluation.buildCalibratedChallenge({
            id: 'chall1.1',
            skill: domainBuilder.certification.evaluation.buildCalibratedChallengeSkill({
              competenceId: competence1Id,
            }),
          });

          const unansweredChallengeCompetence1 = domainBuilder.certification.evaluation.buildCalibratedChallenge({
            id: 'chall1.2',
            skill: domainBuilder.certification.evaluation.buildCalibratedChallengeSkill({
              competenceId: competence1Id,
            }),
          });

          const answeredChallengeCompetence2 = domainBuilder.certification.evaluation.buildCalibratedChallenge({
            id: 'chall2.1',
            skill: domainBuilder.certification.evaluation.buildCalibratedChallengeSkill({
              competenceId: competence2Id,
            }),
          });

          const unansweredChallengeCompetence2 = domainBuilder.certification.evaluation.buildCalibratedChallenge({
            id: 'chall2.2',
            skill: domainBuilder.certification.evaluation.buildCalibratedChallengeSkill({
              competenceId: competence2Id,
            }),
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
