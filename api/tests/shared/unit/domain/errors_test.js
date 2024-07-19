import { VALIDATION_ERRORS } from '../../../../src/shared/domain/constants.js';
import * as errors from '../../../../src/shared/domain/errors.js';
import { expect } from '../../../test-helper.js';

describe('Unit | Shared | Domain | Errors', function () {
  it('should export NotFoundError', function () {
    expect(errors.NotFoundError).to.exist;
  });

  it('should export UserNotAuthorizedToAccessEntityError', function () {
    expect(errors.UserNotAuthorizedToAccessEntityError).to.exist;
  });

  it('should export a UserNotAuthorizedToUpdatePasswordError', function () {
    expect(errors.UserNotAuthorizedToUpdatePasswordError).to.exist;
  });

  it('should export NoCertificationAttestationForDivisionError', function () {
    expect(errors.NoCertificationAttestationForDivisionError).to.exist;
  });

  it('should export an EmailModificationDemandNotFoundOrExpiredError', function () {
    expect(errors.EmailModificationDemandNotFoundOrExpiredError).to.exist;
  });

  it('should export an InvalidVerificationCodeError', function () {
    expect(errors.InvalidVerificationCodeError).to.exist;
  });

  context('OidcError', function () {
    it('exports "OidcError" class', function () {
      // then
      expect(errors.OidcError).to.exist;
      expect(errors.OidcError.prototype).to.be.instanceOf(errors.DomainError);
    });

    context('when an instance of "OidcError" is created', function () {
      it('contains "message" and "code" attributes', function () {
        // given
        const message = 'An error occurred';

        // when
        const error = new errors.OidcError({ message });

        // then
        expect(error).to.have.property('code');
        expect(error.code).to.equal('OIDC_GENERIC_ERROR');
        expect(error).to.have.property('message');
        expect(error.message).to.equal('An error occurred');
      });
    });
  });

  describe('#InvalidInputDataError', function () {
    it('exports InvalidInputDataError', function () {
      // then
      expect(errors.InvalidInputDataError).to.exist;
    });

    it('has default error message and code', function () {
      // when
      const error = new errors.InvalidInputDataError();

      // then
      expect(error.message).to.equal('Provided input data is invalid');
      expect(error.code).to.equal('INVALID_INPUT_DATA');
    });
  });

  describe('ModelValidationError', function () {
    it('should export an ModelValidationError', function () {
      expect(errors.ModelValidationError).to.exist;
      expect(errors.ModelValidationError.prototype).to.be.an.instanceOf(errors.DomainError);
    });

    context('#unicityRule', function () {
      it('should populate the  key and the why for the unicity rule', function () {
        //given
        const code = VALIDATION_ERRORS.PROPERTY_NOT_UNIQ;
        const key = 'class-firstName';

        // when
        const error = new errors.ModelValidationError({ key, code });

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
        const error = errors.ModelValidationError.fromJoiError(joiError);

        expect(error.key).to.equal('date');
        expect(error.why).to.equal('date_format');
        expect(error.code).to.equal(VALIDATION_ERRORS.FIELD_DATE_FORMAT);
        expect(error.acceptedFormat).to.equal('YY-MM-DD');
      });

      it('when it is a required error should return an error with code and key from joi', function () {
        const joiError = { context: { key: 'firstName' }, type: 'any.required' };
        const error = errors.ModelValidationError.fromJoiError(joiError);

        expect(error.key).to.equal('firstName');
        expect(error.why).to.equal('field_required');
        expect(error.code).to.equal(VALIDATION_ERRORS.FIELD_REQUIRED);
      });

      context('string', function () {
        it('when it is a min character error should return an error with code and key from joi', function () {
          const joiError = { context: { key: 'nom', limit: 2 }, type: 'string.min' };
          const error = errors.ModelValidationError.fromJoiError(joiError);

          expect(error.key).to.equal('nom');
          expect(error.why).to.equal('string_too_short');
          expect(error.code).to.equal(VALIDATION_ERRORS.FIELD_STRING_MIN);
          expect(error.acceptedFormat).to.equal(2);
        });

        it('when it is a max character error should return an error with code and key from joi', function () {
          const joiError = { context: { key: 'nom', limit: 2 }, type: 'string.max' };
          const error = errors.ModelValidationError.fromJoiError(joiError);

          expect(error.key).to.equal('nom');
          expect(error.why).to.equal('string_too_long');
          expect(error.code).to.equal(VALIDATION_ERRORS.FIELD_STRING_MAX);
          expect(error.acceptedFormat).to.equal(2);
        });
      });
    });
  });

  context('CertificationCenterPilotFeaturesConflictError', function () {
    it('exports "CertificationCenterPilotFeaturesConflictError" class', function () {
      // then
      expect(errors.CertificationCenterPilotFeaturesConflictError).to.exist;
      expect(errors.CertificationCenterPilotFeaturesConflictError.prototype).to.be.instanceOf(errors.DomainError);
    });

    context('when an instance of "CertificationCenterPilotFeaturesConflictError" is created', function () {
      it('contains "message" and "code" attributes', function () {
        // given & when
        const error = new errors.CertificationCenterPilotFeaturesConflictError();

        // then
        expect(error).to.have.property('code');
        expect(error.code).to.equal('PILOT_FEATURES_CONFLICT');
        expect(error).to.have.property('message');
        expect(error.message).to.equal('Certification center pilot features incompatibility');
      });
    });
  });
});
