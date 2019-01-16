const {
  expect,
  knex,
  databaseBuilder,
  sinon
} = require('../../../test-helper');
const membershipRepository = require('../../../../lib/infrastructure/repositories/membership-repository');
const { MembershipCreationError } = require('../../../../lib/domain/errors');
const { InfrastructureError } = require('../../../../lib/infrastructure/errors');
const Membership = require('../../../../lib/domain/models/Membership');
const Organization = require('../../../../lib/domain/models/Organization');
const OrganizationRole = require('../../../../lib/domain/models/OrganizationRole');
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

        it('should throw an infrastructure error when an unexpected error occurred', async () => {
          // given
          BookshelfMembership.prototype.save.rejects(new Error());

          // when
          const promise = membershipRepository.create(userId, organizationId, organizationRoleId);

          // then
          return expect(promise).to.have.been.rejectedWith(InfrastructureError);
        });

      });
    });
  });

});
