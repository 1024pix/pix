import { expect } from 'chai';

import { CertificationCandidate } from '../../../../../../src/certification/session-management/domain/models/CertificationCandidate.js';

describe('Certification | Session Management | Unit | Domain | Models | Certification Candidate', function () {
  describe('constructor', function () {
    it('should build a Certification Candidate', function () {
      // given
      const date = new Date();
      const rawData = {
        id: 2,
        userId: 2,
        reconciledAt: date,
        resultRecipientEmail: 'somerecipientmail@example.net',
      };

      const expectedData = {
        id: 2,
        userId: 2,
        reconciledAt: date,
        resultRecipientEmail: 'somerecipientmail@example.net',
      };

      // when
      const certificationCandidate = new CertificationCandidate(rawData);

      // then
      expect(certificationCandidate).to.deep.equal(expectedData);
    });
  });
});
