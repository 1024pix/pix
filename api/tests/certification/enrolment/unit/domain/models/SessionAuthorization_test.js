import { expect } from 'chai';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Certification | Enrolment | Domain | Models | SessionAuthorization', function () {
  describe('#get canEnrollCandidateIndividually', function () {
    it('returns true when session accepts individual enrolment', function () {
      const sessionStatus = domainBuilder.certification.shared.sessionStatusBuilder().created().build();
      const sessionAuthorization = domainBuilder.certification.enrolment
        .sessionAuthorizationBuilder()
        .withParameters({ id: 123, sessionStatus })
        .build();

      expect(sessionAuthorization.canEnrollCandidateIndividually).to.be.true;
    });

    it('returns false when session does not accept individual enrolment', function () {
      const sessionStatus = domainBuilder.certification.shared.sessionStatusBuilder().toFinalize().build();
      const sessionAuthorization = domainBuilder.certification.enrolment
        .sessionAuthorizationBuilder()
        .withParameters({ id: 123, sessionStatus })
        .build();

      expect(sessionAuthorization.canEnrollCandidateIndividually).to.be.false;
    });
  });

  describe('#get canEnrollScoCandidate', function () {
    it('returns true when session accepts SCO enrolment', function () {
      const sessionStatus = domainBuilder.certification.shared.sessionStatusBuilder().created().build();
      const sessionAuthorization = domainBuilder.certification.enrolment
        .sessionAuthorizationBuilder()
        .withParameters({ id: 123, sessionStatus })
        .build();

      expect(sessionAuthorization.canEnrollScoCandidate).to.be.true;
    });

    it('returns false when session does not accept SCO enrolment', function () {
      const sessionStatus = domainBuilder.certification.shared.sessionStatusBuilder().toFinalize().build();
      const sessionAuthorization = domainBuilder.certification.enrolment
        .sessionAuthorizationBuilder()
        .withParameters({ id: 123, sessionStatus })
        .build();

      expect(sessionAuthorization.canEnrollScoCandidate).to.be.false;
    });
  });

  describe('#get canEnrollCandidateViaODS', function () {
    it('returns true when session accepts ODS enrolment', function () {
      const sessionStatus = domainBuilder.certification.shared.sessionStatusBuilder().created().build();
      const sessionAuthorization = domainBuilder.certification.enrolment
        .sessionAuthorizationBuilder()
        .withParameters({ id: 123, sessionStatus })
        .build();

      expect(sessionAuthorization.canEnrollCandidateViaODS).to.be.true;
    });

    it('returns false when session does not accept ODS enrolment', function () {
      const sessionStatus = domainBuilder.certification.shared.sessionStatusBuilder().toFinalize().build();
      const sessionAuthorization = domainBuilder.certification.enrolment
        .sessionAuthorizationBuilder()
        .withParameters({ id: 123, sessionStatus })
        .build();

      expect(sessionAuthorization.canEnrollCandidateViaODS).to.be.false;
    });
  });

  describe('#get canEnrollCandidateViaMassImport', function () {
    it('returns true when session accepts mass import enrolment', function () {
      const sessionStatus = domainBuilder.certification.shared.sessionStatusBuilder().created().build();
      const sessionAuthorization = domainBuilder.certification.enrolment
        .sessionAuthorizationBuilder()
        .withParameters({ id: 123, sessionStatus })
        .build();

      expect(sessionAuthorization.canEnrollCandidateViaMassImport).to.be.true;
    });

    it('returns false when session does not accept mass import enrolment', function () {
      const sessionStatus = domainBuilder.certification.shared.sessionStatusBuilder().toFinalize().build();
      const sessionAuthorization = domainBuilder.certification.enrolment
        .sessionAuthorizationBuilder()
        .withParameters({ id: 123, sessionStatus })
        .build();

      expect(sessionAuthorization.canEnrollCandidateViaMassImport).to.be.false;
    });
  });

  describe('#get canJoinSession', function () {
    it('returns true when session can be joined by a candidate', function () {
      const sessionStatus = domainBuilder.certification.shared.sessionStatusBuilder().created().build();
      const sessionAuthorization = domainBuilder.certification.enrolment
        .sessionAuthorizationBuilder()
        .withParameters({ id: 123, sessionStatus })
        .build();

      expect(sessionAuthorization.canJoinSession).to.be.true;
    });

    it('returns false when session cannot be joined by a candidate', function () {
      const sessionStatus = domainBuilder.certification.shared.sessionStatusBuilder().toFinalize().build();
      const sessionAuthorization = domainBuilder.certification.enrolment
        .sessionAuthorizationBuilder()
        .withParameters({ id: 123, sessionStatus })
        .build();

      expect(sessionAuthorization.canJoinSession).to.be.false;
    });
  });
});
