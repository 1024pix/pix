import { AnswerStatus } from '../../../../../src/shared/domain/models/AnswerStatus.js';
import { expect } from '../../../../test-helper.js';

describe('AnswerStatus', function () {
  context('AnswerStatus#isOK', function () {
    it('should be true with AnswerStatus.OK', function () {
      expect(AnswerStatus.OK.isOK()).to.be.true;
    });

    it('should be false with AnswerStatuses KO, SKIPPED, TIMEDOUT, FOCUSEDOUT and UNIMPLEMENTED', function () {
      expect(AnswerStatus.KO.isOK()).to.be.false;
      expect(AnswerStatus.SKIPPED.isOK()).to.be.false;
      expect(AnswerStatus.TIMEDOUT.isOK()).to.be.false;
      expect(AnswerStatus.FOCUSEDOUT.isOK()).to.be.false;
      expect(AnswerStatus.UNIMPLEMENTED.isOK()).to.be.false;
    });
  });

  context('AnswerStatus#isKO', function () {
    it('should be true with AnswerStatus.KO', function () {
      expect(AnswerStatus.KO.isKO()).to.be.true;
    });

    it('should be false with AnswerStatuses OK, SKIPPED, TIMEDOUT, FOCUSEDOUT and UNIMPLEMENTED', function () {
      expect(AnswerStatus.OK.isKO()).to.be.false;
      expect(AnswerStatus.SKIPPED.isKO()).to.be.false;
      expect(AnswerStatus.TIMEDOUT.isKO()).to.be.false;
      expect(AnswerStatus.FOCUSEDOUT.isKO()).to.be.false;
      expect(AnswerStatus.UNIMPLEMENTED.isKO()).to.be.false;
    });
  });

  context('AnswerStatus#isSKIPPED', function () {
    it('should be true with AnswerStatus.SKIPPED', function () {
      expect(AnswerStatus.SKIPPED.isSKIPPED()).to.be.true;
    });

    it('should be false with AnswerStatuses OK, KO, TIMEDOUT, FOCUSEDOUT and UNIMPLEMENTED', function () {
      expect(AnswerStatus.OK.isSKIPPED()).to.be.false;
      expect(AnswerStatus.KO.isSKIPPED()).to.be.false;
      expect(AnswerStatus.TIMEDOUT.isSKIPPED()).to.be.false;
      expect(AnswerStatus.FOCUSEDOUT.isSKIPPED()).to.be.false;
      expect(AnswerStatus.UNIMPLEMENTED.isSKIPPED()).to.be.false;
    });
  });

  context('AnswerStatus#isTIMEDOUT', function () {
    it('should be true with AnswerStatus.TIMEDOUT', function () {
      expect(AnswerStatus.TIMEDOUT.isTIMEDOUT()).to.be.true;
    });

    it('should be false with AnswerStatuses OK, KO, SKIPPED, FOCUSEDOUT and UNIMPLEMENTED', function () {
      expect(AnswerStatus.OK.isTIMEDOUT()).to.be.false;
      expect(AnswerStatus.KO.isTIMEDOUT()).to.be.false;
      expect(AnswerStatus.SKIPPED.isTIMEDOUT()).to.be.false;
      expect(AnswerStatus.FOCUSEDOUT.isTIMEDOUT()).to.be.false;
      expect(AnswerStatus.UNIMPLEMENTED.isTIMEDOUT()).to.be.false;
    });
  });

  context('AnswerStatus#isUNIMPLEMENTED', function () {
    it('should be true with AnswerStatus.UNIMPLEMENTED', function () {
      expect(AnswerStatus.UNIMPLEMENTED.isUNIMPLEMENTED()).to.be.true;
    });

    it('should be false with AnswerStatuses OK, KO, SKIPPED, FOCUSEDOUT and TIMEDOUT', function () {
      expect(AnswerStatus.OK.isUNIMPLEMENTED()).to.be.false;
      expect(AnswerStatus.KO.isUNIMPLEMENTED()).to.be.false;
      expect(AnswerStatus.SKIPPED.isUNIMPLEMENTED()).to.be.false;
      expect(AnswerStatus.TIMEDOUT.isUNIMPLEMENTED()).to.be.false;
      expect(AnswerStatus.FOCUSEDOUT.isUNIMPLEMENTED()).to.be.false;
    });
  });

  context('AnswerStatus#isFailed', function () {
    it('should be false with AnswerStatus.OK', function () {
      expect(AnswerStatus.OK.isFailed()).to.be.false;
    });

    it('should be true with AnswerStatuses KO, SKIPPED, TIMEDOUT, FOCUSEDOUT and UNIMPLEMENTED', function () {
      expect(AnswerStatus.KO.isFailed()).to.be.true;
      expect(AnswerStatus.SKIPPED.isFailed()).to.be.true;
      expect(AnswerStatus.TIMEDOUT.isFailed()).to.be.true;
      expect(AnswerStatus.FOCUSEDOUT.isFailed()).to.be.true;
      expect(AnswerStatus.UNIMPLEMENTED.isFailed()).to.be.true;
    });
  });

  context('AnswerStatus#isFOCUSEDOUT', function () {
    it('should be true with AnswerStatus.FOCUSEDOUT', function () {
      expect(AnswerStatus.FOCUSEDOUT.isFOCUSEDOUT()).to.be.true;
    });

    it('should be false with AnswerStatuses OK, KO, SKIPPED, TIMEDOUT and UNIMPLEMENTED', function () {
      expect(AnswerStatus.OK.isFOCUSEDOUT()).to.be.false;
      expect(AnswerStatus.KO.isFOCUSEDOUT()).to.be.false;
      expect(AnswerStatus.SKIPPED.isFOCUSEDOUT()).to.be.false;
      expect(AnswerStatus.TIMEDOUT.isFOCUSEDOUT()).to.be.false;
      expect(AnswerStatus.UNIMPLEMENTED.isFOCUSEDOUT()).to.be.false;
    });
  });
});
