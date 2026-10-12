import { expect } from 'chai';

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

  describe('SendingEmailToRefererError', function () {
    it('contains an error message with given referer email in error', function () {
      const error = new errors.SendingEmailToRefererError([
        { email: 'refererMailInError@example.net', code: 'errorCode65', message: 'test error 65' },
      ]);
      expect(error.message).to.equal(
        "Échec lors de l'envoi du mail au(x) référent(s) du centre de certification : refererMailInError@example.net (errorCode65: test error 65)",
      );
    });

    it('contains an error message with all referer emails in error', function () {
      const error = new errors.SendingEmailToRefererError([
        { email: 'refererMailInError@example.net', code: 'errorCode42', message: 'test error 42' },
        { email: 'otherRefererMailInError@example.net', code: 'errorCode53', message: 'test error 53' },
      ]);
      expect(error.message).to.equal(
        "Échec lors de l'envoi du mail au(x) référent(s) du centre de certification : refererMailInError@example.net (errorCode42: test error 42), otherRefererMailInError@example.net (errorCode53: test error 53)",
      );
    });
  });
});
