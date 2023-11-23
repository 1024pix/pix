import { expect } from '../../../../../test-helper.js';
import * as categories from '../../../../../../src/prescription/organization-place/domain/constants/organization-places-categories.js';
import { OrganizationPlacesLot } from '../../../../../../src/prescription/organization-place/domain/models/OrganizationPlacesLot.js';
import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';

const CODE_CATEGORY_T0 = categories.T0;
const CODE_CATEGORY_T1 = categories.T1;
const CODE_CATEGORY_T2 = categories.T2;
const CODE_CATEGORY_T2BIS = categories.T2bis;
const CODE_CATEGORY_T3 = categories.T3;
const CATEGORY_FREE_RATE = categories.FREE_RATE;
const CATEGORY_PUBLIC_RATE = categories.PUBLIC_RATE;
const CATEGORY_REDUCE_RATE = categories.REDUCE_RATE;
const CATEGORY_SPECIAL_REDUCE_RATE = categories.SPECIAL_REDUCE_RATE;
const CATEGORY_FULL_RATE = categories.FULL_RATE;

describe('Unit | Domain | Models | OrganizationPlacesLot', function () {
  describe('#constructor', function () {
    it('should create an organizationPlacesLot with correct attributes', function () {
      //given
      const attributes = {
        organizationId: 1,
        count: 10,
        activationDate: '2022-01-02',
        expirationDate: '2023-01-02',
        reference: 'abc123',
        category: categories.FREE_RATE,
        createdBy: 888,
      };

      //when
      const organizationPlacesLot = new OrganizationPlacesLot(attributes);

      //then
      expect(organizationPlacesLot.organizationId).to.equal(1);
      expect(organizationPlacesLot.count).to.equal(10);
      expect(organizationPlacesLot.activationDate).to.equal('2022-01-02');
      expect(organizationPlacesLot.expirationDate).to.equal('2023-01-02');
      expect(organizationPlacesLot.reference).to.equal('abc123');
      expect(organizationPlacesLot.category).to.equal(CODE_CATEGORY_T0);
      expect(organizationPlacesLot.createdBy).to.equal(888);
    });

    context('#validation', function () {
      let initialAttributes;
      beforeEach(function () {
        initialAttributes = {
          organizationId: 1,
          count: 10,
          activationDate: '2022-01-02',
          expirationDate: '2023-01-02',
          reference: 'abc123',
          category: categories.FREE_RATE,
          createdBy: 123,
        };
      });

      context('#organizationId', function () {
        it('it should throw an exception when organizationId is missing', function () {
          //given
          const attributes = {
            ...initialAttributes,
            organizationId: undefined,
          };

          //when
          let error;
          try {
            new OrganizationPlacesLot(attributes);
          } catch (e) {
            error = e;
          }
          //then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equals([
            {
              attribute: 'organizationId',
              message: `L'organisationId est obligatoire.`,
            },
          ]);
        });

        it('it should throw an exception when organizationId is not a number', function () {
          //given
          const attributes = {
            ...initialAttributes,
            organizationId: 'toto',
          };

          //when
          let error;
          try {
            new OrganizationPlacesLot(attributes);
          } catch (e) {
            error = e;
          }
          //then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equals([
            {
              attribute: 'organizationId',
              message: `L'identifiant de l'organisation doit être un nombre.`,
            },
          ]);
        });
      });

      context('#count', function () {
        it('it should throw an exception when count is not a number', function () {
          //given
          const attributes = {
            ...initialAttributes,
            count: 'toto',
          };

          //when
          let error;
          try {
            new OrganizationPlacesLot(attributes);
          } catch (e) {
            error = e;
          }
          //then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equals([
            {
              attribute: 'count',
              message: 'Le nombre de places doit être un nombre sans virgule supérieur à 0.',
            },
          ]);
        });

        it('it should throw an exception when count is not a positive number', function () {
          //given
          const attributes = {
            ...initialAttributes,
            count: -1,
          };

          //when
          let error;
          try {
            new OrganizationPlacesLot(attributes);
          } catch (e) {
            error = e;
          }
          //then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equals([
            {
              attribute: 'count',
              message: 'Le nombre de places doit être un nombre sans virgule supérieur à 0.',
            },
          ]);
        });

        it('it should throw an exception when count is not an integer', function () {
          //given
          const attributes = {
            ...initialAttributes,
            count: '2.5',
          };

          //when
          let error;
          try {
            new OrganizationPlacesLot(attributes);
          } catch (e) {
            error = e;
          }
          //then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equals([
            {
              attribute: 'count',
              message: 'Le nombre de places doit être un nombre sans virgule supérieur à 0.',
            },
          ]);
        });

        it('it should throw an exception when count is set to 0', function () {
          //given
          const attributes = {
            ...initialAttributes,
            count: '0',
          };

          //when
          let error;
          try {
            new OrganizationPlacesLot(attributes);
          } catch (e) {
            error = e;
          }
          //then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equals([
            {
              attribute: 'count',
              message: 'Le nombre de places doit être un nombre sans virgule supérieur à 0.',
            },
          ]);
        });
      });

      context('#activationDate', function () {
        it('it should throw an exception when activationDate has not the correct format', function () {
          //given
          const attributes = {
            ...initialAttributes,
            activationDate: '10-10-2022',
          };

          //when
          let error;
          try {
            new OrganizationPlacesLot(attributes);
          } catch (e) {
            error = e;
          }

          //then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equals([
            {
              attribute: 'activationDate',
              message: `Le format de La date n'est pas correct.`,
            },
          ]);
        });

        it('it should throw an exception when activationDate is missing', function () {
          //given
          const attributes = {
            ...initialAttributes,
            activationDate: undefined,
            expirationDate: undefined,
          };

          //when
          let error;
          try {
            new OrganizationPlacesLot(attributes);
          } catch (e) {
            error = e;
          }

          //then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equals([
            {
              attribute: 'activationDate',
              message: `La date d'activation est obligatoire.`,
            },
          ]);
        });
      });

      context('#expirationDate', function () {
        it('it should throw an exception when expirationDate has not the correct format', function () {
          //given
          const attributes = {
            ...initialAttributes,
            activationDate: '2022-01-10',
            expirationDate: '10-01-2022',
          };

          //when
          let error;
          try {
            new OrganizationPlacesLot(attributes);
          } catch (e) {
            error = e;
          }

          //then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equals([
            {
              attribute: 'expirationDate',
              message: `Le format de La date n'est pas correct.`,
            },
          ]);
        });

        it('it should throw an exception when expirationDate = activationDate', function () {
          //given
          const attributes = {
            ...initialAttributes,
            activationDate: '2022-01-21',
            expirationDate: '2022-01-21',
          };

          //when
          let error;
          try {
            new OrganizationPlacesLot(attributes);
          } catch (e) {
            error = e;
          }
          //then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equals([
            {
              attribute: 'expirationDate',
              message: `La date d'expiration doit être supérieur à la date d'activation.`,
            },
          ]);
        });

        it('it should throw an exception when expirationDate < activationDate', function () {
          //given
          const attributes = {
            ...initialAttributes,
            activationDate: '2022-01-21',
            expirationDate: '2021-01-21',
          };

          //when
          let error;
          try {
            new OrganizationPlacesLot(attributes);
          } catch (e) {
            error = e;
          }
          //then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equals([
            {
              attribute: 'expirationDate',
              message: `La date d'expiration doit être supérieur à la date d'activation.`,
            },
          ]);
        });
      });

      context('#reference', function () {
        it('it should throw an exception when reference is undefined', function () {
          //given
          const attributes = {
            ...initialAttributes,
            reference: undefined,
          };

          //when
          let error;
          try {
            new OrganizationPlacesLot(attributes);
          } catch (e) {
            error = e;
          }
          //then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equals([
            {
              attribute: 'reference',
              message: 'La référence est obligatoire.',
            },
          ]);
        });

        it('it should throw an exception when reference is empty', function () {
          //given
          const attributes = {
            ...initialAttributes,
            reference: '',
          };

          //when
          let error;
          try {
            new OrganizationPlacesLot(attributes);
          } catch (e) {
            error = e;
          }
          //then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equals([
            {
              attribute: 'reference',
              message: 'La référence est obligatoire.',
            },
          ]);
        });

        it('it should throw an exception when reference is not a string', function () {
          //given
          const attributes = {
            ...initialAttributes,
            reference: 123,
          };

          //when
          let error;
          try {
            new OrganizationPlacesLot(attributes);
          } catch (e) {
            error = e;
          }
          //then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equals([
            {
              attribute: 'reference',
              message: 'La référence est obligatoire.',
            },
          ]);
        });
      });

      context('#category', function () {
        it('it should throw an exception when category is missing', function () {
          //given
          const attributes = {
            ...initialAttributes,
            category: undefined,
          };

          //when
          let error;
          try {
            new OrganizationPlacesLot(attributes);
          } catch (e) {
            error = e;
          }

          //then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equals([
            {
              attribute: 'category',
              message: `La catégorie est obligatoire.`,
            },
          ]);
        });

        // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
        // eslint-disable-next-line mocha/no-setup-in-describe
        [
          { code: CODE_CATEGORY_T0, category: CATEGORY_FREE_RATE },
          { code: CODE_CATEGORY_T1, category: CATEGORY_PUBLIC_RATE },
          { code: CODE_CATEGORY_T2, category: CATEGORY_REDUCE_RATE },
          { code: CODE_CATEGORY_T2BIS, category: CATEGORY_SPECIAL_REDUCE_RATE },
          { code: CODE_CATEGORY_T3, category: CATEGORY_FULL_RATE },
        ].forEach((data) => {
          it(`it returns ${data.code} when category is ${data.category}`, function () {
            //given
            const attributes = {
              ...initialAttributes,
              category: data.category,
            };
            //when
            const organizationPlaces = new OrganizationPlacesLot(attributes);

            expect(organizationPlaces.category).to.equal(data.code);
          });
        });
      });

      context('#createdBy', function () {
        it('it should throw an exception when createdBy is missing', function () {
          //given
          const attributes = {
            ...initialAttributes,
            createdBy: undefined,
          };

          //when
          let error;
          try {
            new OrganizationPlacesLot(attributes);
          } catch (e) {
            error = e;
          }

          //then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equals([
            {
              attribute: 'createdBy',
              message: 'Le créateur est obligatoire.',
            },
          ]);
        });
        it('it should throw an exception when createdBy is not an a number', function () {
          //given
          const attributes = {
            ...initialAttributes,
            createdBy: 'abc',
          };

          //when
          let error;
          try {
            new OrganizationPlacesLot(attributes);
          } catch (e) {
            error = e;
          }

          //then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equals([
            {
              attribute: 'createdBy',
              message: '"createdBy" must be a number',
            },
          ]);
        });
      });
    });
  });
});
