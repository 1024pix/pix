import { expect, catchErrSync } from '../../../test-helper.js';
import { getCanonicalLocale } from '../../../../lib/domain/services/locale-service.js';
import { LocaleFormatError, LocaleNotSupportedError } from '../../../../src/shared/domain/errors.js';

describe('#getCanonicalLocale', function () {
  it('throws a LocaleFormatError error', function () {
    // when
    const error = catchErrSync(getCanonicalLocale)('anInvalidLocale');

    //then
    expect(error).to.be.instanceOf(LocaleFormatError);
  });

  it('throws a LocaleNotSupportedError error', function () {
    // when
    const error = catchErrSync(getCanonicalLocale)('pt-PT');

    //then
    expect(error).to.be.instanceOf(LocaleNotSupportedError);
  });

  it('canonicalizes the given locale', function () {
    // given
    const locale = getCanonicalLocale('fr-fr');

    //then
    expect(locale).to.equal('fr-FR');
  });

  it('transforms "en-GB" locale into "en"', function () {
    // given
    const locale = getCanonicalLocale('en-gb');

    //then
    expect(locale).to.equal('en');
  });
});
