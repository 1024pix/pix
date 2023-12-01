import chai from 'chai';

const { expect } = chai;

import { AnswerStatus } from '../../../../src/school/domain/models/AnswerStatus.js';

describe('AnswerStatus', function () {
  context('AnswerStatus#isOK', function () {
    it('should be true with AnswerStatus.OK', function () {
      expect(AnswerStatus.OK.isOK()).to.be.true;
    });

    it('should be false with AnswerStatuses KO, SKIPPED, PARTIALLY, TIMEDOUT, FOCUSEDOUT and UNIMPLEMENTED', function () {
      expect(AnswerStatus.KO.isOK()).to.be.false;
      expect(AnswerStatus.SKIPPED.isOK()).to.be.false;
      expect(AnswerStatus.PARTIALLY.isOK()).to.be.false;
      expect(AnswerStatus.TIMEDOUT.isOK()).to.be.false;
      expect(AnswerStatus.FOCUSEDOUT.isOK()).to.be.false;
      expect(AnswerStatus.UNIMPLEMENTED.isOK()).to.be.false;
    });
  });

  context('AnswerStatus#isKO', function () {
    it('should be true with AnswerStatus.KO', function () {
      expect(AnswerStatus.KO.isKO()).to.be.true;
    });

    it('should be false with AnswerStatuses OK, SKIPPED, PARTIALLY, TIMEDOUT, FOCUSEDOUT and UNIMPLEMENTED', function () {
      expect(AnswerStatus.OK.isKO()).to.be.false;
      expect(AnswerStatus.SKIPPED.isKO()).to.be.false;
      expect(AnswerStatus.PARTIALLY.isKO()).to.be.false;
      expect(AnswerStatus.TIMEDOUT.isKO()).to.be.false;
      expect(AnswerStatus.FOCUSEDOUT.isKO()).to.be.false;
      expect(AnswerStatus.UNIMPLEMENTED.isKO()).to.be.false;
    });
  });

  context('AnswerStatus#isSKIPPED', function () {
    it('should be true with AnswerStatus.SKIPPED', function () {
      expect(AnswerStatus.SKIPPED.isSKIPPED()).to.be.true;
    });

    it('should be false with AnswerStatuses OK, KO, PARTIALLY, TIMEDOUT, FOCUSEDOUT and UNIMPLEMENTED', function () {
      expect(AnswerStatus.OK.isSKIPPED()).to.be.false;
      expect(AnswerStatus.KO.isSKIPPED()).to.be.false;
      expect(AnswerStatus.PARTIALLY.isSKIPPED()).to.be.false;
      expect(AnswerStatus.TIMEDOUT.isSKIPPED()).to.be.false;
      expect(AnswerStatus.FOCUSEDOUT.isSKIPPED()).to.be.false;
      expect(AnswerStatus.UNIMPLEMENTED.isSKIPPED()).to.be.false;
    });
  });

  context('AnswerStatus#isPARTIALLY', function () {
    it('should be true with AnswerStatus.PARTIALLY', function () {
      expect(AnswerStatus.PARTIALLY.isPARTIALLY()).to.be.true;
    });

    it('should be false with AnswerStatuses OK, KO, SKIPPED, TIMEDOUT, FOCUSEDOUTand UNIMPLEMENTED', function () {
      expect(AnswerStatus.OK.isPARTIALLY()).to.be.false;
      expect(AnswerStatus.KO.isPARTIALLY()).to.be.false;
      expect(AnswerStatus.SKIPPED.isPARTIALLY()).to.be.false;
      expect(AnswerStatus.TIMEDOUT.isPARTIALLY()).to.be.false;
      expect(AnswerStatus.FOCUSEDOUT.isPARTIALLY()).to.be.false;
      expect(AnswerStatus.UNIMPLEMENTED.isPARTIALLY()).to.be.false;
    });
  });

  context('AnswerStatus#isTIMEDOUT', function () {
    it('should be true with AnswerStatus.TIMEDOUT', function () {
      expect(AnswerStatus.TIMEDOUT.isTIMEDOUT()).to.be.true;
    });

    it('should be false with AnswerStatuses OK, KO, SKIPPED, PARTIALLY, FOCUSEDOUT and UNIMPLEMENTED', function () {
      expect(AnswerStatus.OK.isTIMEDOUT()).to.be.false;
      expect(AnswerStatus.KO.isTIMEDOUT()).to.be.false;
      expect(AnswerStatus.SKIPPED.isTIMEDOUT()).to.be.false;
      expect(AnswerStatus.PARTIALLY.isTIMEDOUT()).to.be.false;
      expect(AnswerStatus.FOCUSEDOUT.isTIMEDOUT()).to.be.false;
      expect(AnswerStatus.UNIMPLEMENTED.isTIMEDOUT()).to.be.false;
    });
  });

  context('AnswerStatus#isUNIMPLEMENTED', function () {
    it('should be true with AnswerStatus.UNIMPLEMENTED', function () {
      expect(AnswerStatus.UNIMPLEMENTED.isUNIMPLEMENTED()).to.be.true;
    });

    it('should be false with AnswerStatuses OK, KO, SKIPPED, PARTIALLY, FOCUSEDOUT and TIMEDOUT', function () {
      expect(AnswerStatus.OK.isUNIMPLEMENTED()).to.be.false;
      expect(AnswerStatus.KO.isUNIMPLEMENTED()).to.be.false;
      expect(AnswerStatus.SKIPPED.isUNIMPLEMENTED()).to.be.false;
      expect(AnswerStatus.PARTIALLY.isUNIMPLEMENTED()).to.be.false;
      expect(AnswerStatus.TIMEDOUT.isUNIMPLEMENTED()).to.be.false;
      expect(AnswerStatus.FOCUSEDOUT.isUNIMPLEMENTED()).to.be.false;
    });
  });

  context('AnswerStatus#isFailed', function () {
    it('should be false with AnswerStatus.OK', function () {
      expect(AnswerStatus.OK.isFailed()).to.be.false;
    });

    it('should be true with AnswerStatuses KO, SKIPPED, PARTIALLY, TIMEDOUT, FOCUSEDOUT and UNIMPLEMENTED', function () {
      expect(AnswerStatus.KO.isFailed()).to.be.true;
      expect(AnswerStatus.SKIPPED.isFailed()).to.be.true;
      expect(AnswerStatus.PARTIALLY.isFailed()).to.be.true;
      expect(AnswerStatus.TIMEDOUT.isFailed()).to.be.true;
      expect(AnswerStatus.FOCUSEDOUT.isFailed()).to.be.true;
      expect(AnswerStatus.UNIMPLEMENTED.isFailed()).to.be.true;
    });
  });

  context('AnswerStatus#isFOCUSEDOUT', function () {
    it('should be true with AnswerStatus.FOCUSEDOUT', function () {
      expect(AnswerStatus.FOCUSEDOUT.isFOCUSEDOUT()).to.be.true;
    });

    it('should be false with AnswerStatuses OK, KO, SKIPPED, PARTIALLY, TIMEDOUT and UNIMPLEMENTED', function () {
      expect(AnswerStatus.OK.isFOCUSEDOUT()).to.be.false;
      expect(AnswerStatus.KO.isFOCUSEDOUT()).to.be.false;
      expect(AnswerStatus.SKIPPED.isFOCUSEDOUT()).to.be.false;
      expect(AnswerStatus.PARTIALLY.isFOCUSEDOUT()).to.be.false;
      expect(AnswerStatus.TIMEDOUT.isFOCUSEDOUT()).to.be.false;
      expect(AnswerStatus.UNIMPLEMENTED.isFOCUSEDOUT()).to.be.false;
    });
  });
});
