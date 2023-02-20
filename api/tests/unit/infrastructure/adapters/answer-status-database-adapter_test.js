import AnswerStatusDatabaseAdapter from '../../../../lib/infrastructure/adapters/answer-status-database-adapter';
import AnswerStatus from '../../../../lib/domain/models/AnswerStatus';
import { expect } from 'chai';

describe('AnswerStatusDatabaseAdapter', function () {
  describe('#adapt', function () {
    it('should convert AnswerStatus.OK to "ok"', function () {
      const answerStatus = AnswerStatus.OK;
      const result = AnswerStatusDatabaseAdapter.adapt(answerStatus);
      expect(result).to.equals('ok');
    });

    it('should convert AnswerStatus.KO to "ko"', function () {
      const answerStatus = AnswerStatus.KO;
      const result = AnswerStatusDatabaseAdapter.adapt(answerStatus);
      expect(result).to.equals('ko');
    });

    it('should convert AnswerStatus.PARTIALLY to "partially"', function () {
      const answerStatus = AnswerStatus.PARTIALLY;
      const result = AnswerStatusDatabaseAdapter.adapt(answerStatus);
      expect(result).to.equals('partially');
    });

    it('should convert AnswerStatus.TIMEDOUT to "timedout"', function () {
      const answerStatus = AnswerStatus.TIMEDOUT;
      const result = AnswerStatusDatabaseAdapter.adapt(answerStatus);
      expect(result).to.equals('timedout');
    });

    it('should convert AnswerStatus.SKIPPED to "aband"', function () {
      const answerStatus = AnswerStatus.SKIPPED;
      const result = AnswerStatusDatabaseAdapter.adapt(answerStatus);
      expect(result).to.equals('aband');
    });

    it('should convert AnswerStatus.FOCUSEDOUT to "focusedOut"', function () {
      const answerStatus = AnswerStatus.FOCUSEDOUT;
      const result = AnswerStatusDatabaseAdapter.adapt(answerStatus);
      expect(result).to.equals('focusedOut');
    });

    it('should convert AnswerStatus.UNIMPLEMENTED to "unimplemented"', function () {
      const answerStatus = AnswerStatus.UNIMPLEMENTED;
      const result = AnswerStatusDatabaseAdapter.adapt(answerStatus);
      expect(result).to.equals('unimplemented');
    });
  });

  describe('#toSQLString', function () {
    it('should convert AnswerStatus.OK to "ok"', function () {
      const answerStatus = AnswerStatus.OK;
      const result = AnswerStatusDatabaseAdapter.toSQLString(answerStatus);
      expect(result).to.equals('ok');
    });

    it('should convert AnswerStatus.KO to "ko"', function () {
      const answerStatus = AnswerStatus.KO;
      const result = AnswerStatusDatabaseAdapter.toSQLString(answerStatus);
      expect(result).to.equals('ko');
    });

    it('should convert AnswerStatus.PARTIALLY to "partially"', function () {
      const answerStatus = AnswerStatus.PARTIALLY;
      const result = AnswerStatusDatabaseAdapter.toSQLString(answerStatus);
      expect(result).to.equals('partially');
    });

    it('should convert AnswerStatus.TIMEDOUT to "timedout"', function () {
      const answerStatus = AnswerStatus.TIMEDOUT;
      const result = AnswerStatusDatabaseAdapter.toSQLString(answerStatus);
      expect(result).to.equals('timedout');
    });

    it('should convert AnswerStatus.FOCUSEDOUT to "focusedOut"', function () {
      const answerStatus = AnswerStatus.FOCUSEDOUT;
      const result = AnswerStatusDatabaseAdapter.toSQLString(answerStatus);
      expect(result).to.equals('focusedOut');
    });

    it('should convert AnswerStatus.SKIPPED to "aband"', function () {
      const answerStatus = AnswerStatus.SKIPPED;
      const result = AnswerStatusDatabaseAdapter.toSQLString(answerStatus);
      expect(result).to.equals('aband');
    });

    it('should convert AnswerStatus.UNIMPLEMENTED to "unimplemented"', function () {
      const answerStatus = AnswerStatus.UNIMPLEMENTED;
      const result = AnswerStatusDatabaseAdapter.toSQLString(answerStatus);
      expect(result).to.equals('unimplemented');
    });
  });

  describe('#fromSQLString', function () {
    it('should convert "ok" to AnswerStatus.OK', function () {
      const answerStatusString = 'ok';
      const result = AnswerStatusDatabaseAdapter.fromSQLString(answerStatusString);
      expect(result.isOK()).to.be.true;
    });

    it('should convert "ko" to AnswerStatus.KO', function () {
      const answerStatusString = 'ko';
      const result = AnswerStatusDatabaseAdapter.fromSQLString(answerStatusString);
      expect(result.isKO()).to.be.true;
    });

    it('should convert "partially" to AnswerStatus.PARTIALLY', function () {
      const answerStatusString = 'partially';
      const result = AnswerStatusDatabaseAdapter.fromSQLString(answerStatusString);
      expect(result.isPARTIALLY()).to.be.true;
    });

    it('should convert "timedout" to AnswerStatus.TIMEDOUT', function () {
      const answerStatusString = 'timedout';
      const result = AnswerStatusDatabaseAdapter.fromSQLString(answerStatusString);
      expect(result.isTIMEDOUT()).to.be.true;
    });

    it('should convert "focusedOut" to AnswerStatus.FOCUSEDOUT', function () {
      const answerStatusString = 'focusedOut';
      const result = AnswerStatusDatabaseAdapter.fromSQLString(answerStatusString);
      expect(result.isFOCUSEDOUT()).to.be.true;
    });

    it('should convert "aband" to AnswerStatus.SKIPPED', function () {
      const answerStatusString = 'aband';
      const result = AnswerStatusDatabaseAdapter.fromSQLString(answerStatusString);
      expect(result.isSKIPPED()).to.be.true;
    });

    it('should convert "unimplemented" to AnswerStatus.UNIMPLEMENTED', function () {
      const answerStatusString = 'unimplemented';
      const result = AnswerStatusDatabaseAdapter.fromSQLString(answerStatusString);
      expect(result.isUNIMPLEMENTED()).to.be.true;
    });
  });
});
