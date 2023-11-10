import { expect, domainBuilder, sinon } from '../../../../../test-helper.js';
import { AssessmentSimulatorDoubleMeasureStrategy } from '../../../../../../src/certification/flash-certification/domain/model/AssessmentSimulatorDoubleMeasureStrategy.js';
import { Answer, AnswerStatus } from '../../../../../../lib/domain/models/index.js';

describe('Unit | Domain | Models | AssessmentSimulatorDoubleMeasureStrategy', function () {
  describe('#run', function () {
    context('when there is no available answer', function () {
      it('should return null', function () {
        // given
        const challenge1 = domainBuilder.buildChallenge({ id: 'rec1' });
        const challenge2 = domainBuilder.buildChallenge({ id: 'rec2' });
        const allChallenges = [challenge1, challenge2];
        const initialCapacity = 0;
        const algorithm = {
          getPossibleNextChallenges: sinon.stub(),
          getEstimatedLevelAndErrorRate: sinon.stub(),
          getReward: sinon.stub(),
        };
        const pickChallenge = sinon.stub();
        const pickAnswerStatus = sinon.stub();

        algorithm.getPossibleNextChallenges
          .withArgs({
            allAnswers: [],
            challenges: allChallenges,
            initialCapacity,
          })
          .returns([challenge2, challenge1]);

        pickChallenge.withArgs({ possibleChallenges: [challenge2, challenge1] }).returns(challenge2);
        pickAnswerStatus.withArgs({ nextChallenge: challenge2, answerIndex: 0 }).returns(undefined);

        // when
        const strategy = new AssessmentSimulatorDoubleMeasureStrategy({
          algorithm,
          challenges: allChallenges,
          pickChallenge,
          pickAnswerStatus,
          initialCapacity,
        });
        const result = strategy.run({ challengesAnswers: [], stepIndex: 0 });

        // then
        expect(result).to.be.null;
      });
    });

    context('when there are two available answers', function () {
      it('should return the result for both challenges', function () {
        // given
        const challenge1 = domainBuilder.buildChallenge({ id: 'rec1' });
        const challenge2 = domainBuilder.buildChallenge({ id: 'rec2' });
        const allChallenges = [challenge1, challenge2];
        const answerForSimulator1 = AnswerStatus.OK;
        const answerForSimulator2 = AnswerStatus.OK;
        const initialCapacity = 0;
        const algorithm = {
          getPossibleNextChallenges: sinon.stub(),
          getEstimatedLevelAndErrorRate: sinon.stub(),
          getReward: sinon.stub(),
        };
        const pickChallenge = sinon.stub();
        const pickAnswerStatus = sinon.stub();

        algorithm.getPossibleNextChallenges
          .withArgs({
            allAnswers: [],
            challenges: allChallenges,
            initialCapacity,
          })
          .returns([challenge2, challenge1]);

        pickChallenge
          .withArgs({ possibleChallenges: [challenge2, challenge1] })
          .returns(challenge2)
          .withArgs({ possibleChallenges: [challenge1] })
          .returns(challenge1);

        pickAnswerStatus
          .withArgs({ nextChallenge: challenge2, answerIndex: 0 })
          .returns(answerForSimulator1)
          .withArgs({ nextChallenge: challenge1, answerIndex: 1 })
          .returns(answerForSimulator2);

        // when
        const expectedResult = {
          results: [
            {
              challenge: challenge2,
            },
            {
              challenge: challenge1,
            },
          ],
          challengeAnswers: [
            new Answer({
              result: answerForSimulator1,
              challengeId: challenge2.id,
            }),
            new Answer({
              result: answerForSimulator2,
              challengeId: challenge1.id,
            }),
          ],
        };

        const strategy = new AssessmentSimulatorDoubleMeasureStrategy({
          algorithm,
          challenges: allChallenges,
          pickChallenge,
          pickAnswerStatus,
          initialCapacity,
        });
        const result = strategy.run({ challengesAnswers: [], stepIndex: 0 });

        // then
        expect(result).to.deep.equal(expectedResult);
      });
    });
  });
});
