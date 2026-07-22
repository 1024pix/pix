import { VALIDATION_ERRORS } from '../../../../src/shared/constants.js';
import {
  AssessmentEndedError,
  EntityValidationError,
  InvalidInputDataError,
  InvalidTemporaryKeyError,
  ModelValidationError,
  NotEnoughDaysPassedBeforeResetCampaignParticipationError,
  OidcError,
  UserNotAuthorizedToCertifyError,
  UserNotFoundError,
} from '../../../../src/shared/domain/errors.js';
import { expect } from '../../../test-helper.js';

describe('Unit | Shared | Domain | Errors', function () {
  context('OidcError', function () {
    context('when an instance of "OidcError" is created', function () {
      it('contains "message" and "code" attributes', function () {
        // given
        const message = 'An error occurred';

        // when
        const error = new OidcError({ message });

        // then
        expect(error).to.have.property('code');
        expect(error.code).to.equal('OIDC_GENERIC_ERROR');
        expect(error).to.have.property('message');
        expect(error.message).to.equal('An error occurred');
      });
    });
  });

  describe('#InvalidInputDataError', function () {
    it('has default error message and code', function () {
      // when
      const error = new InvalidInputDataError();

      // then
      expect(error.message).to.equal('Provided input data is invalid');
      expect(error.code).to.equal('INVALID_INPUT_DATA');
    });
  });

  describe('ModelValidationError', function () {
    context('#unicityRule', function () {
      it('should populate the  key and the why for the unicity rule', function () {
        //given
        const code = VALIDATION_ERRORS.PROPERTY_NOT_UNIQ;
        const key = 'class-firstName';

        // when
        const error = new ModelValidationError({ key, code });

        // then
        expect(error.key).to.equal(key);
        expect(error.why).to.equal('uniqueness');
        expect(error.code).to.equal(code);
        expect(error.message).to.equal("Échec de validation de l'entité.");
      });
    });

    context('#fromJoiError', function () {
      it('when it is a date format error should return an error with code and key from joi', function () {
        const joiError = { context: { key: 'date', format: 'YY-MM-DD' }, type: 'date.format' };
        const error = ModelValidationError.fromJoiError(joiError);

        expect(error.key).to.equal('date');
        expect(error.why).to.equal('date_format');
        expect(error.code).to.equal(VALIDATION_ERRORS.FIELD_DATE_FORMAT);
        expect(error.acceptedFormat).to.equal('YY-MM-DD');
      });

      it('when it is a required error should return an error with code and key from joi', function () {
        const joiError = { context: { key: 'firstName' }, type: 'any.required' };
        const error = ModelValidationError.fromJoiError(joiError);

        expect(error.key).to.equal('firstName');
        expect(error.why).to.equal('field_required');
        expect(error.code).to.equal(VALIDATION_ERRORS.FIELD_REQUIRED);
      });

      context('string', function () {
        it('when it is a min character error should return an error with code and key from joi', function () {
          const joiError = { context: { key: 'nom', limit: 2 }, type: 'string.min' };
          const error = ModelValidationError.fromJoiError(joiError);

          expect(error.key).to.equal('nom');
          expect(error.why).to.equal('string_too_short');
          expect(error.code).to.equal(VALIDATION_ERRORS.FIELD_STRING_MIN);
          expect(error.acceptedFormat).to.equal(2);
        });

        it('when it is a max character error should return an error with code and key from joi', function () {
          const joiError = { context: { key: 'nom', limit: 2 }, type: 'string.max' };
          const error = ModelValidationError.fromJoiError(joiError);

          expect(error.key).to.equal('nom');
          expect(error.why).to.equal('string_too_long');
          expect(error.code).to.equal(VALIDATION_ERRORS.FIELD_STRING_MAX);
          expect(error.acceptedFormat).to.equal(2);
        });
      });
    });
  });

  describe('#UserNotFoundError', function () {
    it('should have a getErrorMessage method', function () {
      // given
      const expectedErrorMessage = {
        data: {
          id: ['Ce compte est introuvable.'],
        },
      };

      // then
      const userNotFoundError = new UserNotFoundError();
      expect(userNotFoundError.getErrorMessage).to.be.a('function');
      expect(userNotFoundError.getErrorMessage()).to.eql(expectedErrorMessage);
    });
  });

  describe('#InvalidTemporaryKeyError', function () {
    it('should have a getErrorMessage method', function () {
      // given
      const expectedErrorMessage = {
        data: {
          temporaryKey: ['Cette demande de réinitialisation n’est pas valide.'],
        },
      };

      // then
      const error = new InvalidTemporaryKeyError();
      expect(error.getErrorMessage).to.be.a('function');
      expect(error.getErrorMessage()).to.eql(expectedErrorMessage);
    });
  });

  describe('#UserNotAuthorizedToCertifyError', function () {
    it('should have a getErrorMessage method', function () {
      // given
      const expectedErrorMessage = {
        data: {
          authorization: ['Vous n’êtes pas autorisé à passer un test de certification.'],
        },
      };

      // then
      const error = new UserNotAuthorizedToCertifyError();
      expect(error.getErrorMessage).to.be.a('function');
      expect(error.getErrorMessage()).to.eql(expectedErrorMessage);
    });
  });

  describe('#AssessmentEndedError', function () {
    it('should have a getErrorMessage method', function () {
      // given
      const expectedErrorMessage = {
        data: {
          error: ["L'évaluation est terminée. Nous n'avons plus de questions à vous poser."],
        },
      };

      // then
      const assessmentEndedError = new AssessmentEndedError();
      expect(assessmentEndedError.getErrorMessage).to.be.a('function');
      expect(assessmentEndedError.getErrorMessage()).to.eql(expectedErrorMessage);
    });
  });

  describe('EntityValidationError', function () {
    context('#fromJoiErrors', function () {
      it('should populate the invalidAttributes key', function () {
        //given
        const joiErrors = [
          {
            context: {
              key: 'name',
            },
            message: 'name should not be empty',
          },
          {
            context: {
              key: 'email',
            },
            message: 'email is not a valid email address',
          },
        ];

        // when
        const error = EntityValidationError.fromJoiErrors(joiErrors);

        // then
        expect(error.invalidAttributes).to.deep.equal([
          {
            attribute: 'name',
            message: 'name should not be empty',
          },
          {
            attribute: 'email',
            message: 'email is not a valid email address',
          },
        ]);
      });
    });

    context('#fromEntityValidationError', function () {
      it('should populate the invalidAttributes key', function () {
        //given
        const error1 = new EntityValidationError({
          invalidAttributes: [
            {
              attribute: 'name',
              message: 'name should not be empty',
            },
            {
              attribute: 'email',
              message: 'email is not a valid email address',
            },
          ],
        });
        const error2 = new EntityValidationError({
          invalidAttributes: [
            {
              attribute: 'card',
              message: 'card should have money on it',
            },
            {
              attribute: 'token',
              message: 'token should be valid',
            },
          ],
        });

        // when
        const error = EntityValidationError.fromMultipleEntityValidationErrors([error1, error2]);

        // then
        expect(error.invalidAttributes).to.deep.equal([
          {
            attribute: 'name',
            message: 'name should not be empty',
          },
          {
            attribute: 'email',
            message: 'email is not a valid email address',
          },
          {
            attribute: 'card',
            message: 'card should have money on it',
          },
          {
            attribute: 'token',
            message: 'token should be valid',
          },
        ]);
      });
    });
  });

  it('NotEnoughDaysPassedBeforeResetCampaignParticipationError error should have the correct wording', function () {
    // given
    const expectedErrorMessage = `Il n'est pas possible de remettre à zéro votre parcours pour le moment.`;

    // when
    const error = new NotEnoughDaysPassedBeforeResetCampaignParticipationError();

    // then
    expect(error.message).to.equal(expectedErrorMessage);
  });
});
