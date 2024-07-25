import { getLastAnswerStatus } from '../../../../../src/school/domain/services/last-answer-status.js';
import { ActivityAnswer } from '../../../../../src/shared/domain/models/index.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Service | getLastAnswerStatus', function () {
  describe('#getLastAnswerStatus', function () {
    it('returns undefined when there is no answer', function () {
      const answers = [];

      const result = getLastAnswerStatus(answers);

      expect(result).to.be.undefined;
    });

    it('returns the status of the last answer', async function () {
      const answers = [new ActivityAnswer({ result: 'ko' })];

      const result = getLastAnswerStatus(answers);

      expect(result).to.equal('ko');
    });
  });
});
