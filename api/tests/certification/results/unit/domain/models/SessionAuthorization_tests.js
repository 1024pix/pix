import { expect } from 'chai';

import { SessionAuthorization } from '../../../../../../src/certification/results/domain/models/SessionAuthorization.js';
import {
  SESSION_STATUSES,
  SessionStatus,
} from '../../../../../../src/certification/shared/domain/value-objects/SessionStatus.ts';

describe('Unit | Domain | Models | SessionAuthorization', function () {
  describe('#canCreateCertificatesPdf', function () {
    [
      { status: SESSION_STATUSES.CREATED, expectedOutput: false },
      { status: SESSION_STATUSES.STARTED, expectedOutput: false },
      { status: SESSION_STATUSES.TO_FINALIZE, expectedOutput: false },
      { status: SESSION_STATUSES.FINALIZED, expectedOutput: false },
      { status: SESSION_STATUSES.IN_PROCESS, expectedOutput: false },
      { status: SESSION_STATUSES.PROCESSED, expectedOutput: true },
    ].forEach(({ status, expectedOutput }) => {
      it('should return true when the session status is atMost Published', function () {
        const sessionAuthorization = new SessionAuthorization({ sessionStatus: new SessionStatus({ status }) });
        // when
        const canCreateCertificatesPdf = sessionAuthorization.canCreateCertificatesPdf;

        // then
        expect(canCreateCertificatesPdf).to.equal(expectedOutput);
      });
    });
  });
});
