import { expect } from 'chai';

import { CertificationCandidate } from '../../../../../../src/certification/session-management/domain/models/CertificationCandidate.js';

describe('Certification | Session Management | Unit | Domain | Models | Certification Candidate', function () {
  describe('constructor', function () {
    it('should build a Certification Candidate', function () {
      // given
      const date = new Date();
      const rawData = {
        userId: 2,
        reconciledAt: date,
      };

      const expectedData = {
        userId: 2,
        reconciledAt: date,
      };

      // when
      const certificationCandidate = new CertificationCandidate(rawData);

      // then
      expect(certificationCandidate).to.deep.equal(expectedData);
    });
  });
});
