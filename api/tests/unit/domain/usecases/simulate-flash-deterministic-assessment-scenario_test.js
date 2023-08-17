import { AnswerStatus } from '../../../../lib/domain/models/AnswerStatus.js';
import { simulateFlashDeterministicAssessmentScenario } from '../../../../lib/domain/usecases/simulate-flash-deterministic-assessment-scenario.js';
import { domainBuilder, expect, sinon } from '../../../test-helper.js';

const locale = 'fr-fr';

describe('Unit | UseCase | simulate-flash-deterministic-assessment-scenario', function () {
  context('when there are enough flash challenges left', function () {
    context('when no initial capacity is provided', function () {
      it('should return an array of estimated level, challenge, reward and error rate for each answer', async function () {
        // given
        const firstSkill = domainBuilder.buildSkill({ id: 'firstSkill' });
        const secondSkill = domainBuilder.buildSkill({ id: 'secondSkill' });
        const thirdSkill = domainBuilder.buildSkill({ id: 'thirdSkill' });
        const firstChallenge = domainBuilder.buildChallenge({
          id: 'one',
          skill: firstSkill,
          difficulty: -2,
          discriminant: 0.16,
        });
        const secondChallenge = domainBuilder.buildChallenge({
          id: 'two',
          skill: secondSkill,
          difficulty: 6,
          discriminant: 3,
        });
        const thirdChallenge = domainBuilder.buildChallenge({
          id: 'three',
          skill: thirdSkill,
          difficulty: 7.5,
          discriminant: 1.587,
        });

        const challengeRepository = {
          findFlashCompatible: sinon.stub(),
        };
        const pickChallenge = sinon.stub();
        const pickAnswerStatus = sinon.stub();

        challengeRepository.findFlashCompatible.resolves([firstChallenge, secondChallenge, thirdChallenge]);

        pickChallenge
          .withArgs({
            possibleChallenges: [firstChallenge, thirdChallenge, secondChallenge],
          })
          .returns(firstChallenge)
          .withArgs({
            possibleChallenges: [thirdChallenge, secondChallenge],
          })
          .returns(secondChallenge)
          .withArgs({
            possibleChallenges: [thirdChallenge],
          })
          .returns(thirdChallenge);

        pickAnswerStatus.withArgs(sinon.match({ nextChallenge: firstChallenge })).returns(AnswerStatus.OK);
        pickAnswerStatus.withArgs(sinon.match({ nextChallenge: secondChallenge })).returns(AnswerStatus.OK);
        pickAnswerStatus.withArgs(sinon.match({ nextChallenge: thirdChallenge })).returns(AnswerStatus.OK);

        // when
        const result = await simulateFlashDeterministicAssessmentScenario({
          challengeRepository,
          locale,
          pickChallenge,
          pickAnswerStatus,
        });

        // then
        expect(result).to.have.lengthOf(3);
        result.forEach((answer) => {
          expect(answer.challenge).not.to.be.undefined;
          expect(answer.errorRate).not.to.be.undefined;
          expect(answer.estimatedLevel).not.to.be.undefined;
          expect(answer.reward).not.to.be.undefined;
          expect(answer.answerStatus).not.to.be.undefined;
        });
      });
    });

    context('when the initial capacity is provided', function () {
      it('should return an array of estimated level, challenge, reward and error rate for each answer', async function () {
        // given
        const initialCapacity = 7;

        const firstSkill = domainBuilder.buildSkill({ id: 'firstSkill' });
        const secondSkill = domainBuilder.buildSkill({ id: 'secondSkill' });
        const thirdSkill = domainBuilder.buildSkill({ id: 'thirdSkill' });
        const firstChallenge = domainBuilder.buildChallenge({
          id: 'one',
          skill: firstSkill,
          difficulty: -2,
          discriminant: 0.16,
        });
        const secondChallenge = domainBuilder.buildChallenge({
          id: 'two',
          skill: secondSkill,
          difficulty: 6,
          discriminant: 3,
        });
        const thirdChallenge = domainBuilder.buildChallenge({
          id: 'three',
          skill: thirdSkill,
          difficulty: 7.5,
          discriminant: 1.587,
        });

        const challengeRepository = {
          findFlashCompatible: sinon.stub(),
        };
        const pickChallenge = sinon.stub();
        const pickAnswerStatus = sinon.stub();

        challengeRepository.findFlashCompatible.resolves([firstChallenge, secondChallenge, thirdChallenge]);

        pickChallenge
          .withArgs({
            possibleChallenges: [thirdChallenge, secondChallenge, firstChallenge],
          })
          .returns(firstChallenge)
          .withArgs({
            possibleChallenges: [thirdChallenge, secondChallenge],
          })
          .returns(secondChallenge)
          .withArgs({
            possibleChallenges: [thirdChallenge],
          })
          .returns(thirdChallenge);

        pickAnswerStatus.withArgs(sinon.match({ nextChallenge: firstChallenge })).returns(AnswerStatus.OK);
        pickAnswerStatus.withArgs(sinon.match({ nextChallenge: secondChallenge })).returns(AnswerStatus.OK);
        pickAnswerStatus.withArgs(sinon.match({ nextChallenge: thirdChallenge })).returns(AnswerStatus.OK);

        // when
        const result = await simulateFlashDeterministicAssessmentScenario({
          challengeRepository,
          locale,
          pickChallenge,
          pickAnswerStatus,
          initialCapacity,
        });

        // then
        expect(result).to.have.lengthOf(3);
        result.forEach((answer) => {
          expect(answer.challenge).not.to.be.undefined;
          expect(answer.errorRate).not.to.be.undefined;
          expect(answer.estimatedLevel).not.to.be.undefined;
          expect(answer.reward).not.to.be.undefined;
          expect(answer.answerStatus).not.to.be.undefined;
        });
      });
    });
  });

  context('when there are not enough flash challenges left', function () {
    it('should stop simulating', async function () {
      // given
      const challenge = domainBuilder.buildChallenge({ id: 1 });
      const challengeRepository = {
        findFlashCompatible: sinon.stub(),
      };
      challengeRepository.findFlashCompatible.resolves([challenge]);

      const pickChallenge = sinon.stub();
      const pickAnswerStatus = sinon.stub();

      pickChallenge
        .withArgs({
          possibleChallenges: [challenge],
        })
        .returns(challenge);

      pickAnswerStatus.withArgs(sinon.match({ nextChallenge: challenge })).returns(AnswerStatus.OK);

      // when
      const result = await simulateFlashDeterministicAssessmentScenario({
        challengeRepository,
        locale,
        pickChallenge,
        pickAnswerStatus,
      });

      // then
      sinon.assert.match(result, [
        {
          answerStatus: AnswerStatus.OK,
          challenge,
          errorRate: sinon.match.number,
          estimatedLevel: sinon.match.number,
          reward: sinon.match.number,
        },
      ]);
    });
  });
});
