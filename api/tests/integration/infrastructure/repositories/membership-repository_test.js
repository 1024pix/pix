const { expect, knex, databaseBuilder, sinon } = require('../../../test-helper');
const membershipRepository = require('../../../../lib/infrastructure/repositories/membership-repository');
const { MembershipCreationError } = require('../../../../lib/domain/errors');
const Membership = require('../../../../lib/domain/models/Membership');
const Organization = require('../../../../lib/domain/models/Organization');
const OrganizationRole = require('../../../../lib/domain/models/OrganizationRole');
const User = require('../../../../lib/domain/models/User');
const BookshelfMembership = require('../../../../lib/infrastructure/data/membership');

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
    let organizationRoleId;

    beforeEach(() => {
      userId = databaseBuilder.factory.buildUser().id;
      organizationId = databaseBuilder.factory.buildOrganization().id;
      organizationRoleId = databaseBuilder.factory.buildOrganizationRole().id;
      return databaseBuilder.commit();
    });

    it('should add a new membership in database', async () => {
      // given
      const beforeNbMemberships = await knex('memberships').count('id as count');

      // when
      await membershipRepository.create(userId, organizationId, organizationRoleId);

      // then
      const afterNbMemberships = await knex('memberships').count('id as count');
      expect(afterNbMemberships[0].count).to.equal(beforeNbMemberships[0].count + 1);
    });

    it('should return a Membership domain model object', async () => {
      // when
      const membership = await membershipRepository.create(userId, organizationId, organizationRoleId);

      // then
      expect(membership).to.be.an.instanceOf(Membership);
      expect(membership.organization).to.be.an.instanceOf(Organization);
      expect(membership.organizationRole).to.be.an.instanceOf(OrganizationRole);
    });

    context('Error cases', () => {

      it('should throw a domain error when a membership already exist for user + organization', async () => {
        // given
        await membershipRepository.create(userId, organizationId, organizationRoleId);

        // when
        const promise = membershipRepository.create(userId, organizationId, organizationRoleId);

        // then
        return expect(promise).to.have.been.rejectedWith(MembershipCreationError);
      });

      context('when an unexpected error occurred', () => {

        // given
        beforeEach(() => {
          sinon.stub(BookshelfMembership.prototype, 'save');
        });
      });
    });
  });

  describe('#findByOrganizationId', () => {

    let organization;
    let organizationRole;
    let user;

    beforeEach(() => {
      organization = databaseBuilder.factory.buildOrganization();
      organizationRole = databaseBuilder.factory.buildOrganizationRole();
      user = databaseBuilder.factory.buildUser();

      // Matching membership
      databaseBuilder.factory.buildMembership({
        organizationId: organization.id,
        organizationRoleId: organizationRole.id,
        userId: user.id
      });

      // Other memberships
      databaseBuilder.factory.buildMembership();
      databaseBuilder.factory.buildMembership();

      return databaseBuilder.commit();
    });

    it('should return all the Memberships associated to the given Organization', async () => {
      // when
      const memberships = await membershipRepository.findByOrganizationId(organization.id);

      // then
      expect(memberships.length).to.equal(1);
      expect(memberships[0]).to.be.an.instanceOf(Membership);
    });

    it('should return Memberships with well defined relationships (Organization, OrganizationRole & User)', async () => {
      // when
      const memberships = await membershipRepository.findByOrganizationId(organization.id);

      // then
      const anyMembership = memberships[0];
      expect(anyMembership).to.be.an.instanceOf(Membership);

      expect(anyMembership.organization).to.be.an.instanceOf(Organization);
      expect(anyMembership.organization.id).to.equal(organization.id);
      expect(anyMembership.organization.name).to.equal(organization.name);
      expect(anyMembership.organization.type).to.equal(organization.type);
      expect(anyMembership.organization.code).to.equal(organization.code);

      expect(anyMembership.organizationRole).to.be.an.instanceOf(OrganizationRole);
      expect(anyMembership.organizationRole.id).to.equal(organizationRole.id);
      expect(anyMembership.organizationRole.name).to.equal(organizationRole.name);

      expect(anyMembership.user).to.be.an.instanceOf(User);
      expect(anyMembership.user.id).to.equal(user.id);
      expect(anyMembership.user.firstName).to.equal(user.firstName);
      expect(anyMembership.user.lastName).to.equal(user.lastName);
      expect(anyMembership.user.email).to.equal(user.email);
    });

  });

});
