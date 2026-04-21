import sinon from 'sinon';

import * as correctionApi from '../../../../../src/evaluation/application/api/correction-api.js';
import { Answer } from '../../../../../src/evaluation/domain/models/Answer.js';

import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Evaluation | Unit | Application | API | correction-api', function () {
  describe('#correctAnswer', function () {
    const now = new Date('2025-06-15T12:00:00Z');
    let clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('corrects the answer and return the corrected versions of the answer', async function () {
      // given
      const challenge = domainBuilder.buildChallenge();
      const answer = domainBuilder.buildAnswer({ userId: 123 });
      const hasChallengeBeenFocusedOut = false;
      const isCertificationEvaluation = true;
      const accessibilityAdjustmentNeeded = false;

      // when
      const correctedAnswer = correctionApi.correctAnswer({
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
});
