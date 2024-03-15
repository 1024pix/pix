import { validate } from '../../../../lib/domain/validators/organization-with-tags-and-target-profiles-script.js';
import { SUPPORTED_LOCALES } from '../../../../src/shared/domain/constants.js';
import { EntityValidationError } from '../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../test-helper.js';

const supportedLocales = SUPPORTED_LOCALES.map((supportedLocale) => supportedLocale.toLocaleLowerCase());

describe('Unit | Domain | Validators | organization-with-tags-and-target-profiles-script', function () {
  const DEFAULT_ORGANIZATION = {
    createdBy: 1234,
    credit: 0,
    externalId: 'EXT_ID_123',
    locale: 'fr-fr',
    name: 'Orga Name',
    provinceCode: '123',
    tags: 'TAG1',
    type: 'SCO',
  };

  context('success', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    supportedLocales.forEach((locale) => {
      context(`when locale is ${locale}`, function () {
        it('returns true', function () {
          // given
          const organization = {
            ...DEFAULT_ORGANIZATION,
            locale,
          };

          // when
          const result = validate(organization);

          // then
          expect(result).to.be.true;
        });
      });
    });
  });

  context('error', function () {
    context(`when locale is not supported`, function () {
      it('returns an EntityValidation error', function () {
        // given
        const organization = {
          ...DEFAULT_ORGANIZATION,
          locale: 'pt-br',
        };

        // when
        const error = catchErrSync(validate)(organization);

        // then
        expect(error).to.be.instanceOf(EntityValidationError);
        expect(error.message).to.equal(`Échec de validation de l'entité.`);
        expect(error.invalidAttributes).to.deep.include({
          attribute: 'locale',
          message: `La locale doit avoir l'une des valeurs suivantes : en, fr, fr-be, fr-fr, nl-be`,
        });
      });
    });
  });
});
