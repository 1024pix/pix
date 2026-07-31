import { expect } from 'chai';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Certification | Enrolment | Domain | Models | SessionAuthorization', function () {
  describe('#get canEnrollCandidateIndividually', function () {
    it('returns false when session is finalized', function () {
      const sessionAuthorization = domainBuilder.certification.enrolment
        .sessionAuthorizationBuilder()
        .withParameters({ id: 123, isFinalized: true, hasExpired: false })
        .build();

      expect(sessionAuthorization.canEnrollCandidateIndividually).to.be.false;
    });

    it('returns false when session has expired', function () {
      const sessionAuthorization = domainBuilder.certification.enrolment
        .sessionAuthorizationBuilder()
        .withParameters({ id: 123, isFinalized: false, hasExpired: true })
        .build();

      expect(sessionAuthorization.canEnrollCandidateIndividually).to.be.false;
    });

    it('returns true when session has neither expired or been finalized', function () {
      const sessionAuthorization = domainBuilder.certification.enrolment
        .sessionAuthorizationBuilder()
        .withParameters({ id: 123, isFinalized: false, hasExpired: false })
        .build();

      expect(sessionAuthorization.canEnrollCandidateIndividually).to.be.true;
    });
  });

  describe('#get canEnrollScoCandidate', function () {
    it('returns false when session is finalized', function () {
      const sessionAuthorization = domainBuilder.certification.enrolment
        .sessionAuthorizationBuilder()
        .withParameters({ id: 123, isFinalized: true, hasExpired: false })
        .build();

      expect(sessionAuthorization.canEnrollScoCandidate).to.be.false;
    });

    it('returns false when session has expired', function () {
      const sessionAuthorization = domainBuilder.certification.enrolment
        .sessionAuthorizationBuilder()
        .withParameters({ id: 123, isFinalized: false, hasExpired: true })
        .build();

      expect(sessionAuthorization.canEnrollScoCandidate).to.be.false;
    });

    it('returns true when session has neither expired or been finalized', function () {
      const sessionAuthorization = domainBuilder.certification.enrolment
        .sessionAuthorizationBuilder()
        .withParameters({ id: 123, isFinalized: false, hasExpired: false })
        .build();

      expect(sessionAuthorization.canEnrollScoCandidate).to.be.true;
    });
  });

  describe('#get canEnrollCandidateViaODS', function () {
    it('returns false when session is started', function () {
      const sessionAuthorization = domainBuilder.certification.enrolment
        .sessionAuthorizationBuilder()
        .withParameters({ id: 123, hasStarted: true })
        .build();

      expect(sessionAuthorization.canEnrollCandidateViaODS).to.be.false;
    });

    it('returns true when session is not started', function () {
      const sessionAuthorization = domainBuilder.certification.enrolment
        .sessionAuthorizationBuilder()
        .withParameters({ id: 123, hasStarted: false })
        .build();

      expect(sessionAuthorization.canEnrollCandidateViaODS).to.be.true;
    });
  });

  describe('#get canEnrollCandidateViaMassImport', function () {
    it('returns false when session is started', function () {
      const sessionAuthorization = domainBuilder.certification.enrolment
        .sessionAuthorizationBuilder()
        .withParameters({ id: 123, hasStarted: true })
        .build();

      expect(sessionAuthorization.canEnrollCandidateViaMassImport).to.be.false;
    });

    it('returns true when session is not started', function () {
      const sessionAuthorization = domainBuilder.certification.enrolment
        .sessionAuthorizationBuilder()
        .withParameters({ id: 123, hasStarted: false })
        .build();

      expect(sessionAuthorization.canEnrollCandidateViaMassImport).to.be.true;
    });
  });
});
