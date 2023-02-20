import { expect, catchErr } from '../../../test-helper';
import { EntityValidationError } from '../../../../lib/domain/errors';
import passwordValidator from '../../../../lib/domain/validators/password-validator';

function _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError) {
  expect(entityValidationErrors).to.be.instanceOf(EntityValidationError);
  expect(entityValidationErrors.invalidAttributes).to.have.lengthOf(1);
  expect(entityValidationErrors.invalidAttributes[0]).to.deep.equal(expectedError);
}

describe('Unit | Domain | Validators | password-validator', function () {
  let password;

  describe('#validate', function () {
    context('when validation is successful', function () {
      it('should not throw any error', function () {
        // when
        password = 'Pix12345';

        // then
        expect(passwordValidator.validate(password)).to.not.throw;
      });
    });

    context('when validation fails', function () {
      it('should reject with error on field "password" when password is missing', async function () {
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

      it('should reject with error on field "password" when password is invalid', async function () {
        // given
        password = 'invalid';

        const expectedError = {
          attribute: 'password',
          message:
            'Votre mot de passe doit contenir 8 caractères au minimum et comporter au moins une majuscule, une minuscule et un chiffre.',
        };

        // when
        const errors = await catchErr(passwordValidator.validate)(password);

        // then
        _assertErrorMatchesWithExpectedOne(errors, expectedError);
      });

      it('should reject with errors on password when password have a maximum length of 255', async function () {
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
