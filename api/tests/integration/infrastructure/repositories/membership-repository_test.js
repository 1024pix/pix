const { expect, databaseBuilder } = require('../../../test-helper');
const membershipRepository = require('../../../../lib/infrastructure/repositories/membership-repository');

describe('Integration | Repository | Organization', function() {

  describe('#hasAccessToOrganization', () => {

    const ORGANIZATION_ID = 111;
    const ROLE_ID = 222;
    const USER_ID = 333;

    beforeEach(() => {
      // Matching Membership
      databaseBuilder.factory.buildMembership({ organizationId: ORGANIZATION_ID, roleId: ROLE_ID, userId: USER_ID });

      // Other Memberships
      databaseBuilder.factory.buildMembership();
      databaseBuilder.factory.buildMembership();
      databaseBuilder.factory.buildMembership();

      return databaseBuilder.commit();
    });

    afterEach(() => {
      return databaseBuilder.clean();
    });

    it('should resolve a Boolean', async () => {
      // when
      const result = await membershipRepository.hasAccessToOrganization(ORGANIZATION_ID, USER_ID);

      // then
      expect(result).to.be.a('boolean');
    });

    it('should resolve "true" when a Membership exist for given Organization ID and User ID', async () => {
      // when
      const result = await membershipRepository.hasAccessToOrganization(ORGANIZATION_ID, USER_ID);

      // then
      expect(result).to.equal(true);
    });

    it('should resolve "false" when there is no Membership for given Organization ID and User ID', async () => {
      // when
      const result = await membershipRepository.hasAccessToOrganization(888, 999);

      // then
      expect(result).to.equal(false);
    });
  });
});
