import { expect } from 'chai';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Session-management | Unit | Domain | Read-models | SessionAuthorizationInfo', function () {
  describe('#get isFinalized', function () {
    it('returns true when session is finalized', function () {
      const sessionAuthorizationinfo = domainBuilder.certification.sessionManagement
        .sessionAuthorizationInfoBuilder()
        .isFinalized()
        .build();

      expect(sessionAuthorizationinfo.isFinalized).to.be.true;
    });

    it('returns false when session is not finalized', function () {
      const sessionAuthorizationinfo = domainBuilder.certification.sessionManagement
        .sessionAuthorizationInfoBuilder()
        .build();

      expect(sessionAuthorizationinfo.isFinalized).to.be.false;
    });
  });

  describe('#get hasExpired', function () {
    it('returns false when session has no certification ongoing', function () {
      const sessionAuthorizationinfo = domainBuilder.certification.sessionManagement
        .sessionAuthorizationInfoBuilder()
        .build();

      expect(sessionAuthorizationinfo.hasExpired).to.be.false;
    });

    it('returns false when session has a certification ongoing that started less than 24 hours ago', function () {
      const startDateTime = new Date();
      startDateTime.setHours(startDateTime.getHours() - 23);
      const sessionAuthorizationinfo = domainBuilder.certification.sessionManagement
        .sessionAuthorizationInfoBuilder()
        .withFirstCertificationStarted({ at: startDateTime })
        .build();

      expect(sessionAuthorizationinfo.hasExpired).to.be.false;
    });

    it('returns true when session has a certification ongoing that started more than 24 hours ago', function () {
      const startDateTime = new Date();
      startDateTime.setHours(startDateTime.getHours() - 25);
      const sessionAuthorizationinfo = domainBuilder.certification.sessionManagement
        .sessionAuthorizationInfoBuilder()
        .withFirstCertificationStarted({ at: startDateTime })
        .build();

      expect(sessionAuthorizationinfo.hasExpired).to.be.true;
    });
  });
});
