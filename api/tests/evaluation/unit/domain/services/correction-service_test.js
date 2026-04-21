import sinon from 'sinon';

import { Answer } from '../../../../../src/evaluation/domain/models/Answer.js';
import { evaluateAnswer } from '../../../../../src/evaluation/domain/services/correction-service.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Domain | Service | correction-service', function () {
  const now = new Date('2025-06-15T12:00:00Z');
  let clock;

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#evaluateAnswer', function () {
    context('when answer evaluation succeeds without forcing OK answer', function () {
      it('should return the corrected answer', function () {
        // given
        const challenge = domainBuilder.buildChallenge();
        const answer = domainBuilder.buildAnswer();
        const hasChallengeBeenFocusedOut = false;
        const isCertificationEvaluation = true;
        const accessibilityAdjustmentNeeded = false;

        // when
        const a = evaluateAnswer({
          challenge,
          answer,
          hasChallengeBeenFocusedOut,
          isCertificationEvaluation,
          accessibilityAdjustmentNeeded,
        });

        // then
        expect(a).to.be.an.instanceOf(Answer);
      });
    });

    context('when evaluating answer forcing OK answer', function () {
      it('should return an OK corrected answer', function () {
        // given
        const challenge = domainBuilder.buildChallenge();
        const answer = domainBuilder.buildAnswer({
          value: 'Some random value',
        });
        const hasChallengeBeenFocusedOut = false;
        const isCertificationEvaluation = true;
        const accessibilityAdjustmentNeeded = false;

        // when
        const correctedAnswer = evaluateAnswer({
          challenge,
          answer,
          hasChallengeBeenFocusedOut,
          isCertificationEvaluation,
          accessibilityAdjustmentNeeded,
          forceOKAnswer: true,
        });

        // then
        expect(correctedAnswer).to.be.an.instanceOf(Answer);
        expect(correctedAnswer.isOk()).to.be.true;
      });
    });

    context('when a challengeSubmittedAt is provided', function () {
      it('should compute the time spent on the challenge', function () {
        // given
        const challenge = domainBuilder.buildChallenge();
        const answer = domainBuilder.buildAnswer({
          value: 'Some random value',
        });
        const hasChallengeBeenFocusedOut = false;
        const isCertificationEvaluation = true;
        const accessibilityAdjustmentNeeded = false;

        // when
        const correctedAnswer = evaluateAnswer({
          challenge,
          answer,
          challengeSubmittedAt: new Date('2025-06-15T11:30:00Z'),
          hasChallengeBeenFocusedOut,
          isCertificationEvaluation,
          accessibilityAdjustmentNeeded,
        });

        // then
        expect(correctedAnswer).to.be.an.instanceOf(Answer);
        expect(correctedAnswer.timeSpent).to.equal(1800); // 30 minutes
      });
    });

    context('when a challengeSubmittedAt is not provided', function () {
      it('should compute a zero-ish time spent', function () {
        // given
        const challenge = domainBuilder.buildChallenge();
        const answer = domainBuilder.buildAnswer({
          value: 'Some random value',
        });
        const hasChallengeBeenFocusedOut = false;
        const isCertificationEvaluation = true;
        const accessibilityAdjustmentNeeded = false;

        // when
        const correctedAnswer = evaluateAnswer({
          challenge,
          answer,
          hasChallengeBeenFocusedOut,
          isCertificationEvaluation,
          accessibilityAdjustmentNeeded,
        });

        // then
        expect(correctedAnswer).to.be.an.instanceOf(Answer);
        expect(correctedAnswer.timeSpent).to.equal(0);
      });
    });
  });
});
