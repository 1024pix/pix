const { expect, catchErr } = require('../../../test-helper');

const { EntityValidationError } = require('../../../../lib/domain/errors');
const passwordValidator = require('../../../../lib/domain/validators/password-validator');

function _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError) {
  expect(entityValidationErrors).to.be.instanceOf(EntityValidationError);
  expect(entityValidationErrors.invalidAttributes).to.have.lengthOf(1);
  expect(entityValidationErrors.invalidAttributes[0]).to.deep.equal(expectedError);
}

describe('Unit | Domain | Validators | password-validator', () => {

  let password;

  describe('#validate', () => {

    context('when validation is successful', () => {

      it('should not throw any error', () => {
        // when
        password = 'Pix12345';

        // then
        expect(passwordValidator.validate(password)).to.not.throw;
      });
    });

    context('when validation fails', () => {

      it('should reject with error on field "password" when password is missing', async () => {
        // given
        password = '';

        const expectedError = {
          attribute: 'password',
          message: 'Votre mot de passe n’est pas renseigné.',
        };

        // when
        const errors = await catchErr(passwordValidator.validate)(password);

        // then
        _assertErrorMatchesWithExpectedOne(errors, expectedError);
      });

      it('should reject with error on field "password" when password is invalid', async () => {
        // given
        password = 'invalid';

        const expectedError = {
          attribute: 'password',
          message: 'Votre mot de passe doit contenir 8 caractères au minimum et comporter au moins une majuscule, une minuscule et un chiffre.',
        };

        // when
        const errors = await catchErr(passwordValidator.validate)(password);

        // then
        _assertErrorMatchesWithExpectedOne(errors, expectedError);
      });

      it('should reject with errors on password when password have a maximum length of 255', async () => {
        // given
        password = 'Password1234'.repeat(22);

        const expectedError = {
          attribute: 'password',
          message: 'Votre mot de passe ne doit pas dépasser les 255 caractères.',
        };

        // when
        const errors = await catchErr(passwordValidator.validate)(password);

        // then
        _assertErrorMatchesWithExpectedOne(errors, expectedError);
      });
    });
  });
});
