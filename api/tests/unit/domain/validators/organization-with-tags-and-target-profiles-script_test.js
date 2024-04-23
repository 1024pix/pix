import { Organization } from '../../../../lib/domain/models/index.js';
import { validate } from '../../../../lib/domain/validators/organization-with-tags-and-target-profiles-script.js';
import { SUPPORTED_LOCALES } from '../../../../src/shared/domain/constants.js';
import { EntityValidationError } from '../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../test-helper.js';

const organizationTypes = [...Object.values(Organization.types)];
const supportedLocales = SUPPORTED_LOCALES.map((supportedLocale) => supportedLocale.toLocaleLowerCase());

describe('Unit | Domain | Validators | organization-with-tags-and-target-profiles-script.js', function () {
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

    context('when all required properties are provided', function () {
      // eslint-disable-next-line mocha/no-setup-in-describe
      organizationTypes.forEach((organizationType) => {
        context(`when organization type is ${organizationType}`, function () {
          it('returns "true"', function () {
            // given
            const organization = {
              type: organizationType,
              externalId: 'EXTERNAL_ID',
              name: 'Organization Name',
              createdBy: 0,
            };

            // when
            const result = validate(organization);

            // then
            expect(result).to.be.true;
          });
        });
      });
    });
  });

  context('error', function () {
    context('when one of or all required properties is not provided', function () {
      it('returns an EntityValidation error', function () {
        // given
        const organization = {};

        // when
        const error = catchErrSync(validate)(organization);

        // then
        expect(error).to.be.instanceOf(EntityValidationError);
        expect(error.message).to.equal(`Échec de validation de l'entité.`);
        expect(error.invalidAttributes).to.have.deep.members([
          { attribute: 'type', message: '"type" is required' },
          { attribute: 'externalId', message: '"externalId" is required' },
          { attribute: 'name', message: '"name" is required' },
          { attribute: 'createdBy', message: "L'id du créateur est manquant" },
        ]);
      });
    });

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
          message: `La locale doit avoir l'une des valeurs suivantes : en, es, fr, fr-be, fr-fr, nl-be`,
        });
      });
    });
  });
});
