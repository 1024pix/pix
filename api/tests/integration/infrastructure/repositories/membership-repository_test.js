const _ = require('lodash');
const { expect, factory, databaseBuilder } = require('../../../test-helper');
const membershipRepository = require('../../../../lib/infrastructure/repositories/membership-repository');
const Membership = require('../../../../lib/domain/models/Membership');
const Organization = require('../../../../lib/domain/models/Organization');
const OrganizationRole = require('../../../../lib/domain/models/OrganizationRole');
const User = require('../../../../lib/domain/models/User');

describe('Integration | Repository | Organization', function() {

  const ORGANIZATION_ID = 111;
  const ROLE_ID = 222;
  const USER_ID = 333;

  describe('#hasMembershipForOrganizationAndUser', () => {

    beforeEach(() => {
      databaseBuilder.factory.buildMembership({
        organizationId: ORGANIZATION_ID,
        organizationRoleId: ROLE_ID,
        userId: USER_ID
      });
      return databaseBuilder.commit();
    });

    afterEach(() => {
      return databaseBuilder.clean();
    });

    it('should resolve a boolean', async () => {
      // when
      const result = await membershipRepository.hasMembershipForOrganizationAndUser(ORGANIZATION_ID, USER_ID);

      // then
      expect(result).to.be.a('boolean');
    });

    it('should resolve "true" when a Membership exist for given Organization ID and User ID', async () => {
      // when
      const result = await membershipRepository.hasMembershipForOrganizationAndUser(ORGANIZATION_ID, USER_ID);

      // then
      expect(result).to.equal(true);
    });

    it('should resolve "false" when there is no Membership for given Organization ID and User ID', async () => {
      // when
      const result = await membershipRepository.hasMembershipForOrganizationAndUser(888, 999);

      // then
      expect(result).to.equal(false);
    });
  });

  describe('#hasMembershipForUser', () => {

    beforeEach(() => {
      databaseBuilder.factory.buildMembership({
        organizationId: ORGANIZATION_ID,
        organizationRoleId: ROLE_ID,
        userId: USER_ID
      });
      return databaseBuilder.commit();
    });

    afterEach(() => {
      return databaseBuilder.clean();
    });

    it('should resolve a boolean', async () => {
      // when
      const result = await membershipRepository.hasMembershipForUser(USER_ID);

      // then
      expect(result).to.be.a('boolean');
    });

    it('should resolve "true" when there is a Membership for given User ID', async () => {
      // when
      const result = await membershipRepository.hasMembershipForUser(USER_ID);

      // then
      expect(result).to.equal(true);
    });

    it('should resolve "false" when there is no Membership for given User ID', async () => {
      // when
      const result = await membershipRepository.hasMembershipForUser(999);

      // then
      expect(result).to.equal(false);
    });
  });

  describe('#findByUserId', () => {

    const ORGANIZATION_A_ID = 1001;
    const ORGANIZATION_B_ID = 1002;

    let user;
    let organizationA;
    let organizationB;
    let role;

    beforeEach(() => {
      // Matching Memberships
      databaseBuilder.factory.buildMembership({ organizationId: ORGANIZATION_A_ID, organizationRoleId: ROLE_ID, userId: USER_ID });
      databaseBuilder.factory.buildMembership({ organizationId: ORGANIZATION_B_ID, organizationRoleId: ROLE_ID, userId: USER_ID });

      // Other Memberships
      databaseBuilder.factory.buildMembership();
      databaseBuilder.factory.buildMembership();

      // Memberships dependencies
      organizationA = factory.buildOrganization({ id: ORGANIZATION_A_ID });
      databaseBuilder.factory.buildOrganization(organizationA);

      organizationB = factory.buildOrganization({ id: ORGANIZATION_B_ID });
      databaseBuilder.factory.buildOrganization(organizationB);

      role = factory.buildOrganizationRole({ id: ROLE_ID });
      databaseBuilder.factory.buildOrganizationRole(role);

      user = factory.buildUser({ id: USER_ID });
      databaseBuilder.factory.buildUser(user);

      return databaseBuilder.commit();
    });

    afterEach(() => {
      return databaseBuilder.clean();
    });

    context('when there are Memberships for given User ID', () => {

      it('should resolve an array of all Memberships', async () => {
        // when
        const memberships = await membershipRepository.findByUserId(USER_ID);

        // then
        expect(memberships).to.be.an('array');
        expect(memberships).to.have.lengthOf(2);
      });

      it('should convert Bookshelf Membership into Domain Object', async () => {
        // when
        const membership = (await membershipRepository.findByUserId(USER_ID))[0];

        // then
        expect(membership).to.be.instanceOf(Membership);

        // assert membership organization
        expect(membership.organization).to.be.instanceOf(Organization);
        expect(membership.organization).to.deep.equal(organizationA);

        // assert membership role
        expect(membership.role).to.be.instanceOf(OrganizationRole);
        expect(membership.role).to.deep.equal(role);

        // assert membership user
        const expectedUser = user;
        expectedUser.memberships = [];
        expectedUser.password = null;
        expectedUser.pixRoles = [];
        expect(membership.user).to.be.instanceOf(User);
        expect(membership.user).to.deep.equal(expectedUser);
      });
    });

    context('when there is no Membership for given User ID', () => {

      it('should resolve empty array', async () => {
        // when
        const memberships = await membershipRepository.findByUserId(111);

        // then
        expect(memberships).to.be.an('array').that.is.empty;
      });
    });
  });
});
