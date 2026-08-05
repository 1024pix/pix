import { expect } from 'chai';
import sinon from 'sinon';

import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

const TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;

describe('Certification | Session-management | Unit | Domain | Read-models | CandidateAuthorizationInfo', function () {
  let clock;
  const now = new Date('2026-01-02T00:00:00Z');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#isSessionJoinable', function () {
    it('returns true when session is neither finalized nor overtime', function () {
      const twentyThreeHoursBefore = new Date();
      twentyThreeHoursBefore.setHours(twentyThreeHoursBefore.getHours() - 23);
      const candidateAuthorizationInfo = domainBuilder.certification.sessionManagement
        .candidateAuthorizationInfoBuilder()
        .withSession({ finalizedAt: null, startedAt: twentyThreeHoursBefore })
        .build();

      expect(candidateAuthorizationInfo.isSessionJoinable).to.be.true;
    });

    it('returns false when session is finalized', function () {
      const twentyThreeHoursBefore = new Date();
      twentyThreeHoursBefore.setHours(twentyThreeHoursBefore.getHours() - 23);
      const candidateAuthorizationInfo = domainBuilder.certification.sessionManagement
        .candidateAuthorizationInfoBuilder()
        .withSession({ finalizedAt: new Date(), startedAt: twentyThreeHoursBefore })
        .build();

      expect(candidateAuthorizationInfo.isSessionJoinable).to.be.false;
    });

    it('returns false when session has been started more than 24 hours before and thus is overtime', function () {
      const twentyFiveHoursBefore = new Date();
      twentyFiveHoursBefore.setHours(twentyFiveHoursBefore.getHours() - 25);
      const candidateAuthorizationInfo = domainBuilder.certification.sessionManagement
        .candidateAuthorizationInfoBuilder()
        .withSession({ finalizedAt: null, startedAt: twentyFiveHoursBefore })
        .build();

      expect(candidateAuthorizationInfo.isSessionJoinable).to.be.false;
    });
  });

  describe('#hasExceededCertificationDuration', function () {
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

  describe('#get authorizedToStart', function () {
    it('returns true when candidate has been authorized to start within the last 15 minutes', function () {
      const candidateAuthorizationInfo = domainBuilder.certification.sessionManagement
        .candidateAuthorizationInfoBuilder()
        .asAuthorizedToStart()
        .build();

      expect(candidateAuthorizationInfo.authorizedToStart).to.be.true;
    });

    it('returns false when candidate is not authorized to start', function () {
      const candidateAuthorizationInfo = domainBuilder.certification.sessionManagement
        .candidateAuthorizationInfoBuilder()
        .asNotAuthorizedToStart()
        .build();

      expect(candidateAuthorizationInfo.authorizedToStart).to.be.false;
    });

    it('returns false when candidate was authorized beyond 15 minutes ago', function () {
      const candidateAuthorizationInfo = domainBuilder.certification.sessionManagement
        .candidateAuthorizationInfoBuilder()
        .asObsoleteAuthorizedToStart()
        .build();

      expect(candidateAuthorizationInfo.authorizedToStart).to.be.false;
    });
  });
});
