import { expect } from 'chai';

import { SessionSummary } from '../../../../../../src/certification/session-management/domain/read-models/SessionSummary.js';
import { SESSION_STATUSES } from '../../../../../../src/certification/shared/domain/value-objects/SessionStatus.ts';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
describe('Unit | Domain | Read-Models | SessionSummary', function () {
  describe('#constructor', function () {
    [
      { inputStatus: SESSION_STATUSES.CREATED, expectedStatus: SESSION_STATUSES.CREATED },
      { inputStatus: SESSION_STATUSES.STARTED, expectedStatus: SESSION_STATUSES.CREATED },
      { inputStatus: SESSION_STATUSES.TO_FINALIZE, expectedStatus: SESSION_STATUSES.TO_FINALIZE },
      { inputStatus: SESSION_STATUSES.FINALIZED, expectedStatus: SESSION_STATUSES.FINALIZED },
      { inputStatus: SESSION_STATUSES.IN_PROCESS, expectedStatus: SESSION_STATUSES.FINALIZED },
      { inputStatus: SESSION_STATUSES.PROCESSED, expectedStatus: SESSION_STATUSES.PROCESSED },
    ].forEach(({ inputStatus, expectedStatus }) => {
      it(`builds a SessionSummary with displayed status ${expectedStatus} when session is really in status ${inputStatus}`, function () {
        const sessionStatus = domainBuilder.certification.shared
          .sessionStatusBuilder()
          .withParameters({ status: inputStatus })
          .build();
        const sessionSummary = new SessionSummary({ sessionStatus });

        expect(sessionSummary.status).to.equal(expectedStatus);
      });
    });
  });
});
