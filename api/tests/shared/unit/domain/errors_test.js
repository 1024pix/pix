import { expect } from '../../../test-helper.js';

import * as errors from '../../../../src/shared/domain/errors.js';

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
      it('contains "message", "code" and "meta" attributes', function () {
        // given
        const code = 'OIDC_ERROR_CODE';
        const message = 'An error occurred';
        const meta = { data: 'data' };

        // when
        const error = new errors.OidcError({ code, message, meta });

        // then
        expect(error).to.have.property('code');
        expect(error.code).to.equal('OIDC_ERROR_CODE');
        expect(error).to.have.property('message');
        expect(error.message).to.equal('An error occurred');
        expect(error).to.have.property('meta');
        expect(error.meta).to.deep.equal({ data: 'data' });
      });
    });
  });
});
