const { expect } = require('../../../test-helper');
const { isValidDate, convertDateValue } = require('../../../../lib/infrastructure/utils/date-utils');

describe('Unit | Utils | date-utils', () => {

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

    context('when alternativeInputFormat does not exist', () => {

      context('when dateValue does not match inputFormat', () => {
        it('should return null', () => {
          expect(convertDateValue({ dateString: '1980-05-05', inputFormat: 'DD/MM/YYYY', outputFormat: 'YYYY-MM-DD' })).to.be.null;
        });
      });

      context('when dateValue matches inputFormat', () => {
        it('should return converted date', () => {
          expect(convertDateValue({ dateString: '05/05/1980', inputFormat: 'DD/MM/YYYY', outputFormat: 'YYYY-MM-DD' })).to.equal('1980-05-05');
        });
      });
    });

    context('when alternativeInputFormat exists', () => {

      context('when dateValue does not match nor inputFormat, nor alternativeInputFormat', () => {
        it('should return null', () => {
          expect(convertDateValue({ dateString: '1980-05-05', inputFormat: 'DD/MM/YYYY', alternativeInputFormat: 'DD/MM/YY', outputFormat: 'YYYY-MM-DD' })).to.be.null;
        });
      });

      context('when dateValue matches inputFormat', () => {
        it('should return converted date', () => {
          expect(convertDateValue({ dateString: '05/05/1980', inputFormat: 'DD/MM/YYYY', alternativeInputFormat: 'DD/MM/YY', outputFormat: 'YYYY-MM-DD' })).to.equal('1980-05-05');
        });
      });

      context('when dateValue matches alternativeInputFormat with 2 digits year', () => {
        it('should return converted date with year 2000 if input year < the current year', () => {
          const currentYear = new Date().getFullYear();
          const currentTwoDigitYear = currentYear - 2000;
          const inputDate = '05/05/' + (currentTwoDigitYear - 1);
          const expectedDate = (currentYear - 1) + '-05-05';
          expect(convertDateValue({ dateString: inputDate, inputFormat: 'DD/MM/YYYY', alternativeInputFormat: 'DD/MM/YY', outputFormat: 'YYYY-MM-DD' })).to.equal(expectedDate);
        });

        it('should return converted date with year 1900 if input year >= the current year', () => {
          const currentYear = new Date().getFullYear();
          const currentTwoDigitYear = currentYear - 2000;
          const inputDate = '05/05/' + currentTwoDigitYear;
          const expectedDate = (1900 + currentTwoDigitYear) + '-05-05';
          expect(convertDateValue({ dateString: inputDate, inputFormat: 'DD/MM/YYYY', alternativeInputFormat: 'DD/MM/YY', outputFormat: 'YYYY-MM-DD' })).to.equal(expectedDate);
        });
      });
    });
  });
});
