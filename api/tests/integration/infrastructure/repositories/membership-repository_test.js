const { expect, knex, databaseBuilder, catchErr } = require('../../../test-helper');
const _ = require('lodash');
const membershipRepository = require('../../../../lib/infrastructure/repositories/membership-repository');
const { MembershipCreationError } = require('../../../../lib/domain/errors');
const Membership = require('../../../../lib/domain/models/Membership');
const Organization = require('../../../../lib/domain/models/Organization');
const User = require('../../../../lib/domain/models/User');

describe('Integration | Infrastructure | Repository | membership-repository', () => {

  beforeEach(() => {
    return databaseBuilder.clean();
  });

  afterEach(() => {
    return databaseBuilder.clean();
  });

  describe('#create', () => {

    let userId;
    let organizationId;
    const organizationRole = Membership.roles.OWNER;

    beforeEach(() => {
      userId = databaseBuilder.factory.buildUser().id;
      organizationId = databaseBuilder.factory.buildOrganization().id;
      return databaseBuilder.commit();
    });

    it('should add a new membership in database', async () => {
      // given
      const beforeNbMemberships = await knex('memberships').count('id as count');

      // when
      await membershipRepository.create(userId, organizationId, organizationRole);

      // then
      const afterNbMemberships = await knex('memberships').count('id as count');
      expect(afterNbMemberships[0].count).to.equal(beforeNbMemberships[0].count + 1);
    });

    it('should return a Membership domain model object', async () => {
      // when
      const membership = await membershipRepository.create(userId, organizationId, organizationRole);

      // then
      expect(membership).to.be.an.instanceOf(Membership);
      expect(membership.organizationRole).to.equal(Membership.roles.OWNER);
    });

    context('Error cases', () => {

      it('should throw a domain error when a membership already exist for user + organization', async () => {
        // given
        await membershipRepository.create(userId, organizationId, organizationRole);

        // when
        const result = await catchErr(membershipRepository.create)(userId, organizationId, organizationRole);

        // then
        expect(result).to.be.instanceOf(MembershipCreationError);
      });
    });
  });

  describe('#findByOrganizationId', () => {

    it('should return Memberships with well defined relationships (OrganizationRole & User)', async () => {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const user = databaseBuilder.factory.buildUser();
      const organizationRole = Membership.roles.OWNER;

      // Matching membership
      databaseBuilder.factory.buildMembership({
        organizationRole,
        organizationId: organization.id,
        userId: user.id,
      });

      // Other memberships
      databaseBuilder.factory.buildMembership();
      databaseBuilder.factory.buildMembership();

      await databaseBuilder.commit();

      // when
      const memberships = await membershipRepository.findByOrganizationId({ organizationId: organization.id });

      // then
      const anyMembership = memberships[0];
      expect(anyMembership).to.be.an.instanceOf(Membership);

      expect(anyMembership.organizationRole).to.equal(Membership.roles.OWNER);
      expect(anyMembership.organizationRole.id).to.equal(organizationRole.id);
      expect(anyMembership.organizationRole.name).to.equal(organizationRole.name);

      expect(anyMembership.user).to.be.an.instanceOf(User);
      expect(anyMembership.user.id).to.equal(user.id);
      expect(anyMembership.user.firstName).to.equal(user.firstName);
      expect(anyMembership.user.lastName).to.equal(user.lastName);
      expect(anyMembership.user.email).to.equal(user.email);
    });

    it('should return all the memberships for a given organization ID with only required relationships', async () => {
      // given
      const organization_1 = databaseBuilder.factory.buildOrganization();
      const organization_2 = databaseBuilder.factory.buildOrganization();

      const user_1 = databaseBuilder.factory.buildUser();
      const user_2 = databaseBuilder.factory.buildUser();
      const user_3 = databaseBuilder.factory.buildUser();

      const organizationRole = Membership.roles.OWNER;

      databaseBuilder.factory.buildMembership({ organizationRole, organizationId: organization_1.id, userId: user_1.id });
      databaseBuilder.factory.buildMembership({ organizationRole, organizationId: organization_1.id, userId: user_2.id });
      databaseBuilder.factory.buildMembership({ organizationRole, organizationId: organization_2.id, userId: user_3.id });

      await databaseBuilder.commit();

      // when
      const memberships = await membershipRepository.findByOrganizationId({ organizationId: organization_1.id });

      // then
      expect(_.map(memberships, 'user.id')).to.have.members([user_1.id, user_2.id]);
    });

    it('should order memberships by id', async () => {
      // given
      const organization = databaseBuilder.factory.buildOrganization();

      const user_1 = databaseBuilder.factory.buildUser();
      const user_2 = databaseBuilder.factory.buildUser();
      const user_3 = databaseBuilder.factory.buildUser();

      const organizationRole = Membership.roles.OWNER;

      const membership_3 = databaseBuilder.factory.buildMembership({ id: 789, organizationRole, organizationId: organization.id, userId: user_3.id });
      const membership_2 = databaseBuilder.factory.buildMembership({ id: 456, organizationRole, organizationId: organization.id, userId: user_2.id });
      const membership_1 = databaseBuilder.factory.buildMembership({ id: 123, organizationRole, organizationId: organization.id, userId: user_1.id });

      await databaseBuilder.commit();

      // when
      const memberships = await membershipRepository.findByOrganizationId({ organizationId: organization.id });

      // then
      expect(_.map(memberships, 'id')).to.deep.include.ordered.members([membership_1.id, membership_2.id, membership_3.id]);
    });

    it('should order memberships by lastName and then by firstName with no sensitive case', async () => {
      // given
      const organization = databaseBuilder.factory.buildOrganization();

      const user_1 = databaseBuilder.factory.buildUser({ lastName: 'Grenier' });
      const user_2 = databaseBuilder.factory.buildUser({ lastName: 'Avatar', firstName: 'Xavier' });
      const user_3 = databaseBuilder.factory.buildUser({ lastName: 'Avatar', firstName: 'Arthur' });
      const user_4 = databaseBuilder.factory.buildUser({ lastName: 'Avatar', firstName: 'MATHURIN' });

      const organizationRole = Membership.roles.OWNER;

      const membership_1 = databaseBuilder.factory.buildMembership({ organizationRole, organizationId: organization.id, userId: user_1.id });
      const membership_2 = databaseBuilder.factory.buildMembership({ organizationRole, organizationId: organization.id, userId: user_2.id });
      const membership_3 = databaseBuilder.factory.buildMembership({ organizationRole, organizationId: organization.id, userId: user_3.id });
      const membership_4 = databaseBuilder.factory.buildMembership({ organizationRole, organizationId: organization.id, userId: user_4.id });

      await databaseBuilder.commit();

      // when
      const memberships = await membershipRepository.findByOrganizationId({ organizationId: organization.id, orderByName: true });

      // then
      expect(_.map(memberships, 'id')).to.deep.include.ordered.members([membership_3.id, membership_4.id, membership_2.id, membership_1.id]);
    });
  });

  describe('#findByUserIdAndOrganizationId', () => {

    context('When organization is not required', () => {

      it('should retrieve membership with given useId and OrganizationId', async () => {
        // given
        const organization = databaseBuilder.factory.buildOrganization();
        const user1 = databaseBuilder.factory.buildUser();
        const organizationRole1 = Membership.roles.OWNER;
        const user2 = databaseBuilder.factory.buildUser();
        const organizationRole2 = Membership.roles.MEMBER;

        databaseBuilder.factory.buildMembership({ organizationRole: organizationRole1, organizationId: organization.id, userId: user1.id });
        const membership2 = databaseBuilder.factory.buildMembership({ organizationRole: organizationRole2, organizationId: organization.id, userId: user2.id });

        await databaseBuilder.commit();

        //when
        const memberships = await membershipRepository.findByUserIdAndOrganizationId({ userId: user2.id, organizationId: organization.id });

        //then
        expect(memberships).to.have.lengthOf(1);
        expect(memberships[0].id).to.equal(membership2.id);
      });
    });

    context('When organization is required', () => {

      it('should retrieve membership and organization with given userId and organizationId', async () => {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const userId = databaseBuilder.factory.buildUser().id;

        databaseBuilder.factory.buildMembership({ organizationId, userId });

        await databaseBuilder.commit();

        //when
        const includeOrganization = true;
        const memberships = await membershipRepository.findByUserIdAndOrganizationId({ userId, organizationId, includeOrganization });

        //then
        expect(memberships).to.have.lengthOf(1);
        const organization = memberships[0].organization;
        expect(organization).to.be.instanceOf(Organization);
      });
    });

  });
});
