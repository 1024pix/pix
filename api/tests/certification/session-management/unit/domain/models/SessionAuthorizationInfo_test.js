import { expect } from 'chai';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Certification | SessionManagement | Domain | Models | SessionAuthorizationInfo', function () {
  describe('#get canJoin', function () {
    context('when certification center is archived', function () {
      it('returns false when session can theoritically be joined by a candidate', function () {
        const sessionStatus = domainBuilder.certification.shared.sessionStatusBuilder().created().build();
        const sessionAuthorizationInfo = domainBuilder.certification.sessionManagement
          .sessionAuthorizationInfoBuilder()
          .certificationCenterIsArchived()
          .withParameters({ id: 123, sessionStatus })
          .build();

        expect(sessionAuthorizationInfo.canJoin).to.be.false;
      });

      it('returns false when session cannot be joined by a candidate', function () {
        const sessionStatus = domainBuilder.certification.shared.sessionStatusBuilder().toFinalize().build();
        const sessionAuthorizationInfo = domainBuilder.certification.sessionManagement
          .sessionAuthorizationInfoBuilder()
          .certificationCenterIsArchived()
          .withParameters({ id: 123, sessionStatus })
          .build();

        expect(sessionAuthorizationInfo.canJoin).to.be.false;
      });
    });
    context('when certification center is not archived', function () {
      it('returns true when session can be joined by a candidate', function () {
        const sessionStatus = domainBuilder.certification.shared.sessionStatusBuilder().created().build();
        const sessionAuthorizationInfo = domainBuilder.certification.sessionManagement
          .sessionAuthorizationInfoBuilder()
          .certificationCenterIsNotArchived()
          .withParameters({ id: 123, sessionStatus })
          .build();

        expect(sessionAuthorizationInfo.canJoin).to.be.true;
      });

      it('returns false when session cannot be joined by a candidate', function () {
        const sessionStatus = domainBuilder.certification.shared.sessionStatusBuilder().toFinalize().build();
        const sessionAuthorizationInfo = domainBuilder.certification.sessionManagement
          .sessionAuthorizationInfoBuilder()
          .certificationCenterIsNotArchived()
          .withParameters({ id: 123, sessionStatus })
          .build();

        expect(sessionAuthorizationInfo.canJoin).to.be.false;
      });
    });
  });

  describe('#isPasswordValid', function () {
    it('should return true when the invigilator password match', function () {
      const sessionAuthorizationInfo = domainBuilder.certification.sessionManagement
        .sessionAuthorizationInfoBuilder()
        .withParameters({ id: 123, invigilatorPassword: 'SALUT LES AMIS' })
        .build();

      expect(sessionAuthorizationInfo.isPasswordValid('SALUT LES AMIS')).to.be.true;
    });

    it('should return false when the invigilator password does not match', function () {
      const sessionAuthorizationInfo = domainBuilder.certification.sessionManagement
        .sessionAuthorizationInfoBuilder()
        .withParameters({ id: 123, invigilatorPassword: 'SALUT LES AMIS' })
        .build();

      expect(sessionAuthorizationInfo.isPasswordValid('SaLUT lES AMIS')).to.be.false;
    });
  });
});
