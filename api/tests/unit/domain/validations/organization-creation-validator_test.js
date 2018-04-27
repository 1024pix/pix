const { expect, sinon } = require('../../../test-helper');
const organizationCreationValidator = require('../../../../lib/domain/validators/organization-creation-validator');
const userValidator = require('../../../../lib/domain/validators/user-validator');
const organizationValidator = require('../../../../lib/domain/validators/organization-validator');
const { OrganizationValidationErrors } = require('../../../../lib/domain/errors');

function _assertErrorMatchesWithExpectedOne(err, expectedError) {
  expect(err).to.be.an.instanceof(OrganizationValidationErrors);
  expect(err.errors).to.have.lengthOf(1);
  expect(err.errors[0]).to.deep.equal(expectedError);
}

describe('Unit | Domain | Validators | organization-creation-validator', function () {

  let sandbox;
  let userData;
  let organizationData;

  beforeEach(() => {
    userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.net',
      password: 'password1234',
      cgu: true,
    };
    organizationData = {
      name: 'Acme',
      type: 'PRO',
      email: userData.email,
    };

    sandbox = sinon.sandbox.create();
    sandbox.stub(userValidator, 'validate');
    sandbox.stub(organizationValidator, 'validate');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#validate', () => {

    context('when validation is successful', () => {

      beforeEach(() => {
        userValidator.validate.resolves();
        organizationValidator.validate.resolves();
      });

      it('should resolve (with no value) when validation is successful', () => {
        // when
        const promise = organizationCreationValidator.validate(userData, organizationData);

        // then
        return expect(promise).to.be.fulfilled;
      });
    });

    context('when user validation fails', () => {

      it('should reject with the errors from user validation', () => {
        // given
        const expectedError = {
          source: { pointer: '/data/attributes/first-name' },
          title: 'Invalid user data attribute "firstName"',
          detail: 'Votre prénom n’est pas renseigné.',
          meta: {
            field: 'firstName'
          }
        };

        userValidator.validate.rejects([expectedError]);
        organizationValidator.validate.resolves();

        // when
        const promise = organizationCreationValidator.validate(userData, organizationData);

        // then
        return promise
          .then(() => expect.fail('Expected rejection with OrganizationValidationErrors'))
          .catch((err) => _assertErrorMatchesWithExpectedOne(err, expectedError));
      });

    });

    context('when both user and organization validations fail', () => {

      it('should reject with the errors from user and organization validations', () => {
        // given
        const expectedUserError = {
          source: { pointer: '/data/attributes/first-name' },
          title: 'Invalid user data attribute "firstName"',
          detail: 'Votre prénom n’est pas renseigné.',
          meta: {
            field: 'firstName'
          }
        };
        const expectedOrganizationError = {
          source: { pointer: '/data/attributes/type' },
          title: 'Invalid type',
          detail: 'Le type n’est pas renseigné.',
          meta: {
            field: 'type'
          }
        };

        userValidator.validate.rejects([expectedUserError]);
        organizationValidator.validate.rejects([expectedOrganizationError]);

        // when
        const promise = organizationCreationValidator.validate(userData, organizationData);

        // then
        return promise
          .then(() => expect.fail('Expected rejection with OrganizationValidationErrors'))
          .catch((err) => {
            expect(err).to.be.an.instanceof(OrganizationValidationErrors);
            expect(err.errors).to.have.lengthOf(2);
            expect(err.errors[0]).to.deep.equal(expectedUserError);
            expect(err.errors[1]).to.deep.equal(expectedOrganizationError);
          });
      });

    });
  });
});
