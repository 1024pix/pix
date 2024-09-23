import { AnswerJob } from '../../../../../src/quest/domain/models/AnwserJob.js';
import { ObjectValidationError } from '../../../../../src/shared/domain/errors.js';
import { catchErr, expect } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | AnswerJob', function () {
  it('should instantiate an AnswerJob', function () {
    // given
    const userId = 1;

    // when
    const answerJob = new AnswerJob({ userId });

    // then
    expect(answerJob.userId).to.equal(userId);
  });

  it('should throw an error when userId is missing', async function () {
    // given & when
    const error = await catchErr(() => {
      new AnswerJob();
    })();

    // then
    expect(error).to.be.instanceOf(ObjectValidationError);
    expect(error.message).to.equal('User id is required');
  });
});
