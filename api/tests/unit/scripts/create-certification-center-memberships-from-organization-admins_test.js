const { expect } = require('../../test-helper');

const { buildCertificationCenterMemberships } = require('../../../scripts/create-certification-center-memberships-from-organization-admins');

describe('Unit | Scripts | create-certification-center-memberships-from-organization-admins.js', () => {

  describe('#buildCertificationCenterMemberships', () => {

    it('should build the list of certification center memberships', () => {
      // given
      const memberships = [{ userId: 1 }, { userId: 5 }];
      const certificationCenterId = 100;

      const expectedCertificationCenterMemberships = [
        { certificationCenterId, userId: 1 },
        { certificationCenterId, userId: 5 }
      ];

      // when
      const result = buildCertificationCenterMemberships({ certificationCenterId, memberships });

      // then
      expect(result).to.deep.equal(expectedCertificationCenterMemberships);
    });
  });

});
