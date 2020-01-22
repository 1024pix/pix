const { expect } = require('chai');

const { computeLeadTimes } = require('../compute-lead-times');

describe('Unit | Script | Lead time computation', () => {

  it('computes a lead time of one day', () => {
    const tagDate = '2020-01-21 00:00:00 +0100';
    const commitDates = ['2020-01-20 00:00:00 +0100'];

    const leadTimes = computeLeadTimes(tagDate, commitDates);

    expect(leadTimes).to.deep.equal([{leadTime: 1}])
  });

  it('computes a lead time of two days', () => {
    const tagDate = '2020-01-21 00:00:00 +0100';
    const commitDates = ['2020-01-19 00:00:00 +0100'];

    const leadTimes = computeLeadTimes(tagDate, commitDates);

    expect(leadTimes).to.deep.equal([{leadTime: 2}])
  });

});
