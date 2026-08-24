import * as errors from '../../../../../src/certification/session-management/domain/errors.js';
import { expect } from '../../../../test-helper.js';

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

  it('should export a ChallengeToBeDeneutralizedNotFoundError', function () {
    expect(errors.ChallengeToBeDeneutralizedNotFoundError).to.exist;
  });

  it('should export a ChallengeToBeNeutralizedNotFoundError', function () {
    expect(errors.ChallengeToBeNeutralizedNotFoundError).to.exist;
  });

  it('should export a SessionNotJoinable error', function () {
    expect(errors.SessionNotJoinable).to.exist;
  });

  it('should export a SessionFinalized error', function () {
    expect(errors.SessionFinalized).to.exist;
  });

  it('should export a certificationCenterIsArchived error', function () {
    expect(errors.CertificationCenterIsArchivedError).to.exist;
  });
});
