const { expect } = require('../../../test-helper');
const organizationValidator = require('../../../../lib/domain/validators/organization-validator');

const MISSING_VALUE = '';

function _assertErrorMatchesWithExpectedOne(errors, expectedError) {
  expect(errors).to.have.lengthOf(1);
  expect(errors[0]).to.deep.equal(expectedError);
}

describe('Unit | Domain | Validators | organization-validator', function() {

  let organizationData;

  beforeEach(() => {
    organizationData = {
      name: 'Lycée des Rosiers',
      type: 'SUP',
      email: 'lycee.des.rosiers@example.net'
    };
  });

  describe('#validate', () => {

    context('when validation is successful', () => {

      it('should resolve (with no value) when validation is successful', () => {
        // when
        const promise = organizationValidator.validate(organizationData);

        // then
        return expect(promise).to.be.fulfilled;
      });
    });

    context('when organization data validation fails', () => {

      context('on name attribute', () => {

        it('should reject with error when name is missing', () => {
          // given
          const expectedError = {
            source: { pointer: '/data/attributes/name' },
            title: 'Invalid organization data attribute "name"',
            detail: 'Le nom n’est pas renseigné.',
            meta: {
              field: 'name'
            }
          };
          organizationData.name = MISSING_VALUE;

          // when
          const promise = organizationValidator.validate(organizationData);

          // then
          return promise
            .then(() => expect.fail('Expected rejection with errors'))
            .catch((errors) => _assertErrorMatchesWithExpectedOne(errors, expectedError));
        });

      });

      context('on email attribute', () => {

        it('should reject with error when email is missing', () => {
          // given
          const expectedError = {
            source: { pointer: '/data/attributes/email' },
            title: 'Invalid organization data attribute "email"',
            detail: 'L’adresse électronique n’est pas renseignée.',
            meta: {
              field: 'email'
            }
          };
          organizationData.email = MISSING_VALUE;

          // when
          const promise = organizationValidator.validate(organizationData);

          // then
          return promise
            .then(() => expect.fail('Expected rejection erros'))
            .catch((errors) => _assertErrorMatchesWithExpectedOne(errors, expectedError));
        });

        it('should reject with error when email is invalid', () => {
          // given
          const expectedError = {
            source: { pointer: '/data/attributes/email' },
            title: 'Invalid organization data attribute "email"',
            detail: 'L’adresse électronique n’est pas correcte.',
            meta: {
              field: 'email'
            }
          };
          organizationData.email = 'invalid_email';

          // when
          const promise = organizationValidator.validate(organizationData);

          // then
          return promise
            .then(() => expect.fail('Expected rejection with errors'))
            .catch((errors) => _assertErrorMatchesWithExpectedOne(errors, expectedError));
        });

      });

      context('on type attribute', () => {

        it('should reject with error when type is missing', () => {
          // given
          const expectedError = {
            source: { pointer: '/data/attributes/type' },
            title: 'Invalid organization data attribute "type"',
            detail: 'Le type n’est pas renseigné.',
            meta: {
              field: 'type'
            }
          };
          organizationData.type = MISSING_VALUE;

          // when
          const promise = organizationValidator.validate(organizationData);

          // then
          return promise
            .then(() => expect.fail('Expected rejection with errors'))
            .catch((errors) => _assertErrorMatchesWithExpectedOne(errors, expectedError));
        });

        it('should reject with error when type value is not SUP, SCO or PRO', () => {
          // given
          const expectedError = {
            source: { pointer: '/data/attributes/type' },
            title: 'Invalid organization data attribute "type"',
            detail: 'Le type de l’organisation doit avoir l’une des valeurs suivantes: SCO, SUP, PRO.',
            meta: {
              field: 'type'
            }
          };
          organizationData.type = 'PTT';

          // when
          const promise = organizationValidator.validate(organizationData);

          // then
          return promise
            .then(() => expect.fail('Expected rejection with errors'))
            .catch((errors) => _assertErrorMatchesWithExpectedOne(errors, expectedError));
        });

        [
          'SUP',
          'SCO',
          'PRO'
        ].forEach((type) => {
          it(`should accept ${type} as type`, function() {
            // given
            organizationData.type = type;

            // when
            const promise = organizationValidator.validate(organizationData);

            // then
            return expect(promise).to.be.fulfilled;
          });
        });

      });

      it('should reject with errors on all fields (but only once by field) when all fields are missing', () => {
        // given
        organizationData = {
          name: '',
          email: '',
          type: '',
        };

        // when
        const promise = organizationValidator.validate(organizationData);

        // then
        return promise
          .then(() => expect.fail('Expected rejection with errors'))
          .catch((errors) => {
            expect(errors).to.have.lengthOf(3);
          });
      });
    });
  });
});
