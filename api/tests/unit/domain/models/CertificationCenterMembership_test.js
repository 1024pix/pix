import { expect, sinon } from '../../../test-helper.js';
import { CertificationCenterMembership } from '../../../../lib/domain/models/CertificationCenterMembership.js';

describe('Unit | Domain | Models | CertificationCenterMembership', function () {
  const now = new Date('2023-09-12');
  let clock;

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
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
