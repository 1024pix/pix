import { expect } from 'chai';

import { SessionAuthorization } from '../../../../../../src/certification/results/domain/models/SessionAuthorization.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Certification | Result | Domain | Models | SessionAuthorization', function () {
  describe('#get canResultRecipientDownloadResult', function () {
    it('returns true when session is processed', function () {
      const sessionStatus = domainBuilder.certification.shared.sessionStatusBuilder().processed().build();

      const sessionAuthorization = new SessionAuthorization({ id: 123, sessionStatus });

      expect(sessionAuthorization.canResultRecipientDownloadResult()).to.be.true;
    });

    it('returns false when session is not processed', function () {
      const sessionStatus = domainBuilder.certification.shared.sessionStatusBuilder().created().build();

      const sessionAuthorization = new SessionAuthorization({ id: 123, sessionStatus });

      expect(sessionAuthorization.canResultRecipientDownloadResult()).to.be.false;
    });
  });
});
