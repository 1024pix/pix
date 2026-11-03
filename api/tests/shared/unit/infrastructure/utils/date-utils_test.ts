import { expect } from 'chai';

import {
  anonymizeGeneralizeDate,
  convertDateValue,
  dayBounds,
  getDatesOneYearEarlier,
  isValidDate,
  toDay,
} from '../../../../../src/shared/infrastructure/utils/date-utils.ts';

describe('Unit | Utils | date-utils', function () {
  describe('#isValidDate', function () {
    describe('Valid cases', function () {
      it('should accept a valid date only string with format YYYY-MM-DD', function () {
        expect(isValidDate('2008-05-13', 'YYYY-MM-DD')).to.equal(true);
      });

      it('should accept a date object', function () {
        expect(isValidDate(new Date(), 'YYYY-MM-DD')).to.equal(true);
      });

      it('should accept even with french format', function () {
        expect(isValidDate('23/12/2022', 'DD/MM/YYYY')).to.equal(true);
      });
    });

    describe('Invalid cases', function () {
      it('should NOT accept a date with impossible day values', function () {
        expect(isValidDate('2008-02-31', 'YYYY-MM-DD')).to.equal(false);
      });

      it('should NOT accept a datetime string', function () {
        expect(isValidDate('2008-05-13T00:00:00Z', 'YYYY-MM-DD')).to.equal(false);
      });

      it('should NOT accept a date without day', function () {
        expect(isValidDate('2008-05', 'YYYY-MM-DD')).to.equal(false);
      });

      it('should NOT accept a date without month and day', function () {
        expect(isValidDate('2008', 'YYYY-MM-DD')).to.equal(false);
      });

      it('should NOT accept any string starting with a number', function () {
        expect(isValidDate('2not a date', 'YYYY-MM-DD')).to.equal(false);
      });

      it('should NOT accept an invalid formated date string', function () {
        expect(isValidDate('13/05/2008', 'YYYY-MM-DD')).to.equal(false);
      });

      it('should NOT accept an invalid date string', function () {
        expect(isValidDate('Not a date', 'YYYY-MM-DD')).to.equal(false);
      });

      it('should NOT accept a null value', function () {
        expect(isValidDate(null, 'YYYY-MM-DD')).to.equal(false);
      });

      it('should NOT accept a undefined value', function () {
        // @ts-expect-error untyped callers can pass any value
        expect(isValidDate(undefined, 'YYYY-MM-DD')).to.equal(false);
      });

      it('should NOT accept an invalid date object', function () {
        expect(isValidDate(new Date(NaN), 'YYYY-MM-DD')).to.equal(false);
      });

      it('should NOT accept a plain object', function () {
        // @ts-expect-error untyped callers can pass any value
        expect(isValidDate({}, 'YYYY-MM-DD')).to.equal(false);
      });

      it('should NOT accept an array', function () {
        // @ts-expect-error untyped callers can pass any value
        expect(isValidDate([], 'YYYY-MM-DD')).to.equal(false);
      });

      it('should NOT accept a number', function () {
        // @ts-expect-error untyped callers can pass any value
        expect(isValidDate(123, 'YYYY-MM-DD')).to.equal(false);
      });

      it('should NOT accept a boolean', function () {
        // @ts-expect-error untyped callers can pass any value
        expect(isValidDate(true, 'YYYY-MM-DD')).to.equal(false);
      });
    });
  });

  describe('#convertDateValue', function () {
    context('when dateValue does not match inputFormat', function () {
      it('should return null', function () {
        expect(convertDateValue({ dateString: '1980-05-05', inputFormat: 'DD/MM/YYYY' })).to.equal(null);
      });
    });

    context('when dateValue matches inputFormat', function () {
      it('should return converted date', function () {
        expect(convertDateValue({ dateString: '05/05/1980', inputFormat: 'DD/MM/YYYY' })).to.equal('1980-05-05');
      });
    });

    context('when dateValue is Date Object', function () {
      it('should return converted date', function () {
        expect(
          convertDateValue({
            dateString: new Date('1980-05-05'),
            inputFormat: 'DD/MM/YYYY',
          }),
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
            inputFormat: 'DD/MM/YY',
          }),
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
            inputFormat: 'DD/MM/YY',
          }),
        ).to.equal(expectedDate);
      });
    });

    context('when inputFormat is missing', function () {
      it('should return null instead of throwing', function () {
        expect(convertDateValue({ dateString: '05/05/1980' })).to.equal(null);
      });
    });

    context('when dateValue is neither a string nor a valid Date', function () {
      it('should return null instead of throwing', function () {
        // @ts-expect-error untyped callers can pass any value
        expect(convertDateValue({ dateString: {}, inputFormat: 'DD/MM/YYYY' })).to.equal(null);
        // @ts-expect-error untyped callers can pass any value
        expect(convertDateValue({ dateString: [], inputFormat: 'DD/MM/YYYY' })).to.equal(null);
        // @ts-expect-error untyped callers can pass any value
        expect(convertDateValue({ dateString: 42, inputFormat: 'DD/MM/YYYY' })).to.equal(null);
        expect(convertDateValue({ dateString: new Date(NaN), inputFormat: 'DD/MM/YYYY' })).to.equal(null);
      });
    });

    it('returns null for inexisting date', function () {
      expect(convertDateValue({ dateString: '2008-02-31', inputFormat: 'YYYY-MM-DD' })).to.equal(null);
    });
  });

  describe('#anonymizeGeneralizeDate', function () {
    it('anonymizes a date through generalization to the 1st day of the same month at midnight', function () {
      // given
      const someDate = new Date('2019-03-12T19:37:03Z');

      // when
      const anonymizedGeneralizedDate = anonymizeGeneralizeDate(someDate);

      // then
      expect(anonymizedGeneralizedDate).to.be.an.instanceOf(Date);
      expect(anonymizedGeneralizedDate).to.not.equal(someDate);
      expect(anonymizedGeneralizedDate?.toISOString()).to.equal('2019-03-01T00:00:00.000Z');
    });

    context('when date is null', function () {
      it('returns null', function () {
        // given
        const aNullDate = null;

        // when
        const anonymizedGeneralizedDate = anonymizeGeneralizeDate(aNullDate);

        // then
        expect(anonymizedGeneralizedDate).to.equal(null);
      });
    });
  });

  describe('#getDatesOneYearEarlier', function () {
    [
      {
        date: new Date('2020-01-01T08:00:00Z'),
        oneYearEarlierDates: [new Date('2019-01-01T00:00:00Z')],
      },
      {
        date: new Date('2020-03-01T08:00:00Z'),
        oneYearEarlierDates: [new Date('2019-03-01T00:00:00Z')],
      },
      {
        date: new Date('2021-02-28T08:00:00Z'),
        oneYearEarlierDates: [new Date('2020-02-28T00:00:00Z')],
      },
      {
        date: new Date('2024-02-29T08:00:00Z'),
        oneYearEarlierDates: [],
      },
      {
        date: new Date('2025-03-01T08:00:00Z'),
        oneYearEarlierDates: [new Date('2024-02-29T00:00:00Z'), new Date('2024-03-01T00:00:00Z')],
      },
      {
        date: new Date('2101-02-28T08:00:00Z'),
        oneYearEarlierDates: [new Date('2100-02-28T00:00:00Z')],
      },
      {
        date: new Date('2401-03-01T08:00:00Z'),
        oneYearEarlierDates: [new Date('2400-02-29T00:00:00Z'), new Date('2400-03-01T00:00:00Z')],
      },
    ].forEach(({ date, oneYearEarlierDates }) => {
      it(`returns ${oneYearEarlierDates.map((earlierDate) => earlierDate.toISOString()).join(', ') || 'nothing'} for ${date.toISOString()}`, function () {
        expect(getDatesOneYearEarlier(date)).to.deep.equal(oneYearEarlierDates);
      });
    });
  });

  describe('#toDay', function () {
    it('should give the day of the date in the timezone', function () {
      expect(toDay(new Date('2026-03-01T22:59:59Z'), 'Europe/Paris')).to.equal('2026-03-01');
      expect(toDay(new Date('2026-03-01T23:00:00Z'), 'UTC')).to.equal('2026-03-01');
    });

    it('should change day at midnight in the timezone', function () {
      // midnight in Paris with the winter offset, then with the summer offset
      expect(toDay(new Date('2026-03-01T23:00:00Z'), 'Europe/Paris')).to.equal('2026-03-02');
      expect(toDay(new Date('2026-07-01T22:00:00Z'), 'Europe/Paris')).to.equal('2026-07-02');
    });

    it('should follow the offset of the day on the days the clocks change', function () {
      // 00:30 in Paris with the winter offset, then 00:30 with the summer offset
      expect(toDay(new Date('2026-03-28T23:30:00Z'), 'Europe/Paris')).to.equal('2026-03-29');
      expect(toDay(new Date('2026-03-29T22:30:00Z'), 'Europe/Paris')).to.equal('2026-03-30');
      // 00:30 in Paris with the summer offset, then 23:30 with the winter offset
      expect(toDay(new Date('2026-10-24T22:30:00Z'), 'Europe/Paris')).to.equal('2026-10-25');
      expect(toDay(new Date('2026-10-25T22:30:00Z'), 'Europe/Paris')).to.equal('2026-10-25');
    });
  });

  describe('#dayBounds', function () {
    it('should give the first instant of the day and of the next day, in the timezone', function () {
      expect(dayBounds('2026-02-28', 'Europe/Paris')).to.deep.equal({
        start: new Date('2026-02-27T23:00:00Z'),
        end: new Date('2026-02-28T23:00:00Z'),
      });
    });

    it('should give a 23-hour day on the day of the change to summer time', function () {
      expect(dayBounds('2026-03-29', 'Europe/Paris')).to.deep.equal({
        start: new Date('2026-03-28T23:00:00Z'),
        end: new Date('2026-03-29T22:00:00Z'),
      });
    });

    it('should give a 25-hour day on the day of the change to winter time', function () {
      expect(dayBounds('2026-10-25', 'Europe/Paris')).to.deep.equal({
        start: new Date('2026-10-24T22:00:00Z'),
        end: new Date('2026-10-25T23:00:00Z'),
      });
    });
  });
});
