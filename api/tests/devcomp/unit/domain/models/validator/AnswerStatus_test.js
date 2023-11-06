import chai from 'chai';
import { AnswerStatus } from '../../../../../../src/devcomp/domain/models/validator/AnswerStatus.js';

const { expect } = chai;

describe('Unit | Devcomp | Domain | Models | AnswerStatus', function () {
  context('AnswerStatus#isOK', function () {
    it('should be true with AnswerStatus.OK', function () {
      expect(AnswerStatus.OK.isOK()).to.be.true;
    });

    it('should be false with AnswerStatuses KO', function () {
      expect(AnswerStatus.KO.isOK()).to.be.false;
    });
  });

  context('AnswerStatus#isKO', function () {
    it('should be true with AnswerStatus.KO', function () {
      expect(AnswerStatus.KO.isKO()).to.be.true;
    });

    it('should be false with AnswerStatuses OK', function () {
      expect(AnswerStatus.OK.isKO()).to.be.false;
      expect(AnswerStatus.UNIMPLEMENTED.isKO()).to.be.false;
    });
  });

  context('AnswerStatus#isUNIMPLEMENTED', function () {
    it('should be true with AnswerStatus.UNIMPLEMENTED', function () {
      expect(AnswerStatus.UNIMPLEMENTED.isUNIMPLEMENTED()).to.be.true;
    });

    it('should be false with AnswerStatuses OK, KO, SKIPPED, PARTIALLY, FOCUSEDOUT and TIMEDOUT', function () {
      expect(AnswerStatus.OK.isUNIMPLEMENTED()).to.be.false;
      expect(AnswerStatus.KO.isUNIMPLEMENTED()).to.be.false;
    });
  });

  context('AnswerStatus#isFailed', function () {
    it('should be false with AnswerStatus.OK', function () {
      expect(AnswerStatus.OK.isFailed()).to.be.false;
    });

    it('should be true with AnswerStatuses KO', function () {
      expect(AnswerStatus.KO.isFailed()).to.be.true;
      expect(AnswerStatus.UNIMPLEMENTED.isFailed()).to.be.true;
    });
  });
});
