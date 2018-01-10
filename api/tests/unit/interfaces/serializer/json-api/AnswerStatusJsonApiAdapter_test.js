
const AnswerStatusJsonApiAdapter = require('../../../../../lib/interfaces/serializer/json-api/AnswerStatusJsonApiAdapter');
const AnswerStatus = require('../../../../../lib/domain/models/AnswerStatus');

const { expect } = require('chai');

describe('AnswerStatusJsonApiAdapter', () => {

  describe('#adapt', () => {

    it('should convert AnswerStatus.OK to "ok"', () => {
      const answerStatus = AnswerStatus.OK;
      const result = AnswerStatusJsonApiAdapter.adapt(answerStatus);
      expect(result).to.equals('ok');
    });

    it('should convert AnswerStatus.KO to "ko"', () => {
      const answerStatus = AnswerStatus.KO;
      const result = AnswerStatusJsonApiAdapter.adapt(answerStatus);
      expect(result).to.equals('ko');
    });

    it('should convert AnswerStatus.PARTIALLY to "partially"', () => {
      const answerStatus = AnswerStatus.PARTIALLY;
      const result = AnswerStatusJsonApiAdapter.adapt(answerStatus);
      expect(result).to.equals('partially');
    });

    it('should convert AnswerStatus.TIMEDOUT to "timedout"', () => {
      const answerStatus = AnswerStatus.TIMEDOUT;
      const result = AnswerStatusJsonApiAdapter.adapt(answerStatus);
      expect(result).to.equals('timedout');
    });

    it('should convert AnswerStatus.SKIPPED to "aband"', () => {
      const answerStatus = AnswerStatus.SKIPPED;
      const result = AnswerStatusJsonApiAdapter.adapt(answerStatus);
      expect(result).to.equals('aband');
    });

    it('should convert AnswerStatus.UNIMPLEMENTED to "unimplemented"', () => {
      const answerStatus = AnswerStatus.UNIMPLEMENTED;
      const result = AnswerStatusJsonApiAdapter.adapt(answerStatus);
      expect(result).to.equals('unimplemented');
    });

  });

});
