import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import parseISODateOnly from 'mon-pix/utils/parse-iso-date-only';

describe('Unit | Utils | parse-iso-date-only', function() {
  setupTest();

  it('parse "2020-01-01" date only to ISO', function() {
    // given
    const dateString = '2020-01-01';

    // when
    const date = parseISODateOnly(dateString);

    // then
    expect(date).to.deep.equal(new Date(2020, 0, 1));
  });

  it('parse "2020-12-31" date only to ISO', function() {
    // given
    const dateString = '2020-12-31';

    // when
    const date = parseISODateOnly(dateString);

    // then
    expect(date).to.deep.equal(new Date(2020, 11, 31));
  });

  it('throws when the input date does not comply with the "YYYY-MM-DD" format', function() {
    // given
    const dateStringWithInvertedDayAndMonth = '2020-31-12';

    // when / then
    expect(() => parseISODateOnly(dateStringWithInvertedDayAndMonth))
      .to.throw();
  });
});
