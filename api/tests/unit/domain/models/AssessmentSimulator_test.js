import { expect, domainBuilder } from '../../../test-helper.js';
import sinon from 'sinon';
import { AnswerStatus, AssessmentSimulator } from '../../../../lib/domain/models/index.js';

describe('Unit | Domain | Models | AssessmentSimulator', function () {
  describe('#run', function () {
    context('when no answers are provided', function () {
      it('returns an empty challenges array', function () {
        // given
        const answers = [];
        const algorithm = {
          getPossibleNextChallenges: sinon.stub(),
        };

        // when
        const { challenges } = new AssessmentSimulator({ answers, algorithm }).run();

        // then
        expect(challenges).to.be.empty;
      });
    });

    context('when 1 answer is provided', function () {
      it('returns a list of one challenge and a correct estimated level', function () {
        // given
        const answers = ['ok'];
        const expectedEstimatedLevel = 2;
        const allChallenges = [domainBuilder.buildChallenge({ id: 'rec1' })];
        const algorithm = {
          getPossibleNextChallenges: ({ challenges }) => challenges,
          getEstimatedLevelAndErrorRate: () => ({
            estimatedLevel: 2,
          }),
        };
        const pickChallenge = ({ possibleChallenges }) => possibleChallenges[0];

        // when
        const { challenges, estimatedLevel } = new AssessmentSimulator({
          answers,
          algorithm,
          challenges: allChallenges,
          pickChallenge,
        }).run();

        // then
        expect(challenges).to.deep.equal([allChallenges[0]]);
        expect(estimatedLevel).to.equal(expectedEstimatedLevel);
      });
    });

    context('when 2 answers are provided', function () {
      it('return a list of 2 challenges', function () {
        // given
        const answersForSimulator = [AnswerStatus.OK, AnswerStatus.KO];
        const challenge1 = domainBuilder.buildChallenge({ id: 'rec1' });
        const challenge2 = domainBuilder.buildChallenge({ id: 'rec2' });
        const answer1 = { challengeId: challenge2.id, result: answersForSimulator[0] };
        const answer2 = { challengeId: challenge1.id, result: answersForSimulator[1] };
        const allChallenges = [challenge1, challenge2];
        const expectedEstimatedLevel = 4;
        const algorithm = {
          getPossibleNextChallenges: sinon.stub(),
          getEstimatedLevelAndErrorRate: sinon.stub(),
        };
        const pickChallenge = sinon.stub();

        algorithm.getEstimatedLevelAndErrorRate
          .withArgs({
            allAnswers: [sinon.match(answer1)],
            challenges: allChallenges,
          })
          .returns({ estimatedLevel: 5 });

        algorithm.getEstimatedLevelAndErrorRate
          .withArgs({
            allAnswers: [sinon.match(answer1), sinon.match(answer2)],
            challenges: allChallenges,
          })
          .returns({ estimatedLevel: 4 });

        algorithm.getPossibleNextChallenges
          .withArgs({
            allAnswers: [],
            challenges: allChallenges,
          })
          .returns([challenge2, challenge1]);
        algorithm.getPossibleNextChallenges
          .withArgs({
            allAnswers: [sinon.match(answer1)],
            challenges: allChallenges,
          })
          .returns([challenge1]);

        pickChallenge.withArgs({ possibleChallenges: [challenge2, challenge1] }).returns(challenge2);
        pickChallenge.withArgs({ possibleChallenges: [challenge1] }).returns(challenge1);

        // when
        const { challenges, estimatedLevel } = new AssessmentSimulator({
          answers: answersForSimulator,
          algorithm,
          challenges: allChallenges,
          pickChallenge,
        }).run();

        // then
        expect(challenges).to.deep.equal([challenge2, challenge1]);
        expect(estimatedLevel).to.equal(expectedEstimatedLevel);
      });
    });
  });
});
