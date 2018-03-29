const { expect } = require('../../../test-helper');
const answerService = require('../../../../lib/domain/services/answer-service');

const Answer = require('../../../../lib/domain/models/Answer');

describe('Unit | Domain | Services | answer-service', function() {

  describe('#getAnswersSuccessRate', () => {

    context('when no answers is given', () => {

      it('should have a trust level has unknown', () => {
        // given
        const answers = [];

        // when
        const successRate = answerService.getAnswersSuccessRate(answers);

        // then
        expect(successRate).to.equal(null);
      });
    });

    context('when all answers are OK', () => {

      it('should has a success rate at 100%', () => {
        // given
        const answers = [new Answer({ result: 'ok' }), new Answer({ result: 'ok' })];

        // when
        const successRate = answerService.getAnswersSuccessRate(answers);

        // then
        expect(successRate).to.equal(100);
      });
    });

    context('when all answers are KO', () => {

      it('should has a success rate at 0%', () => {
        // given
        const answers = [new Answer({ result: 'ko' }), new Answer({ result: 'ko' })];

        // when
        const successRate = answerService.getAnswersSuccessRate(answers);

        // then
        expect(successRate).to.equal(0);
      });
    });

    context('when the answers are a mixed of valid and wrong answers', () => {

      it('should has a success rate at 50% with 1W and 1R', () => {
        // given
        const answers = [new Answer({ result: 'ok' }), new Answer({ result: 'ko' })];

        // when
        const successRate = answerService.getAnswersSuccessRate(answers);

        // then
        expect(successRate).to.equal(50);
      });

      it('should has a success rate at 50% with 2W and 1R', () => {
        // given
        const answers = [new Answer({ result: 'ok' }), new Answer({ result: '#ABAND#' }), new Answer({ result: 'ko' })];

        // when
        const successRate = answerService.getAnswersSuccessRate(answers);

        // then
        expect(successRate).to.be.within(33.333333, 33.333334);
      });

    });
  });

});
