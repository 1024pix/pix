import { expect } from '../../test-helper';
import { buildCertificationCenterMemberships } from '../../../scripts/create-certification-center-memberships-from-organization-admins';

describe('Unit | Scripts | create-certification-center-memberships-from-organization-admins.js', function () {
  describe('#buildCertificationCenterMemberships', function () {
    it('should build the list of certification center memberships', function () {
      // given
      const membershipUserIds = [1, 5];
      const certificationCenterId = 100;

      const expectedCertificationCenterMemberships = [
        { certificationCenterId, userId: 1 },
        { certificationCenterId, userId: 5 },
      ];

      // when
      const result = buildCertificationCenterMemberships({ certificationCenterId, membershipUserIds });

      // then
      expect(result).to.deep.equal(expectedCertificationCenterMemberships);
    });
  });
});
