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
});
