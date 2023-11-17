import { expect, sinon } from '../../../test-helper.js';
import {
  CERTIFICATION_CENTER_MEMBERSHIP_ROLES,
  CertificationCenterMembership,
} from '../../../../lib/domain/models/CertificationCenterMembership.js';

describe('Unit | Domain | Models | CertificationCenterMembership', function () {
  const now = new Date('2023-09-12');
  let clock;

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  describe('getters', function () {
    describe('#hasAdminRole', function () {
      context('when role is "ADMIN"', function () {
        it('returns true', function () {
          // given
          const certificationCenterMembership = new CertificationCenterMembership({
            role: CERTIFICATION_CENTER_MEMBERSHIP_ROLES.ADMIN,
          });

          // when
          const result = certificationCenterMembership.hasAdminRole;

          // then
          expect(result).to.be.true;
        });
      });

      context('when role is "MEMBER"', function () {
        it('returns false', function () {
          // given
          const certificationCenterMembership = new CertificationCenterMembership({
            role: CERTIFICATION_CENTER_MEMBERSHIP_ROLES.MEMBER,
          });

          // when
          const result = certificationCenterMembership.hasAdminRole;

          // then
          expect(result).to.be.false;
        });
      });
    });
  });

  describe('#updateRole', function () {
    it('updates certification center membership "role" and "updatedByUserId" attributes', async function () {
      // given
      const role = 'ADMIN';
      const updatedByUserId = 1;
      const certificationCenterMembership = new CertificationCenterMembership();
      const expectedCertificationCenterMembership = new CertificationCenterMembership({
        ...certificationCenterMembership,
        role: 'ADMIN',
        updatedAt: now,
        updatedByUserId,
      });

      // when
      certificationCenterMembership.updateRole({ role, updatedByUserId });

      // then
      expect(certificationCenterMembership).to.deep.equal(expectedCertificationCenterMembership);
    });
  });
});
