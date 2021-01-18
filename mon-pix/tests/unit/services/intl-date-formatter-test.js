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

  it('format "2020-01-01" date string to human-readable "1 janvier 2020"', function() {
    // given
    const dateString = '2020-01-01';

    // when
    const formattedHumanReadableString = intlDateFormatter.formatDateStringToString(dateString);

    // then
    expect(formattedHumanReadableString).to.equal('1 janvier 2020');
  });

  it('format "2020-12-31" date string to human-readable "31 décembre 2020"', function() {
    // given
    const dateString = '2020-12-31';

    // when
    const formattedHumanReadableString = intlDateFormatter.formatDateStringToString(dateString);

    // then
    expect(formattedHumanReadableString).to.equal('31 décembre 2020');
  });

  it('throws when the input date does not comply with the "YYYY-MM-DD" format', function() {
    // given
    const dateStringWithInvertedDayAndMonth = '2020-31-12';

    // when / then
    expect(() => intlDateFormatter.formatDateStringToString(dateStringWithInvertedDayAndMonth))
      .to.throw();
  });
});
