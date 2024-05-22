import * as errors from '../../../../../src/certification/session-management/domain/errors.js';
import { expect } from '../../../../test-helper.js';

describe('Certification | session | Unit | Domain | Errors', function () {
  it('should export a SessionAlreadyFinalizedError', function () {
    expect(errors.SessionAlreadyFinalizedError).to.exist;
  });

  it('should export a SessionWithoutStartedCertificationError', function () {
    expect(errors.SessionWithoutStartedCertificationError).to.exist;
  });

  it('should export a SessionWithAbortReasonOnCompletedCertificationCourseError', function () {
    expect(errors.SessionWithAbortReasonOnCompletedCertificationCourseError).to.exist;
  });

  it('should export a SessionWithMissingAbortReasonError', function () {
    expect(errors.SessionWithMissingAbortReasonError).to.exist;
  });

  it('should export a CsvWithNoSessionDataError', function () {
    expect(errors.CsvWithNoSessionDataError).to.exist;
  });
});
