import { expect } from 'chai';

import { OrganizationBatchCreationError } from '../../../../../src/organizational-entities/domain/errors.js';
import { Organization } from '../../../../../src/organizational-entities/domain/models/Organization.js';
import { validate } from '../../../../../src/organizational-entities/domain/validators/organization-with-tags-and-target-profiles.js';
import { getSupportedLocales } from '../../../../../src/shared/domain/services/locale-service.js';
import { catchErrSync } from '../../../../tooling/test-utils/error.js';

const organizationTypes = [...Object.values(Organization.types)];
const lowerCaseSupportedLocales = getSupportedLocales().map((supportedLocale) => supportedLocale.toLocaleLowerCase());

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
    administrationTeamId: 1,
    countryCode: 99123,
    organizationLearnerTypeId: 456,
    categoryId: 800,
  };

  context('success', function () {
    lowerCaseSupportedLocales.forEach((locale) => {
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
      organizationTypes.forEach((organizationType) => {
        context(`when organization type is ${organizationType}`, function () {
          it('returns "true"', function () {
            // given
            const organization = {
              type: organizationType,
              name: 'Organization Name',
              createdBy: 0,
              administrationTeamId: 1,
              countryCode: 99123,
              organizationLearnerTypeId: 456,
              categoryId: 800,
            };

            // when
            const result = validate(organization);

            // then
            expect(result).to.be.true;
          });
        });
      });
    });

    it('should allow null for credit', function () {
      // given
      const organization = {
        ...DEFAULT_ORGANIZATION,
        credit: null,
      };

      // when
      const result = validate(organization);

      // then
      expect(result).to.be.true;
    });
  });

  context('error', function () {
    context('when one of or all required properties is not provided', function () {
      it('returns an OrganizationBatchCreationError error', function () {
        // given
        const organization = {};
        const currentLine = 42;

        // when
        const error = catchErrSync(validate)(organization, currentLine);

        // then
        expect(error).to.be.instanceOf(OrganizationBatchCreationError);
        expect(error.message).to.equal('Organization batch creation validation failed.');
        expect(error.code).to.equal('VALIDATION_ERROR');
        expect(error.meta.invalidAttributes).to.have.deep.members([
          { attribute: 'type', message: '"type" is required' },
          { attribute: 'name', message: '"name" is required' },
          { attribute: 'createdBy', message: "L'id du créateur est manquant" },
          { attribute: 'administrationTeamId', message: "L'id de l'équipe en charge est manquant" },
          { attribute: 'countryCode', message: 'Le code pays n’est pas renseigné.' },
          { attribute: 'organizationLearnerTypeId', message: "L'id du public prescrit est manquant" },
          { attribute: 'categoryId', message: 'FIELD_REQUIRED' },
        ]);
        expect(error.meta.currentLine).to.equal(42);
      });
    });

    context(`when locale is not supported`, function () {
      it('returns an OrganizationBatchCreationError error', function () {
        // given
        const organization = {
          ...DEFAULT_ORGANIZATION,
          locale: 'pt-br',
        };

        // when
        const error = catchErrSync(validate)(organization);

        // then
        expect(error).to.be.instanceOf(OrganizationBatchCreationError);
        expect(error.meta.invalidAttributes).to.deep.include({
          attribute: 'locale',
          message: `La locale doit avoir l'une des valeurs suivantes : de-at, en, es, es-419, fr, nl, fr-be, fr-fr, nl-be, it`,
        });
      });
    });

    context('countryCode validation', function () {
      it('returns a required error when countryCode is null', function () {
        // given
        const organization = {
          ...DEFAULT_ORGANIZATION,
          countryCode: null,
        };

        // when
        const error = catchErrSync(validate)(organization);

        // then
        expect(error).to.be.instanceOf(OrganizationBatchCreationError);
        expect(error.meta.invalidAttributes).to.deep.include({
          attribute: 'countryCode',
          message: 'Le code pays n’est pas renseigné.',
        });
      });

      it('returns an OrganizationBatchCreationError error when countryCode is not a number', function () {
        // given
        const organization = {
          ...DEFAULT_ORGANIZATION,
          countryCode: '99100',
        };

        // when
        const error = catchErrSync(validate)(organization);

        // then
        expect(error).to.be.instanceOf(OrganizationBatchCreationError);
        expect(error.meta.invalidAttributes).to.deep.include({
          attribute: 'countryCode',
          message: "Le code pays n'est pas un nombre",
        });
      });

      it('returns an OrganizationBatchCreationError error when country code is below minimum value', function () {
        // given
        const organization = {
          ...DEFAULT_ORGANIZATION,
          countryCode: 98000,
        };

        // when
        const error = catchErrSync(validate)(organization);

        // then
        expect(error).to.be.instanceOf(OrganizationBatchCreationError);
        expect(error.meta.invalidAttributes).to.deep.include({
          attribute: 'countryCode',
          message: 'Le code pays doit être un nombre entier compris entre 99000 et 99999.',
        });
      });

      it('returns an OrganizationBatchCreationError error when country code is above maximum value', function () {
        // given
        const organization = {
          ...DEFAULT_ORGANIZATION,
          countryCode: 100000,
        };

        // when
        const error = catchErrSync(validate)(organization);

        // then
        expect(error).to.be.instanceOf(OrganizationBatchCreationError);
        expect(error.meta.invalidAttributes).to.deep.include({
          attribute: 'countryCode',
          message: 'Le code pays doit être un nombre entier compris entre 99000 et 99999.',
        });
      });
    });

    context('createdBy validation', function () {
      it('returns a required error when createdBy is null', function () {
        // given
        const organization = {
          ...DEFAULT_ORGANIZATION,
          createdBy: null,
        };

        // when
        const error = catchErrSync(validate)(organization);

        // then
        expect(error).to.be.instanceOf(OrganizationBatchCreationError);
        expect(error.meta.invalidAttributes).to.deep.include({
          attribute: 'createdBy',
          message: "L'id du créateur est manquant",
        });
      });

      it('returns an OrganizationBatchCreationError error when createdBy is not a number', function () {
        // given
        const organization = {
          ...DEFAULT_ORGANIZATION,
          createdBy: '123456',
        };

        // when
        const error = catchErrSync(validate)(organization);

        // then
        expect(error).to.be.instanceOf(OrganizationBatchCreationError);
        expect(error.meta.invalidAttributes).to.deep.include({
          attribute: 'createdBy',
          message: "L'id du créateur n'est pas un nombre",
        });
      });
    });

    context('administrationTeamId validation', function () {
      it('returns a required error when administrationTeamId is null', function () {
        // given
        const organization = {
          ...DEFAULT_ORGANIZATION,
          administrationTeamId: null,
        };

        // when
        const error = catchErrSync(validate)(organization);

        // then
        expect(error).to.be.instanceOf(OrganizationBatchCreationError);
        expect(error.meta.invalidAttributes).to.deep.include({
          attribute: 'administrationTeamId',
          message: "L'id de l'équipe en charge est manquant",
        });
      });

      it('returns an OrganizationBatchCreationError error when administrationTeamId is not a number', function () {
        // given
        const organization = {
          ...DEFAULT_ORGANIZATION,
          administrationTeamId: '8001',
        };

        // when
        const error = catchErrSync(validate)(organization);

        // then
        expect(error).to.be.instanceOf(OrganizationBatchCreationError);
        expect(error.meta.invalidAttributes).to.deep.include({
          attribute: 'administrationTeamId',
          message: "L'id de l'équipe en charge n'est pas un nombre",
        });
      });
    });

    context('organizationLearnerTypeId validation', function () {
      it('returns a required error when organizationLearnerTypeId is null', function () {
        // given
        const organization = {
          ...DEFAULT_ORGANIZATION,
          organizationLearnerTypeId: null,
        };

        // when
        const error = catchErrSync(validate)(organization);

        // then
        expect(error).to.be.instanceOf(OrganizationBatchCreationError);
        expect(error.meta.invalidAttributes).to.deep.include({
          attribute: 'organizationLearnerTypeId',
          message: "L'id du public prescrit est manquant",
        });
      });

      it('returns an OrganizationBatchCreationError error when organizationLearnerTypeId is not a number', function () {
        // given
        const organization = {
          ...DEFAULT_ORGANIZATION,
          organizationLearnerTypeId: '100025',
        };

        // when
        const error = catchErrSync(validate)(organization);

        // then
        expect(error).to.be.instanceOf(OrganizationBatchCreationError);
        expect(error.meta.invalidAttributes).to.deep.include({
          attribute: 'organizationLearnerTypeId',
          message: "L'id du public prescrit n'est pas un nombre",
        });
      });
    });

    context('categoryId validation', function () {
      it('returns a required error when categoryId is null', function () {
        // given
        const organization = {
          ...DEFAULT_ORGANIZATION,
          categoryId: null,
        };

        // when
        const error = catchErrSync(validate)(organization);

        // then
        expect(error).to.be.instanceOf(OrganizationBatchCreationError);
        expect(error.meta.invalidAttributes).to.deep.include({
          attribute: 'categoryId',
          message: 'FIELD_REQUIRED',
        });
      });

      it('returns an OrganizationBatchCreationError error when categoryId is not a number', function () {
        // given
        const organization = {
          ...DEFAULT_ORGANIZATION,
          categoryId: '800',
        };

        // when
        const error = catchErrSync(validate)(organization);

        // then
        expect(error).to.be.instanceOf(OrganizationBatchCreationError);
        expect(error.meta.invalidAttributes).to.deep.include({
          attribute: 'categoryId',
          message: 'FIELD_NOT_A_NUMBER',
        });
      });
    });

    context('credit validation', function () {
      it('returns an OrganizationBatchCreationError error when credit is neither a number nor null', function () {
        // given
        const organization = {
          ...DEFAULT_ORGANIZATION,
          credit: 'String credit',
        };

        // when
        const error = catchErrSync(validate)(organization);

        // then
        expect(error).to.be.instanceOf(OrganizationBatchCreationError);
        expect(error.meta.invalidAttributes).to.deep.include({
          attribute: 'credit',
          message: 'Le crédit doit être un entier.',
        });
      });

      it('returns an OrganizationBatchCreationError error when credit is not a positive number', function () {
        // given
        const organization = {
          ...DEFAULT_ORGANIZATION,
          credit: -1,
        };

        // when
        const error = catchErrSync(validate)(organization);

        // then
        expect(error).to.be.instanceOf(OrganizationBatchCreationError);
        expect(error.meta.invalidAttributes).to.deep.include({
          attribute: 'credit',
          message: 'Le crédit doit être un nombre entier positif.',
        });
      });
    });
  });
});
