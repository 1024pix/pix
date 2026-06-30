import Joi from 'joi';

import { EntityValidationError } from '../../../../../src/shared/domain/errors.js';
import { PasswordSchema, validate } from '../../../../../src/shared/domain/validators/password-validator.js';
import { expect } from '../../../../test-helper.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Shared | Domain | Validator | password-validator', function () {
  describe('#PasswordSchema', function () {
    context('valid values', function () {
      it('accepts a valid password', function () {
        // when
        const validation = PasswordSchema.validate('Pix12345');

        // then
        expect(validation.error).to.be.undefined;
      });

      ['Pixé1234', 'Éxample1', 'Straße12', 'Pix1 !@#$%^&*'].forEach((password) => {
        it(`accepts unicode and special characters password "${password}"`, function () {
          // when
          const validation = PasswordSchema.validate(password);

          // then
          expect(validation.error).to.be.undefined;
        });
      });
    });

    context('invalid values', function () {
      [
        ['Pix123', 'must be at least 8 characters long'],
        ['pix12345', 'must contain at least one uppercase letter'],
        ['PIX12345', 'must contain at least one lowercase letter'],
        ['Pixxxxxx', 'must contain at least one digit'],
      ].forEach(([password, message]) => {
        it(`rejects password "${password}" (${message})`, async function () {
          // when
          const validation = PasswordSchema.validate(password);

          // then
          expect(validation.error).to.be.instanceOf(Joi.ValidationError);
        });
      });
    });
  });

  describe('validate', function () {
    context('when validation is successful', function () {
      it('should not throw any error', function () {
        // when / then
        expect(() => validate('Pix12345')).to.not.throw();
      });
    });

    context('when validation fails', function () {
      it('should reject with error on field "password" when password is missing', async function () {
        // when
        const errors = await catchErr(validate)('');

        // then
        expect(errors).to.be.instanceOf(EntityValidationError);
        expect(errors.invalidAttributes).to.have.lengthOf(1);
        expect(errors.invalidAttributes[0]).to.deep.equal({
          attribute: 'password',
          message: 'Votre mot de passe n’est pas renseigné.',
        });
      });

      it('should reject with error on field "password" when password is invalid', async function () {
        // when
        const errors = await catchErr(validate)('invalid');

        // then
        expect(errors).to.be.instanceOf(EntityValidationError);
        expect(errors.invalidAttributes).to.have.lengthOf(1);
        expect(errors.invalidAttributes[0]).to.deep.equal({
          attribute: 'password',
          message:
            'Votre mot de passe doit contenir 8 caractères au minimum et comporter au moins une majuscule, une minuscule et un chiffre.',
        });
      });

      it('should reject with errors on password when password have a maximum length of 255', async function () {
        // when
        const errors = await catchErr(validate)('Password1234'.repeat(22));

        // then
        expect(errors).to.be.instanceOf(EntityValidationError);
        expect(errors.invalidAttributes).to.have.lengthOf(1);
        expect(errors.invalidAttributes[0]).to.deep.equal({
          attribute: 'password',
          message: 'Votre mot de passe ne doit pas dépasser les 255 caractères.',
        });
      });
    });
  });
});
