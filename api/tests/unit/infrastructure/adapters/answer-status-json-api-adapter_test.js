import AnswerStatusJsonApiAdapter from '../../../../lib/infrastructure/adapters/answer-status-json-api-adapter';
import AnswerStatus from '../../../../lib/domain/models/AnswerStatus';
import { expect } from 'chai';

describe('AnswerStatusJsonApiAdapter', function () {
  describe('#adapt', function () {
    it('should convert AnswerStatus.OK to "ok"', function () {
      const answerStatus = AnswerStatus.OK;
      const result = AnswerStatusJsonApiAdapter.adapt(answerStatus);
      expect(result).to.equals('ok');
    });

    it('should convert AnswerStatus.KO to "ko"', function () {
      const answerStatus = AnswerStatus.KO;
      const result = AnswerStatusJsonApiAdapter.adapt(answerStatus);
      expect(result).to.equals('ko');
    });

    it('should convert AnswerStatus.PARTIALLY to "partially"', function () {
      const answerStatus = AnswerStatus.PARTIALLY;
      const result = AnswerStatusJsonApiAdapter.adapt(answerStatus);
      expect(result).to.equals('partially');
    });

    it('should convert AnswerStatus.TIMEDOUT to "timedout"', function () {
      const answerStatus = AnswerStatus.TIMEDOUT;
      const result = AnswerStatusJsonApiAdapter.adapt(answerStatus);
      expect(result).to.equals('timedout');
    });

    it('should convert AnswerStatus.FOCUSEDOUT to "focusedOut"', function () {
      const answerStatus = AnswerStatus.FOCUSEDOUT;
      const result = AnswerStatusJsonApiAdapter.adapt(answerStatus);
      expect(result).to.equals('focusedOut');
    });

    it('should convert AnswerStatus.SKIPPED to "aband"', function () {
      const answerStatus = AnswerStatus.SKIPPED;
      const result = AnswerStatusJsonApiAdapter.adapt(answerStatus);
      expect(result).to.equals('aband');
    });

    it('should convert AnswerStatus.UNIMPLEMENTED to "unimplemented"', function () {
      const answerStatus = AnswerStatus.UNIMPLEMENTED;
      const result = AnswerStatusJsonApiAdapter.adapt(answerStatus);
      expect(result).to.equals('unimplemented');
    });
  });
});
