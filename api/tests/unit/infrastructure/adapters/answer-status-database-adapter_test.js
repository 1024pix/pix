const AnswerStatusDatabaseAdapter = require('../../../../lib/infrastructure/adapters/answer-status-database-adapter');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');

const { expect } = require('chai');

describe('AnswerStatusDatabaseAdapter', () => {

  describe('#adapt', () => {

    it('should convert AnswerStatus.OK to "ok"', () => {
      const answerStatus = AnswerStatus.OK;
      const result = AnswerStatusDatabaseAdapter.adapt(answerStatus);
      expect(result).to.equals('ok');
    });

    it('should convert AnswerStatus.KO to "ko"', () => {
      const answerStatus = AnswerStatus.KO;
      const result = AnswerStatusDatabaseAdapter.adapt(answerStatus);
      expect(result).to.equals('ko');
    });

    it('should convert AnswerStatus.PARTIALLY to "partially"', () => {
      const answerStatus = AnswerStatus.PARTIALLY;
      const result = AnswerStatusDatabaseAdapter.adapt(answerStatus);
      expect(result).to.equals('partially');
    });

    it('should convert AnswerStatus.TIMEDOUT to "timedout"', () => {
      const answerStatus = AnswerStatus.TIMEDOUT;
      const result = AnswerStatusDatabaseAdapter.adapt(answerStatus);
      expect(result).to.equals('timedout');
    });

    it('should convert AnswerStatus.SKIPPED to "aband"', () => {
      const answerStatus = AnswerStatus.SKIPPED;
      const result = AnswerStatusDatabaseAdapter.adapt(answerStatus);
      expect(result).to.equals('aband');
    });

    it('should convert AnswerStatus.UNIMPLEMENTED to "unimplemented"', () => {
      const answerStatus = AnswerStatus.UNIMPLEMENTED;
      const result = AnswerStatusDatabaseAdapter.adapt(answerStatus);
      expect(result).to.equals('unimplemented');
    });

  });

  describe('#toSQLString', () => {

    it('should convert AnswerStatus.OK to "ok"', () => {
      const answerStatus = AnswerStatus.OK;
      const result = AnswerStatusDatabaseAdapter.toSQLString(answerStatus);
      expect(result).to.equals('ok');
    });

    it('should convert AnswerStatus.KO to "ko"', () => {
      const answerStatus = AnswerStatus.KO;
      const result = AnswerStatusDatabaseAdapter.toSQLString(answerStatus);
      expect(result).to.equals('ko');
    });

    it('should convert AnswerStatus.PARTIALLY to "partially"', () => {
      const answerStatus = AnswerStatus.PARTIALLY;
      const result = AnswerStatusDatabaseAdapter.toSQLString(answerStatus);
      expect(result).to.equals('partially');
    });

    it('should convert AnswerStatus.TIMEDOUT to "timedout"', () => {
      const answerStatus = AnswerStatus.TIMEDOUT;
      const result = AnswerStatusDatabaseAdapter.toSQLString(answerStatus);
      expect(result).to.equals('timedout');
    });

    it('should convert AnswerStatus.SKIPPED to "aband"', () => {
      const answerStatus = AnswerStatus.SKIPPED;
      const result = AnswerStatusDatabaseAdapter.toSQLString(answerStatus);
      expect(result).to.equals('aband');
    });

    it('should convert AnswerStatus.UNIMPLEMENTED to "unimplemented"', () => {
      const answerStatus = AnswerStatus.UNIMPLEMENTED;
      const result = AnswerStatusDatabaseAdapter.toSQLString(answerStatus);
      expect(result).to.equals('unimplemented');
    });
  });

  describe('#fromSQLString', () => {

    it('should convert "ok" to AnswerStatus.OK', () => {
      const answerStatusString = 'ok';
      const result = AnswerStatusDatabaseAdapter.fromSQLString(answerStatusString);
      expect(result.isOK()).to.be.true;
    });

    it('should convert "ko" to AnswerStatus.KO', () => {
      const answerStatusString = 'ko';
      const result = AnswerStatusDatabaseAdapter.fromSQLString(answerStatusString);
      expect(result.isKO()).to.be.true;
    });

    it('should convert "partially" to AnswerStatus.PARTIALLY', () => {
      const answerStatusString = 'partially';
      const result = AnswerStatusDatabaseAdapter.fromSQLString(answerStatusString);
      expect(result.isPARTIALLY()).to.be.true;
    });

    it('should convert "timedout" to AnswerStatus.TIMEDOUT', () => {
      const answerStatusString = 'timedout';
      const result = AnswerStatusDatabaseAdapter.fromSQLString(answerStatusString);
      expect(result.isTIMEDOUT()).to.be.true;
    });

    it('should convert "aband" to AnswerStatus.SKIPPED', () => {
      const answerStatusString = 'aband';
      const result = AnswerStatusDatabaseAdapter.fromSQLString(answerStatusString);
      expect(result.isSKIPPED()).to.be.true;
    });

    it('should convert "unimplemented" to AnswerStatus.UNIMPLEMENTED', () => {
      const answerStatusString = 'unimplemented';
      const result = AnswerStatusDatabaseAdapter.fromSQLString(answerStatusString);
      expect(result.isUNIMPLEMENTED()).to.be.true;
    });
  });
});
