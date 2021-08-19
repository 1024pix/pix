
const AnswerStatusJsonApiAdapter = require('../../../../lib/infrastructure/adapters/answer-status-json-api-adapter');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');

const { expect } = require('chai');

describe('AnswerStatusJsonApiAdapter', function() {

  describe('#adapt', function() {

    it('should convert AnswerStatus.OK to "ok"', function() {
      const answerStatus = AnswerStatus.OK;
      const result = AnswerStatusJsonApiAdapter.adapt(answerStatus);
      expect(result).to.equals('ok');
    });

    it('should convert AnswerStatus.KO to "ko"', function() {
      const answerStatus = AnswerStatus.KO;
      const result = AnswerStatusJsonApiAdapter.adapt(answerStatus);
      expect(result).to.equals('ko');
    });

    it('should convert AnswerStatus.PARTIALLY to "partially"', function() {
      const answerStatus = AnswerStatus.PARTIALLY;
      const result = AnswerStatusJsonApiAdapter.adapt(answerStatus);
      expect(result).to.equals('partially');
    });

    it('should convert AnswerStatus.TIMEDOUT to "timedout"', function() {
      const answerStatus = AnswerStatus.TIMEDOUT;
      const result = AnswerStatusJsonApiAdapter.adapt(answerStatus);
      expect(result).to.equals('timedout');
    });

    it('should convert AnswerStatus.SKIPPED to "aband"', function() {
      const answerStatus = AnswerStatus.SKIPPED;
      const result = AnswerStatusJsonApiAdapter.adapt(answerStatus);
      expect(result).to.equals('aband');
    });

    it('should convert AnswerStatus.UNIMPLEMENTED to "unimplemented"', function() {
      const answerStatus = AnswerStatus.UNIMPLEMENTED;
      const result = AnswerStatusJsonApiAdapter.adapt(answerStatus);
      expect(result).to.equals('unimplemented');
    });

  });

});
