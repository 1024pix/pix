import * as errors from '../../../../src/shared/domain/errors.js';
import { expect } from '../../../test-helper.js';

describe('Unit | Shared | Domain | Errors', function () {
  it('should export NotFoundError', function () {
    expect(errors.NotFoundError).to.exist;
  });

  it('should export UserNotAuthorizedToAccessEntityError', function () {
    expect(errors.UserNotAuthorizedToAccessEntityError).to.exist;
  });

  it('should export NoCertificationAttestationForDivisionError', function () {
    expect(errors.NoCertificationAttestationForDivisionError).to.exist;
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
});
