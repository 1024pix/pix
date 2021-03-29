import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import setupIntl from 'mon-pix/tests/helpers/setup-intl';

describe('Unit | Service | intl-date-formatter', function() {

  setupTest();
  setupIntl();

  let intlDateFormatter;

  beforeEach(function() {
    intlDateFormatter = this.owner.lookup('service:intl-date-formatter');
  });

  it('format "2020-01-01" date string to ISO', function() {
    // given
    const dateString = '2020-01-01';

    // when
    const date = intlDateFormatter.formatDateStringToISO(dateString);

    // then
    expect(date).to.deep.equal(new Date(dateString));
  });

  it('format "2020-12-31" date string to ISO', function() {
    // given
    const dateString = '2020-12-31';

    // when
    const date = intlDateFormatter.formatDateStringToISO(dateString);

    // then
    expect(date).to.deep.equal(new Date(dateString));
  });

  it('throws when the input date does not comply with the "YYYY-MM-DD" format', function() {
    // given
    const dateStringWithInvertedDayAndMonth = '2020-31-12';

    // when / then
    expect(() => intlDateFormatter.formatDateStringToISO(dateStringWithInvertedDayAndMonth))
      .to.throw();
  });
});
