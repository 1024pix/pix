import { expect } from '../../../test-helper';
import { isValidDate, convertDateValue } from '../../../../lib/infrastructure/utils/date-utils';

describe('Unit | Utils | date-utils', function () {
  describe('#isValidDate', function () {
    describe('Valid cases', function () {
      it('should accept a valid date only string with format YYYY-MM-DD', function () {
        expect(isValidDate('2008-05-13', 'YYYY-MM-DD')).to.be.true;
      });

      it('should accept a date object', function () {
        expect(isValidDate(new Date(), 'YYYY-MM-DD')).to.be.true;
      });
    });

    describe('Invalid cases', function () {
      it('should NOT accept a date with impossible day values', function () {
        expect(isValidDate('2008-02-31', 'YYYY-MM-DD')).to.be.false;
      });

      it('should NOT accept a datetime string', function () {
        expect(isValidDate('2008-05-13T00:00:00Z', 'YYYY-MM-DD')).to.be.false;
      });

      it('should NOT accept a date without day', function () {
        expect(isValidDate('2008-05', 'YYYY-MM-DD')).to.be.false;
      });

      it('should NOT accept a date without month and day', function () {
        expect(isValidDate('2008', 'YYYY-MM-DD')).to.be.false;
      });

      it('should NOT accept any string starting with a number', function () {
        expect(isValidDate('2not a date', 'YYYY-MM-DD')).to.be.false;
      });

      it('should NOT accept an invalid formated date string', function () {
        expect(isValidDate('13/05/2008', 'YYYY-MM-DD')).to.be.false;
      });

      it('should NOT accept an invalid date string', function () {
        expect(isValidDate('Not a date', 'YYYY-MM-DD')).to.be.false;
      });

      it('should NOT accept a null value', function () {
        expect(isValidDate(null, 'YYYY-MM-DD')).to.be.false;
      });

      it('should NOT accept a undefined value', function () {
        expect(isValidDate(undefined, 'YYYY-MM-DD')).to.be.false;
      });
    });
  });

  describe('#convertDateValue', function () {
    context('when alternativeInputFormat does not exist', function () {
      context('when dateValue does not match inputFormat', function () {
        it('should return null', function () {
          expect(
            convertDateValue({ dateString: '1980-05-05', inputFormat: 'DD/MM/YYYY', outputFormat: 'YYYY-MM-DD' })
          ).to.be.null;
        });
      });

      context('when dateValue matches inputFormat', function () {
        it('should return converted date', function () {
          expect(
            convertDateValue({ dateString: '05/05/1980', inputFormat: 'DD/MM/YYYY', outputFormat: 'YYYY-MM-DD' })
          ).to.equal('1980-05-05');
        });
      });
    });

    context('when alternativeInputFormat exists', function () {
      context('when dateValue does not match nor inputFormat, nor alternativeInputFormat', function () {
        it('should return null', function () {
          expect(
            convertDateValue({
              dateString: '1980-05-05',
              inputFormat: 'DD/MM/YYYY',
              alternativeInputFormat: 'DD/MM/YY',
              outputFormat: 'YYYY-MM-DD',
            })
          ).to.be.null;
        });
      });

      context('when dateValue matches inputFormat', function () {
        it('should return converted date', function () {
          expect(
            convertDateValue({
              dateString: '05/05/1980',
              inputFormat: 'DD/MM/YYYY',
              alternativeInputFormat: 'DD/MM/YY',
              outputFormat: 'YYYY-MM-DD',
            })
          ).to.equal('1980-05-05');
        });
      });

      context('when dateValue matches alternativeInputFormat with 2 digits year', function () {
        it('should return converted date with year 2000 if input year < the current year', function () {
          const currentYear = new Date().getFullYear();
          const currentTwoDigitYear = currentYear - 2000;
          const inputDate = '05/05/' + (currentTwoDigitYear - 1);
          const expectedDate = currentYear - 1 + '-05-05';
          expect(
            convertDateValue({
              dateString: inputDate,
              inputFormat: 'DD/MM/YYYY',
              alternativeInputFormat: 'DD/MM/YY',
              outputFormat: 'YYYY-MM-DD',
            })
          ).to.equal(expectedDate);
        });

        it('should return converted date with year 1900 if input year >= the current year', function () {
          const currentYear = new Date().getFullYear();
          const currentTwoDigitYear = currentYear - 2000;
          const inputDate = '05/05/' + currentTwoDigitYear;
          const expectedDate = 1900 + currentTwoDigitYear + '-05-05';
          expect(
            convertDateValue({
              dateString: inputDate,
              inputFormat: 'DD/MM/YYYY',
              alternativeInputFormat: 'DD/MM/YY',
              outputFormat: 'YYYY-MM-DD',
            })
          ).to.equal(expectedDate);
        });
      });
    });
  });
});
