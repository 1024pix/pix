import { expect, knex, databaseBuilder, catchErr, sinon } from '../../../test-helper.js';
import _ from 'lodash';
import * as membershipRepository from '../../../../lib/infrastructure/repositories/membership-repository.js';
import { MembershipCreationError, MembershipUpdateError, NotFoundError } from '../../../../lib/domain/errors.js';
import { Membership } from '../../../../lib/domain/models/Membership.js';
import { Organization } from '../../../../lib/domain/models/Organization.js';
import { User } from '../../../../lib/domain/models/User.js';

describe('Integration | Infrastructure | Repository | membership-repository', function () {
  let clock;
  const now = new Date('2022-12-01');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now });
  });
  afterEach(function () {
    clock.restore();
    return knex('memberships').delete();
  });

  describe('#create', function () {
    let userId;
    let organizationId;
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const organizationRole = Membership.roles.ADMIN;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();
    });

    it('should add a new membership in database', async function () {
      // given
      const beforeNbMemberships = await knex('memberships').count('id as count');

      // when
      await membershipRepository.create(userId, organizationId, organizationRole);

      // then
      const afterNbMemberships = await knex('memberships').count('id as count');
      expect(parseInt(afterNbMemberships[0].count)).to.equal(parseInt(beforeNbMemberships[0].count + 1));
    });

    it('should return a Membership domain model object', async function () {
      // when
      const membership = await membershipRepository.create(userId, organizationId, organizationRole);

      // then
      expect(membership).to.be.an.instanceOf(Membership);
      expect(membership.organizationRole).to.equal(Membership.roles.ADMIN);
    });

    context('Error cases', function () {
      it('should throw a domain error when a membership already exist for user + organization', async function () {
        // given
        await membershipRepository.create(userId, organizationId, organizationRole);

        // when
        const result = await catchErr(membershipRepository.create)(userId, organizationId, organizationRole);

        // then
        expect(result).to.be.instanceOf(MembershipCreationError);
      });
    });
  });

  describe('#get', function () {
    let existingMembershipId;

    beforeEach(async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      existingMembershipId = databaseBuilder.factory.buildMembership({ userId, organizationId }).id;
      await databaseBuilder.commit();
    });

    context('when membership exists', function () {
      it('should return the membership', async function () {
        // when
        const result = await membershipRepository.get(existingMembershipId);

        // then
        expect(result).to.be.an.instanceOf(Membership);
        expect(result.user).to.be.an.instanceOf(User);
        expect(result.organization).to.be.an.instanceOf(Organization);
      });
    });

    context('when membership does not exist', function () {
      it('should throw a NotFoundError', async function () {
        // given
        const nonExistingMembership = existingMembershipId + 1;

        // when
        const error = await catchErr(membershipRepository.get)(nonExistingMembership);

        // then
        expect(error).to.be.an.instanceOf(NotFoundError);
      });
    });
  });

  describe('#findByOrganizationId', function () {
    it('should return all the memberships for a given organization ID with only required relationships', async function () {
      // given
      const organization_1 = databaseBuilder.factory.buildOrganization();
      const organization_2 = databaseBuilder.factory.buildOrganization();

      const user_1 = databaseBuilder.factory.buildUser();
      const user_2 = databaseBuilder.factory.buildUser();
      const user_3 = databaseBuilder.factory.buildUser();

      const organizationRole = Membership.roles.ADMIN;

      databaseBuilder.factory.buildMembership({
        organizationRole,
        organizationId: organization_1.id,
        userId: user_1.id,
      });
      databaseBuilder.factory.buildMembership({
        organizationRole,
        organizationId: organization_1.id,
        userId: user_2.id,
      });
      databaseBuilder.factory.buildMembership({
        organizationRole,
        organizationId: organization_2.id,
        userId: user_3.id,
      });

      await databaseBuilder.commit();

      // when
      const memberships = await membershipRepository.findByOrganizationId({ organizationId: organization_1.id });

      // then
      expect(_.map(memberships, 'user.id')).to.have.members([user_1.id, user_2.id]);
    });

    it('should order memberships by id', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();

      const user_1 = databaseBuilder.factory.buildUser();
      const user_2 = databaseBuilder.factory.buildUser();
      const user_3 = databaseBuilder.factory.buildUser();

      const organizationRole = Membership.roles.ADMIN;

      const membership_3 = databaseBuilder.factory.buildMembership({
        id: 789,
        organizationRole,
        organizationId: organization.id,
        userId: user_3.id,
      });
      const membership_2 = databaseBuilder.factory.buildMembership({
        id: 456,
        organizationRole,
        organizationId: organization.id,
        userId: user_2.id,
      });
      const membership_1 = databaseBuilder.factory.buildMembership({
        id: 123,
        organizationRole,
        organizationId: organization.id,
        userId: user_1.id,
      });

      await databaseBuilder.commit();

      // when
      const memberships = await membershipRepository.findByOrganizationId({ organizationId: organization.id });

      // then
      expect(_.map(memberships, 'id')).to.deep.include.ordered.members([
        membership_1.id,
        membership_2.id,
        membership_3.id,
      ]);
    });
  });

  describe('#findAdminsByOrganizationId', function () {
    it('should return all the admin for a given organization ID with only required relationships', async function () {
      // given
      const organization_1 = databaseBuilder.factory.buildOrganization();
      const organization_2 = databaseBuilder.factory.buildOrganization();

      const user_1 = databaseBuilder.factory.buildUser();
      const user_2 = databaseBuilder.factory.buildUser();
      const user_3 = databaseBuilder.factory.buildUser();

      databaseBuilder.factory.buildMembership({
        organizationRole: Membership.roles.ADMIN,
        organizationId: organization_1.id,
        userId: user_1.id,
      });
      databaseBuilder.factory.buildMembership({
        organizationRole: Membership.roles.MEMBER,
        organizationId: organization_1.id,
        userId: user_2.id,
      });
      databaseBuilder.factory.buildMembership({
        organizationRole: Membership.roles.ADMIN,
        organizationId: organization_2.id,
        userId: user_3.id,
      });

      await databaseBuilder.commit();

      // when
      const memberships = await membershipRepository.findAdminsByOrganizationId({ organizationId: organization_1.id });

      // then
      expect(_.map(memberships, 'user.id')).to.have.members([user_1.id]);
    });

    it('should order memberships by id', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();

      const user_1 = databaseBuilder.factory.buildUser();
      const user_2 = databaseBuilder.factory.buildUser();
      const user_3 = databaseBuilder.factory.buildUser();

      const organizationRole = Membership.roles.ADMIN;

      const membership_3 = databaseBuilder.factory.buildMembership({
        id: 789,
        organizationRole,
        organizationId: organization.id,
        userId: user_3.id,
      });
      const membership_2 = databaseBuilder.factory.buildMembership({
        id: 456,
        organizationRole,
        organizationId: organization.id,
        userId: user_2.id,
      });
      const membership_1 = databaseBuilder.factory.buildMembership({
        id: 123,
        organizationRole,
        organizationId: organization.id,
        userId: user_1.id,
      });

      await databaseBuilder.commit();

      // when
      const memberships = await membershipRepository.findAdminsByOrganizationId({ organizationId: organization.id });

      // then
      expect(_.map(memberships, 'id')).to.deep.include.ordered.members([
        membership_1.id,
        membership_2.id,
        membership_3.id,
      ]);
    });
  });
  describe('#findPaginatedFiltered', function () {
    let organizationId;

    beforeEach(function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      return databaseBuilder.commit();
    });

    context('when there are Memberships in the database', function () {
      beforeEach(function () {
        const userId1 = databaseBuilder.factory.buildUser().id;
        const userId2 = databaseBuilder.factory.buildUser().id;
        const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildMembership({ organizationId, userId: userId1 });
        databaseBuilder.factory.buildMembership({ organizationId, userId: userId2 });
        databaseBuilder.factory.buildMembership({ organizationId: otherOrganizationId, userId: userId1 });
        return databaseBuilder.commit();
      });

      it('should return an Array of Memberships', async function () {
        // given
        const filter = {};
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingMemberships, pagination } = await membershipRepository.findPaginatedFiltered({
          organizationId,
          filter,
          page,
        });

        // then
        expect(matchingMemberships).to.exist;
        expect(matchingMemberships).to.have.lengthOf(2);
        expect(matchingMemberships[0]).to.be.an.instanceOf(Membership);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are lots of Memberships in the database', function () {
      beforeEach(function () {
        const userId1 = databaseBuilder.factory.buildUser().id;
        const userId2 = databaseBuilder.factory.buildUser().id;
        const userId3 = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildMembership({ organizationId, userId: userId1 });
        databaseBuilder.factory.buildMembership({ organizationId, userId: userId2 });
        databaseBuilder.factory.buildMembership({ organizationId, userId: userId3 });
        return databaseBuilder.commit();
      });

      it('should return paginated matching Organizations', async function () {
        // given
        const filter = {};
        const page = { number: 1, size: 2 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 2, rowCount: 3 };

        // when
        const { models: matchingMemberships, pagination } = await membershipRepository.findPaginatedFiltered({
          organizationId,
          filter,
          page,
        });

        // then
        expect(matchingMemberships).to.have.lengthOf(2);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are multiple Memberships matching the same "firstName" search pattern', function () {
      beforeEach(function () {
        const userId1 = databaseBuilder.factory.buildUser({ firstName: 'André' }).id;
        const userId2 = databaseBuilder.factory.buildUser({ firstName: 'Andréa' }).id;
        const userId3 = databaseBuilder.factory.buildUser({ firstName: 'Andranova' }).id;
        databaseBuilder.factory.buildMembership({ organizationId, userId: userId1 });
        databaseBuilder.factory.buildMembership({ organizationId, userId: userId2 });
        databaseBuilder.factory.buildMembership({ organizationId, userId: userId3 });
        return databaseBuilder.commit();
      });

      it('should return only Memberships matching "firstName" if given in filters', async function () {
        // given
        const filter = { firstName: 'andré' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingMemberships, pagination } = await membershipRepository.findPaginatedFiltered({
          organizationId,
          filter,
          page,
        });

        // then
        expect(matchingMemberships).to.have.lengthOf(2);
        expect(_.map(matchingMemberships, 'user.firstName')).to.have.members(['André', 'Andréa']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are multiple Memberships matching the same "lastName" search pattern', function () {
      beforeEach(function () {
        const userId1 = databaseBuilder.factory.buildUser({ lastName: 'André' }).id;
        const userId2 = databaseBuilder.factory.buildUser({ lastName: 'Andréa' }).id;
        const userId3 = databaseBuilder.factory.buildUser({ lastName: 'Andranova' }).id;
        databaseBuilder.factory.buildMembership({ organizationId, userId: userId1 });
        databaseBuilder.factory.buildMembership({ organizationId, userId: userId2 });
        databaseBuilder.factory.buildMembership({ organizationId, userId: userId3 });
        return databaseBuilder.commit();
      });

      it('should return only Memberships matching "firstName" if given in filters', async function () {
        // given
        const filter = { lastName: 'andré' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingMemberships, pagination } = await membershipRepository.findPaginatedFiltered({
          organizationId,
          filter,
          page,
        });

        // then
        expect(matchingMemberships).to.have.lengthOf(2);
        expect(_.map(matchingMemberships, 'user.lastName')).to.have.members(['André', 'Andréa']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are multiple Memberships matching the same "email" search pattern', function () {
      beforeEach(function () {
        const userId1 = databaseBuilder.factory.buildUser({ email: 'andre@example.net' }).id;
        const userId2 = databaseBuilder.factory.buildUser({ email: 'andrea@example.net' }).id;
        const userId3 = databaseBuilder.factory.buildUser({ email: 'andranova@example.net' }).id;
        databaseBuilder.factory.buildMembership({ organizationId, userId: userId1 });
        databaseBuilder.factory.buildMembership({ organizationId, userId: userId2 });
        databaseBuilder.factory.buildMembership({ organizationId, userId: userId3 });
        return databaseBuilder.commit();
      });

      it('should return only Memberships matching "firstName" if given in filters', async function () {
        // given
        const filter = { email: 'andre' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingMemberships, pagination } = await membershipRepository.findPaginatedFiltered({
          organizationId,
          filter,
          page,
        });

        // then
        expect(matchingMemberships).to.have.lengthOf(2);
        expect(_.map(matchingMemberships, 'user.email')).to.have.members(['andre@example.net', 'andrea@example.net']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context(
      'when there are multiple Memberships matching the fields "firstName", "lastName" and "email" search pattern',
      function () {
        beforeEach(function () {
          // Matching memberships
          const userId1 = databaseBuilder.factory.buildUser({
            firstName: 'firstName_ok_1',
            lastName: 'lastName_ok_1',
            email: 'email_ok_1@example.net',
          }).id;
          const userId2 = databaseBuilder.factory.buildUser({
            firstName: 'firstName_ok_2',
            lastName: 'lastName_ok_2',
            email: 'email_ok_2@example.net',
          }).id;
          databaseBuilder.factory.buildMembership({ organizationId, userId: userId1 });
          databaseBuilder.factory.buildMembership({ organizationId, userId: userId2 });

          // Unmatching memberships
          const userId3 = databaseBuilder.factory.buildUser({
            firstName: 'firstName_ko',
            lastName: 'lastName_ok_3',
            email: 'email_ok_3@example.net',
          }).id;
          const userId4 = databaseBuilder.factory.buildUser({
            firstName: 'firstName_ok_3',
            lastName: 'lastName_ko',
            email: 'email_ok_4@example.net',
          }).id;
          const userId5 = databaseBuilder.factory.buildUser({
            firstName: 'firstName_ok_4',
            lastName: 'lastName_ok_4',
            email: 'email_ko@example.net',
          }).id;
          databaseBuilder.factory.buildMembership({ organizationId, userId: userId3 });
          databaseBuilder.factory.buildMembership({ organizationId, userId: userId4 });
          databaseBuilder.factory.buildMembership({ organizationId, userId: userId5 });

          return databaseBuilder.commit();
        });

        it('should return only Memberships matching "firstName" AND "lastName" AND "email" if given in filters', async function () {
          // given
          const filter = { firstName: 'firstname_ok', lastName: 'lastname_ok', email: 'email_ok' };
          const page = { number: 1, size: 10 };
          const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

          // when
          const { models: matchingMemberships, pagination } = await membershipRepository.findPaginatedFiltered({
            organizationId,
            filter,
            page,
          });

          // then
          expect(_.map(matchingMemberships, 'user.firstName')).to.have.members(['firstName_ok_1', 'firstName_ok_2']);
          expect(_.map(matchingMemberships, 'user.lastName')).to.have.members(['lastName_ok_1', 'lastName_ok_2']);
          expect(_.map(matchingMemberships, 'user.email')).to.have.members([
            'email_ok_1@example.net',
            'email_ok_2@example.net',
          ]);
          expect(pagination).to.deep.equal(expectedPagination);
        });
      },
    );

    context('when there are filters that should be ignored', function () {
      let membershipId;

      beforeEach(function () {
        const userId = databaseBuilder.factory.buildUser().id;
        membershipId = databaseBuilder.factory.buildMembership({ organizationId, userId }).id;
        return databaseBuilder.commit();
      });

      it('should ignore the filters and retrieve all organizations', async function () {
        // given
        const filter = { id: 999 };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 1 };

        // when
        const { models: matchingMemberships, pagination } = await membershipRepository.findPaginatedFiltered({
          organizationId,
          filter,
          page,
        });

        // then
        expect(_.map(matchingMemberships, 'id')).to.have.members([membershipId]);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    it('should return only active memberships', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      const membershipActive = {
        organizationId,
        userId: databaseBuilder.factory.buildUser().id,
      };
      const membershipDisabled = {
        organizationId,
        userId: databaseBuilder.factory.buildUser().id,
        disabledAt: new Date(),
      };
      const expectedMembershipId = databaseBuilder.factory.buildMembership(membershipActive).id;
      databaseBuilder.factory.buildMembership(membershipDisabled);

      await databaseBuilder.commit();

      // when
      const foundMemberships = await membershipRepository.findByOrganizationId({ organizationId });

      // then
      expect(foundMemberships).to.have.lengthOf(1);
      expect(foundMemberships[0].id).to.equal(expectedMembershipId);
    });
  });

  describe('#findByUserIdAndOrganizationId', function () {
    context('When organization is not required', function () {
      it('should retrieve membership with given useId and OrganizationId', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();
        const user1 = databaseBuilder.factory.buildUser();
        const organizationRole1 = Membership.roles.ADMIN;
        const user2 = databaseBuilder.factory.buildUser();
        const organizationRole2 = Membership.roles.MEMBER;

        databaseBuilder.factory.buildMembership({
          organizationRole: organizationRole1,
          organizationId: organization.id,
          userId: user1.id,
        });
        const membership2 = databaseBuilder.factory.buildMembership({
          organizationRole: organizationRole2,
          organizationId: organization.id,
          userId: user2.id,
        });

        await databaseBuilder.commit();

        //when
        const memberships = await membershipRepository.findByUserIdAndOrganizationId({
          userId: user2.id,
          organizationId: organization.id,
        });

        //then
        expect(memberships).to.have.lengthOf(1);
        expect(memberships[0].id).to.equal(membership2.id);
      });

      it('should retrieve only active membership', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;

        databaseBuilder.factory.buildMembership({ userId, organizationId, disabledAt: new Date() });

        await databaseBuilder.commit();

        // when
        const foundMemberships = await membershipRepository.findByUserIdAndOrganizationId({ userId, organizationId });

        // then
        expect(foundMemberships).to.have.lengthOf(0);
      });

      it('should retrieve membership and organization with tags', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildOrganizationTag({ organizationId });
        databaseBuilder.factory.buildMembership({ userId, organizationId });

        await databaseBuilder.commit();

        // when
        const foundMemberships = await membershipRepository.findByUserIdAndOrganizationId({
          userId,
          organizationId,
          includeOrganization: true,
        });

        // then
        expect(foundMemberships[0].organization.id).to.equal(organizationId);
        expect(foundMemberships[0].organization.tags).to.have.lengthOf(1);
      });
    });

    context('When organization is required', function () {
      it('should retrieve membership and organization with given userId and organizationId', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const userId = databaseBuilder.factory.buildUser().id;

        databaseBuilder.factory.buildMembership({ organizationId, userId });

        await databaseBuilder.commit();

        //when
        const includeOrganization = true;
        const memberships = await membershipRepository.findByUserIdAndOrganizationId({
          userId,
          organizationId,
          includeOrganization,
        });

        //then
        expect(memberships).to.have.lengthOf(1);
        const organization = memberships[0].organization;
        expect(organization).to.be.instanceOf(Organization);
      });
    });
  });

  describe('#updateById', function () {
    let existingMembershipId;
    let updatedByUserId = null;

    beforeEach(async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      updatedByUserId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      existingMembershipId = databaseBuilder.factory.buildMembership({ organizationId, userId }).id;

      await databaseBuilder.commit();
    });

    context('When membership exist', function () {
      it('should return the updated membership', async function () {
        // given
        const membership = { organizationRole: Membership.roles.ADMIN, updatedByUserId };

        // when
        const updatedMembership = await membershipRepository.updateById({ id: existingMembershipId, membership });

        // then
        expect(updatedMembership).to.be.an.instanceOf(Membership);
        expect(updatedMembership.organizationRole).to.equal(updatedMembership.organizationRole);
        expect(updatedMembership.updatedByUserId).to.equal(updatedMembership.updatedByUserId);
      });

      it('should return the organization and user linked to this membership', async function () {
        // given
        const membership = { organizationRole: Membership.roles.ADMIN, updatedByUserId };

        // when
        const updatedMembership = await membershipRepository.updateById({ id: existingMembershipId, membership });

        // then
        expect(updatedMembership).to.be.an.instanceOf(Membership);
      });
    });

    context('When membership does not exist', function () {
      it('should throw MembershipUpdateError', async function () {
        // given
        const organizationRole = Membership.roles.ADMIN;
        const messageNotRowUpdated = 'No Rows Updated';
        const notExistingMembershipId = 9898977;
        const membership = { organizationRole, updatedByUserId };

        // when
        const error = await catchErr(membershipRepository.updateById)({ id: notExistingMembershipId, membership });

        // then
        expect(error).to.be.an.instanceOf(MembershipUpdateError);
        expect(error.message).to.be.equal(messageNotRowUpdated);
      });
    });

    context('When membership attributes are empty', function () {
      it('should throw MembershipUpdateError', async function () {
        // given
        const errorMessage = "Le membership n'est pas renseigné";
        const membership = undefined;

        // when
        const error = await catchErr(membershipRepository.updateById)({ id: existingMembershipId, membership });

        // then
        expect(error).to.be.an.instanceOf(MembershipUpdateError);
        expect(error.message).to.be.equal(errorMessage);
      });
    });
  });

  describe('#disableMembershipsByUserId', function () {
    context('when there is multiple memberships for the specified user id', function () {
      it('disables all memberships of this user', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const updatedByUserId = databaseBuilder.factory.buildUser().id;
        const anotherUserId = databaseBuilder.factory.buildUser().id;
        const firstOrganizationId = databaseBuilder.factory.buildOrganization().id;
        const secondOrganizationId = databaseBuilder.factory.buildOrganization().id;
        const firstOrganizationMembership = databaseBuilder.factory.buildMembership({
          organizationId: firstOrganizationId,
          userId,
          createdAt: now,
          updatedAt: now,
        });
        const secondOrganizationMembership = databaseBuilder.factory.buildMembership({
          organizationId: secondOrganizationId,
          userId,
          createdAt: now,
          updatedAt: now,
        });
        databaseBuilder.factory.buildMembership({
          organizationId: firstOrganizationId,
          userId: anotherUserId,
          createdAt: now,
          updatedAt: now,
        });

        await databaseBuilder.commit();

        const expectedMemberships = [
          {
            ...firstOrganizationMembership,
            createdAt: now,
            updatedAt: now,
            disabledAt: now,
            updatedByUserId,
          },
          {
            ...secondOrganizationMembership,
            createdAt: now,
            updatedAt: now,
            disabledAt: now,
            updatedByUserId,
          },
        ];

        // when
        await membershipRepository.disableMembershipsByUserId({ userId, updatedByUserId });

        // then
        const disabledMemberships = await knex('memberships').returning('*').where({ userId });
        expect(disabledMemberships.length).to.equal(2);
        expect(disabledMemberships).to.deep.include.members(expectedMemberships);
      });
    });

    context('when there is no membership for the specified user id', function () {
      it('does nothing', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const anotherUserId = databaseBuilder.factory.buildUser().id;
        const updatedByUserId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildMembership({
          organizationId,
          userId: anotherUserId,
        });

        await databaseBuilder.commit();

        // when
        await membershipRepository.disableMembershipsByUserId({ userId, updatedByUserId });

        // then
        const disabledMemberships = await knex('memberships').where({ userId });
        expect(disabledMemberships.length).to.equal(0);
      });
    });
  });
});
