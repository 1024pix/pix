const { expect } = require('../../../test-helper');
const { isValidDate } = require('../../../../lib/infrastructure/utils/date-utils');

describe('Unit | Utils | date-utils', () => {

  describe('#isValidDate', () => {

    describe('Valid cases', () => {

      it('should accept a valid date only string', () => {
        expect(isValidDate('2008-05-13')).to.be.true;
      });

    });

    describe('Invalid cases', () => {

      it('should NOT accept a date with impossible day values', () => {
        expect(isValidDate('2008-02-31')).to.be.false;
      });

      it('should NOT accept a datetime string', () => {
        expect(isValidDate('2008-05-13T00:00:00Z')).to.be.false;
      });

      it('should NOT accept a date without day', () => {
        expect(isValidDate('2008-05')).to.be.false;
      });

      it('should NOT accept a date without month and day', () => {
        expect(isValidDate('2008')).to.be.false;
      });

      it('should NOT accept any string starting with a number', () => {
        expect(isValidDate('2not a date')).to.be.false;
      });

      it('should NOT accept an invalid formated date string', () => {
        expect(isValidDate('13/05/2008')).to.be.false;
      });

      it('should NOT accept an invalid date string', () => {
        expect(isValidDate('Not a date')).to.be.false;
      });

    });

  });

});
