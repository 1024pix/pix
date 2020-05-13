const { expect } = require('../../../test-helper');
const { isValidDate, convertDateValue } = require('../../../../lib/infrastructure/utils/date-utils');

describe('Unit | Utils | date-response-objects', () => {

  describe('#isValidDate', () => {

    describe('Valid cases', () => {

      it('should accept a valid date only string with format YYYY-MM-DD', () => {
        expect(isValidDate('2008-05-13', 'YYYY-MM-DD')).to.be.true;
      });

      it('should accept a date object', () => {
        expect(isValidDate(new Date(), 'YYYY-MM-DD')).to.be.true;
      });

    });

    describe('Invalid cases', () => {

      it('should NOT accept a date with impossible day values', () => {
        expect(isValidDate('2008-02-31', 'YYYY-MM-DD')).to.be.false;
      });

      it('should NOT accept a datetime string', () => {
        expect(isValidDate('2008-05-13T00:00:00Z', 'YYYY-MM-DD')).to.be.false;
      });

      it('should NOT accept a date without day', () => {
        expect(isValidDate('2008-05', 'YYYY-MM-DD')).to.be.false;
      });

      it('should NOT accept a date without month and day', () => {
        expect(isValidDate('2008', 'YYYY-MM-DD')).to.be.false;
      });

      it('should NOT accept any string starting with a number', () => {
        expect(isValidDate('2not a date', 'YYYY-MM-DD')).to.be.false;
      });

      it('should NOT accept an invalid formated date string', () => {
        expect(isValidDate('13/05/2008', 'YYYY-MM-DD')).to.be.false;
      });

      it('should NOT accept an invalid date string', () => {
        expect(isValidDate('Not a date', 'YYYY-MM-DD')).to.be.false;
      });

      it('should NOT accept a null value', () => {
        expect(isValidDate(null, 'YYYY-MM-DD')).to.be.false;
      });

      it('should NOT accept a undefined value', () => {
        expect(isValidDate(undefined, 'YYYY-MM-DD')).to.be.false;
      });

    });

  });

  describe('#convertDateValue', () => {

    context('when dateValue does not match inputFormat', () => {

      it('should return null', () => {
        expect(convertDateValue('1980-05-05', 'DD/MM/YYYY', 'YYYY-MM-DD')).to.be.null;
      });
    });

    context('when dateValue matches inputFormat', () => {

      it('should return null', () => {
        expect(convertDateValue('05/05/1980', 'DD/MM/YYYY', 'YYYY-MM-DD')).to.equal('1980-05-05');
      });
    });
  });

});
