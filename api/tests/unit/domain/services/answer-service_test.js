const { describe, it, expect } = require('../../../test-helper');
const certificationService = require('../../../../lib/domain/services/answer-service');

const Bookshelf = require('../../../../lib/infrastructure/bookshelf');
const Answers = require('../../../../lib/domain/models/data/answer');

describe('Unit | Domain | Services | answer-service', function() {

  describe('#getAnswersSuccessRate', () => {

    const AnswersCollection = Bookshelf.Collection.extend({
      model: Answers
    });

    context('when no answers is given', () => {
      it('should have a trust level has unknown', () => {
        // given
        const answers = AnswersCollection.forge([]);

        // when
        const successRate = certificationService.getAnswersSuccessRate(answers.models);

        // then
        expect(successRate).to.equal(null);
      });
    });

    context('when all answers are OK', () => {
      it('should has a success rate at 100%', () => {
        // given
        const answers = AnswersCollection.forge([{ result: 'ok' }]);

        // when
        const successRate = certificationService.getAnswersSuccessRate(answers.models);

        // then
        expect(successRate).to.equal(100);
      });
    });

    context('when all answers are KO', () => {
      it('should has a success rate at 0%', () => {
        // given
        const answers = AnswersCollection.forge([{ result: 'ko' }]);

        // when
        const successRate = certificationService.getAnswersSuccessRate(answers.models);

        // then
        expect(successRate).to.equal(0);
      });
    });

    context('when the answers are a mixed of valid and wrong answers', () => {
      it('should has a success rate at 50% with 1W and 1R', () => {
        // given
        const answers = AnswersCollection.forge([{ result: 'ko' }, { result: 'ok' }]);

        // when
        const successRate = certificationService.getAnswersSuccessRate(answers.models);

        // then
        expect(successRate).to.equal(50);
      });

      it('should has a success rate at 50% with 2W and 1R', () => {
        // given
        const answers = AnswersCollection.forge([{ result: 'ko' }, { result: '#ABAND#' }, { result: 'ok' }]);

        // when
        const successRate = certificationService.getAnswersSuccessRate(answers.models);

        // then
        expect(successRate).to.be.within(33.333333, 33.333334);
      });

    });
  });

});
