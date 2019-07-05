const { expect, knex, databaseBuilder, catchErr } = require('../../../test-helper');
const _ = require('lodash');
const membershipRepository = require('../../../../lib/infrastructure/repositories/membership-repository');
const { MembershipCreationError } = require('../../../../lib/domain/errors');
const Membership = require('../../../../lib/domain/models/Membership');
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
      const memberships = await membershipRepository.findByOrganizationId(organization.id);

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
      const memberships = await membershipRepository.findByOrganizationId(organization_1.id);

      // then
      expect(_.map(memberships, 'user.id')).to.have.members([user_1.id, user_2.id]);

    });
  });

});
