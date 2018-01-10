
const { expect } = require('chai');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');

describe('AnswerStatus', () => {

  context('AnswerStatus#isOK', () => {
    it('should be true with AnswerStatus.OK', () => {
      expect(AnswerStatus.OK.isOK()).to.be.true;
    });

    it('should be false with AnswerStatuses KO, SKIPPED, PARTIALLY, TIMEDOUT, and UNIMPLEMENTED', () => {
      expect(AnswerStatus.KO.isOK()).to.be.false;
      expect(AnswerStatus.SKIPPED.isOK()).to.be.false;
      expect(AnswerStatus.PARTIALLY.isOK()).to.be.false;
      expect(AnswerStatus.TIMEDOUT.isOK()).to.be.false;
      expect(AnswerStatus.UNIMPLEMENTED.isOK()).to.be.false;
    });
  });

  context('AnswerStatus#isKO', () => {
    it('should be true with AnswerStatus.KO', () => {
      expect(AnswerStatus.KO.isKO()).to.be.true;
    });

    it('should be false with AnswerStatuses OK, SKIPPED, PARTIALLY, TIMEDOUT, and UNIMPLEMENTED', () => {
      expect(AnswerStatus.OK.isKO()).to.be.false;
      expect(AnswerStatus.SKIPPED.isKO()).to.be.false;
      expect(AnswerStatus.PARTIALLY.isKO()).to.be.false;
      expect(AnswerStatus.TIMEDOUT.isKO()).to.be.false;
      expect(AnswerStatus.UNIMPLEMENTED.isKO()).to.be.false;
    });
  });

  context('AnswerStatus#isSKIPPED', () => {
    it('should be true with AnswerStatus.SKIPPED', () => {
      expect(AnswerStatus.SKIPPED.isSKIPPED()).to.be.true;
    });

    it('should be false with AnswerStatuses OK, KO, PARTIALLY, TIMEDOUT, and UNIMPLEMENTED', () => {
      expect(AnswerStatus.OK.isSKIPPED()).to.be.false;
      expect(AnswerStatus.KO.isSKIPPED()).to.be.false;
      expect(AnswerStatus.PARTIALLY.isSKIPPED()).to.be.false;
      expect(AnswerStatus.TIMEDOUT.isSKIPPED()).to.be.false;
      expect(AnswerStatus.UNIMPLEMENTED.isSKIPPED()).to.be.false;
    });
  });

  context('AnswerStatus#isPARTIALLY', () => {
    it('should be true with AnswerStatus.PARTIALLY', () => {
      expect(AnswerStatus.PARTIALLY.isPARTIALLY()).to.be.true;
    });

    it('should be false with AnswerStatuses OK, KO, SKIPPED, TIMEDOUT, and UNIMPLEMENTED', () => {
      expect(AnswerStatus.OK.isPARTIALLY()).to.be.false;
      expect(AnswerStatus.KO.isPARTIALLY()).to.be.false;
      expect(AnswerStatus.SKIPPED.isPARTIALLY()).to.be.false;
      expect(AnswerStatus.TIMEDOUT.isPARTIALLY()).to.be.false;
      expect(AnswerStatus.UNIMPLEMENTED.isPARTIALLY()).to.be.false;
    });
  });

  context('AnswerStatus#isTIMEDOUT', () => {
    it('should be true with AnswerStatus.TIMEDOUT', () => {
      expect(AnswerStatus.TIMEDOUT.isTIMEDOUT()).to.be.true;
    });

    it('should be false with AnswerStatuses OK, KO, SKIPPED, PARTIALLY, and UNIMPLEMENTED', () => {
      expect(AnswerStatus.OK.isTIMEDOUT()).to.be.false;
      expect(AnswerStatus.KO.isTIMEDOUT()).to.be.false;
      expect(AnswerStatus.SKIPPED.isTIMEDOUT()).to.be.false;
      expect(AnswerStatus.PARTIALLY.isTIMEDOUT()).to.be.false;
      expect(AnswerStatus.UNIMPLEMENTED.isTIMEDOUT()).to.be.false;
    });
  });

  context('AnswerStatus#isUNIMPLEMENTED', () => {
    it('should be true with AnswerStatus.UNIMPLEMENTED', () => {
      expect(AnswerStatus.UNIMPLEMENTED.isUNIMPLEMENTED()).to.be.true;
    });

    it('should be false with AnswerStatuses OK, KO, SKIPPED, PARTIALLY, and TIMEDOUT', () => {
      expect(AnswerStatus.OK.isUNIMPLEMENTED()).to.be.false;
      expect(AnswerStatus.KO.isUNIMPLEMENTED()).to.be.false;
      expect(AnswerStatus.SKIPPED.isUNIMPLEMENTED()).to.be.false;
      expect(AnswerStatus.PARTIALLY.isUNIMPLEMENTED()).to.be.false;
      expect(AnswerStatus.TIMEDOUT.isUNIMPLEMENTED()).to.be.false;
    });
  });

  context('AnswerStatus#isFailed', () => {
    it('should be false with AnswerStatus.OK', () => {
      expect(AnswerStatus.OK.isFailed()).to.be.false;
    });

    it('should be true with AnswerStatuses KO, SKIPPED, PARTIALLY, TIMEDOUT, and UNIMPLEMENTED', () => {
      expect(AnswerStatus.KO.isFailed()).to.be.true;
      expect(AnswerStatus.SKIPPED.isFailed()).to.be.true;
      expect(AnswerStatus.PARTIALLY.isFailed()).to.be.true;
      expect(AnswerStatus.TIMEDOUT.isFailed()).to.be.true;
      expect(AnswerStatus.UNIMPLEMENTED.isFailed()).to.be.true;
    });
  });

});
