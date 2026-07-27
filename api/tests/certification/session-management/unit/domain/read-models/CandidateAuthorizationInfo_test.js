import { expect } from 'chai';
import sinon from 'sinon';

import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

const TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;

describe('Certification | Session-management | Unit | Domain | Read-models | CandidateAuthorizationInfo', function () {
  describe('#isSessionAccessible', function () {
    it('returns true when session is accessible', function () {
      const candidateAuthorizationInfo = domainBuilder.certification.sessionManagement
        .candidateAuthorizationInfoBuilder()
        .withSession({ isAccessible: true })
        .build();

      expect(candidateAuthorizationInfo.isSessionAccessible).to.be.true;
    });
    it('returns false when session is not accessible', function () {
      const candidateAuthorizationInfo = domainBuilder.certification.sessionManagement
        .candidateAuthorizationInfoBuilder()
        .withSession({ isAccessible: false })
        .build();

      expect(candidateAuthorizationInfo.isSessionAccessible).to.be.false;
    });
  });

  describe('#hasExceededCertificationDuration', function () {
    let clock;
    const now = new Date('2026-01-02T00:00:00Z');

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('returns false when candidate has not started a certification', function () {
      const candidateAuthorizationInfo = domainBuilder.certification.sessionManagement
        .candidateAuthorizationInfoBuilder()
        .build();

      expect(candidateAuthorizationInfo.hasExceededCertificationDuration).to.be.false;
    });

    it('returns true when the elapsed duration exceeds 24 hours by one millisecond', function () {
      const startDate = new Date(now.getTime() - TWENTY_FOUR_HOURS_IN_MS - 1);
      const candidateAuthorizationInfo = domainBuilder.certification.sessionManagement
        .candidateAuthorizationInfoBuilder()
        .withCertificationStartedAt({ certificationId: 123, startedAt: startDate })
        .build();

      expect(candidateAuthorizationInfo.hasExceededCertificationDuration).to.be.true;
    });

    it('returns false when exactly 24 hours have elapsed since the start date', function () {
      const startDate = new Date(now.getTime() - TWENTY_FOUR_HOURS_IN_MS);
      const candidateAuthorizationInfo = domainBuilder.certification.sessionManagement
        .candidateAuthorizationInfoBuilder()
        .withCertificationStartedAt({ certificationId: 123, startedAt: startDate })
        .build();

      expect(candidateAuthorizationInfo.hasExceededCertificationDuration).to.be.false;
    });

    it('returns false when less than 24 hours have elapsed since the start date', function () {
      const startDate = new Date(now.getTime() - (TWENTY_FOUR_HOURS_IN_MS - 1));
      const candidateAuthorizationInfo = domainBuilder.certification.sessionManagement
        .candidateAuthorizationInfoBuilder()
        .withCertificationStartedAt({ certificationId: 123, startedAt: startDate })
        .build();

      expect(candidateAuthorizationInfo.hasExceededCertificationDuration).to.be.false;
    });
  });

  describe('#isCenterHabilitatedForCandidateSubscription', function () {
    it('returns true when candidate has subscribed to a certification the center is habilitated for', function () {
      const candidateAuthorizationInfo = domainBuilder.certification.sessionManagement
        .candidateAuthorizationInfoBuilder()
        .subscribedTo({ framework: Frameworks.PRO_SANTE })
        .withCenterHabilitation({ scope: Frameworks.PRO_SANTE })
        .build();

      expect(candidateAuthorizationInfo.isCenterHabilitatedForCandidateSubscription).to.be.true;
    });

    it('returns false when candidate has subscribed to a certification the center is not habilitated for', function () {
      const candidateAuthorizationInfo = domainBuilder.certification.sessionManagement
        .candidateAuthorizationInfoBuilder()
        .subscribedTo({ framework: Frameworks.EDU_CPE })
        .withCenterHabilitation({ scope: Frameworks.PRO_SANTE })
        .withCenterHabilitation({ scope: Frameworks.EDU_1ER_DEGRE })
        .build();

      expect(candidateAuthorizationInfo.isCenterHabilitatedForCandidateSubscription).to.be.false;
    });
  });
});
