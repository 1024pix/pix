import { expect } from 'chai';

import { getDatesOneYearEarlier } from '../../../../../src/db-history/application/jobs/date-utils.js';

describe('DB-History | Unit | Application | Jobs | DateUtils', function () {
  context('#getDatesOneYearEarlier', function () {
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
      it(`returns ${oneYearEarlierDates} for ${date}`, function () {
        expect(getDatesOneYearEarlier(date)).to.deep.equal(oneYearEarlierDates);
      });
    });
  });
});
