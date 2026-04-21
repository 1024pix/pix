import * as errors from '../../../../../src/certification/session-management/domain/errors.js';

describe('Certification | session-management | Unit | Domain | Errors', function () {
  it('should export a SessionAlreadyFinalizedError', function () {
    expect(errors.SessionAlreadyFinalizedError).to.exist;
  });

  it('should export a SessionWithoutStartedCertificationError', function () {
    expect(errors.SessionWithoutStartedCertificationError).to.exist;
  });

  it('should export a SessionWithMissingAbortReasonError', function () {
    expect(errors.SessionWithMissingAbortReasonError).to.exist;
  });

  it('should export a CsvWithNoSessionDataError', function () {
    expect(errors.CsvWithNoSessionDataError).to.exist;
  });

  it('should export a ChallengeToBeDeneutralizedNotFoundError', function () {
    expect(errors.ChallengeToBeDeneutralizedNotFoundError).to.exist;
  });

  it('should export a ChallengeToBeNeutralizedNotFoundError', function () {
    expect(errors.ChallengeToBeNeutralizedNotFoundError).to.exist;
  });

  it('should export a SessionNotAccessible error', function () {
    expect(errors.SessionNotAccessible).to.exist;
  });

  it('should export a certificationCenterIsArchived error', function () {
    expect(errors.CertificationCenterIsArchivedError).to.exist;
  });
});
