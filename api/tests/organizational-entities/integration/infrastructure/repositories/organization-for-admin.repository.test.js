import _ from 'lodash';

import { OrganizationForAdmin } from '../../../../../src/organizational-entities/domain/models/OrganizationForAdmin.js';
import { organizationForAdminRepository } from '../../../../../src/organizational-entities/infrastructure/repositories/organization-for-admin.repository.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/domain/constants.js';
import { MissingAttributesError, NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { OrganizationInvitation } from '../../../../../src/team/domain/models/OrganizationInvitation.js';
import {
  catchErr,
  databaseBuilder,
  domainBuilder,
  expect,
  insertMultipleSendingFeatureForNewOrganization,
  knex,
  sinon,
} from '../../../../test-helper.js';

describe('Integration | Organizational Entities | Infrastructure | Repository | organization-for-admin', function () {
  let clock, byDefaultFeatureId;
  const now = new Date('2022-02-02');

  beforeEach(async function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    await databaseBuilder.commit();
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#findPaginatedFiltered', function () {
    context('when there are Organizations in the database', function () {
      beforeEach(function () {
        _.times(3, databaseBuilder.factory.buildOrganization);
        return databaseBuilder.commit();
      });

      it('should return an Array of Organizations', async function () {
        // given
        const filter = {};
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 3 };

        // when
        const { models: matchingOrganizations, pagination } =
          await organizationForAdminRepository.findPaginatedFiltered({
            filter,
            page,
          });

        // then
        expect(matchingOrganizations).to.exist;
        expect(matchingOrganizations).to.have.lengthOf(3);
        expect(matchingOrganizations[0]).to.be.an.instanceOf(OrganizationForAdmin);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are lots of Organizations (> 10) in the database', function () {
      beforeEach(function () {
        _.times(12, databaseBuilder.factory.buildOrganization);
        return databaseBuilder.commit();
      });

      it('should return paginated matching Organizations', async function () {
        // given
        const filter = {};
        const page = { number: 1, size: 3 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 4, rowCount: 12 };

        // when
        const { models: matchingOrganizations, pagination } =
          await organizationForAdminRepository.findPaginatedFiltered({
            filter,
            page,
          });

        // then
        expect(matchingOrganizations).to.have.lengthOf(3);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there is an Organization matching the "id"', function () {
      beforeEach(function () {
        databaseBuilder.factory.buildOrganization({ id: 123 });
        databaseBuilder.factory.buildOrganization({ id: 456 });
        databaseBuilder.factory.buildOrganization({ id: 789 });
        return databaseBuilder.commit();
      });

      it('should return only the Organization matching "id" if given in filters', async function () {
        // given
        const filter = { id: 123 };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 1 };

        // when
        const { models: matchingOrganizations, pagination } =
          await organizationForAdminRepository.findPaginatedFiltered({
            filter,
            page,
          });

        // then
        expect(matchingOrganizations).to.have.lengthOf(1);
        expect(matchingOrganizations[0].id).to.equal(123);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are multiple Organizations matching the same "name" search pattern', function () {
      beforeEach(function () {
        databaseBuilder.factory.buildOrganization({ name: 'Dragon & co' });
        databaseBuilder.factory.buildOrganization({ name: 'Dragonades & co' });
        databaseBuilder.factory.buildOrganization({ name: 'Broca & co' });
        databaseBuilder.factory.buildOrganization({ name: 'Donnie & co' });
        return databaseBuilder.commit();
      });

      it('should return only Organizations matching "name" if given in filters', async function () {
        // given
        const filter = { name: 'dra' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingOrganizations, pagination } =
          await organizationForAdminRepository.findPaginatedFiltered({
            filter,
            page,
          });

        // then
        expect(matchingOrganizations).to.have.lengthOf(2);
        expect(_.map(matchingOrganizations, 'name')).to.have.members(['Dragon & co', 'Dragonades & co']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are multiple Organizations matching the same "type" search', function () {
      beforeEach(function () {
        databaseBuilder.factory.buildOrganization({ type: 'PRO' });
        databaseBuilder.factory.buildOrganization({ type: 'PRO' });
        databaseBuilder.factory.buildOrganization({ type: 'SUP' });
        databaseBuilder.factory.buildOrganization({ type: 'SCO' });
        databaseBuilder.factory.buildOrganization({ type: 'SCO-1D' });
        return databaseBuilder.commit();
      });

      it('should return empty array when type is not strict equal', async function () {
        // given
        const filter = { type: 'S' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 0, rowCount: 0 };

        // when
        const { models: matchingOrganizations, pagination } =
          await organizationForAdminRepository.findPaginatedFiltered({
            filter,
            page,
          });

        // then
        expect(_.map(matchingOrganizations, 'type')).to.have.members([]);
        expect(pagination).to.deep.equal(expectedPagination);
      });

      it('should return only Organizations matching "type" if given in filters SCO', async function () {
        // given
        const filter = { type: 'SCO' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 1 };

        // when
        const { models: matchingOrganizations, pagination } =
          await organizationForAdminRepository.findPaginatedFiltered({
            filter,
            page,
          });

        // then
        expect(_.map(matchingOrganizations, 'type')).to.have.members(['SCO']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are multiple Organizations matching the same "externalId" search pattern', function () {
      beforeEach(function () {
        databaseBuilder.factory.buildOrganization({ externalId: '1234567A' });
        databaseBuilder.factory.buildOrganization({ externalId: '1234567B' });
        databaseBuilder.factory.buildOrganization({ externalId: '1234567C' });
        databaseBuilder.factory.buildOrganization({ externalId: '123456AD' });
        return databaseBuilder.commit();
      });

      it('should return only Organizations matching "externalId" if given in filters', async function () {
        // given
        const filter = { externalId: 'a' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingOrganizations, pagination } =
          await organizationForAdminRepository.findPaginatedFiltered({
            filter,
            page,
          });

        // then
        expect(_.map(matchingOrganizations, 'externalId')).to.have.members(['1234567A', '123456AD']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context(
      'when there are multiple Organizations matching the fields "name", "type" and "externalId" search pattern',
      function () {
        beforeEach(function () {
          // Matching organizations
          databaseBuilder.factory.buildOrganization({ name: 'name_ok_1', type: 'SCO', externalId: '1234567A' });
          databaseBuilder.factory.buildOrganization({ name: 'name_ok_2', type: 'SCO', externalId: '1234568A' });
          databaseBuilder.factory.buildOrganization({ name: 'name_ok_3', type: 'SCO', externalId: '1234569A' });

          // Unmatching organizations
          databaseBuilder.factory.buildOrganization({ name: 'name_ko_4', type: 'SCO', externalId: '1234567B' });
          databaseBuilder.factory.buildOrganization({ name: 'name_ok_5', type: 'SUP', externalId: '1234567C' });

          return databaseBuilder.commit();
        });

        it('should return only Organizations matching "name" AND "type" "AND" "externalId" if given in filters', async function () {
          // given
          const filter = { name: 'name_ok', type: 'SCO', externalId: 'a' };
          const page = { number: 1, size: 10 };
          const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 3 };

          // when
          const { models: matchingOrganizations, pagination } =
            await organizationForAdminRepository.findPaginatedFiltered({
              filter,
              page,
            });

          // then
          expect(_.map(matchingOrganizations, 'name')).to.have.members(['name_ok_1', 'name_ok_2', 'name_ok_3']);
          expect(_.map(matchingOrganizations, 'type')).to.have.members(['SCO', 'SCO', 'SCO']);
          expect(_.map(matchingOrganizations, 'externalId')).to.have.members(['1234567A', '1234568A', '1234569A']);
          expect(pagination).to.deep.equal(expectedPagination);
        });
      },
    );

    context('when there are filters that should be ignored', function () {
      beforeEach(function () {
        databaseBuilder.factory.buildOrganization({ provinceCode: 'ABC' });
        databaseBuilder.factory.buildOrganization({ provinceCode: 'DEF' });

        return databaseBuilder.commit();
      });

      it('should ignore the filters and retrieve all organizations', async function () {
        // given
        const filter = { provinceCode: 'ABC' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingOrganizations, pagination } =
          await organizationForAdminRepository.findPaginatedFiltered({
            filter,
            page,
          });

        // then
        expect(_.map(matchingOrganizations, 'provinceCode')).to.have.members(['ABC', 'DEF']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are organizations matching the "hideArchived" filter', function () {
      beforeEach(function () {
        databaseBuilder.factory.buildOrganization({ archivedAt: null });
        databaseBuilder.factory.buildOrganization({ archivedAt: new Date('2023-08-04') });

        return databaseBuilder.commit();
      });

      it('return only Organizations matching "hideArchived" if given in filters', async function () {
        // given
        const filter = { hideArchived: true };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 1 };

        // when
        const { models: matchingOrganizations, pagination } =
          await organizationForAdminRepository.findPaginatedFiltered({
            filter,
            page,
          });

        // then
        expect(_.map(matchingOrganizations, 'archivedAt')).to.have.members([null]);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });
  });

  describe('#archive', function () {
    it('should cancel all pending invitations of a given organization', async function () {
      // given
      const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;
      const pendingStatus = OrganizationInvitation.StatusType.PENDING;
      const cancelledStatus = OrganizationInvitation.StatusType.CANCELLED;
      const acceptedStatus = OrganizationInvitation.StatusType.ACCEPTED;
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      databaseBuilder.factory.buildOrganizationInvitation({ id: 1, organizationId, status: pendingStatus });
      databaseBuilder.factory.buildOrganizationInvitation({ id: 2, organizationId, status: pendingStatus });
      databaseBuilder.factory.buildOrganizationInvitation({
        organizationId,
        status: acceptedStatus,
      });
      databaseBuilder.factory.buildOrganizationInvitation({
        organizationId,
        status: cancelledStatus,
      });

      await databaseBuilder.commit();

      // when
      await organizationForAdminRepository.archive({ id: organizationId, archivedBy: superAdminUserId });

      // then
      const pendingInvitations = await knex('organization-invitations').where({
        organizationId,
        status: pendingStatus,
      });
      expect(pendingInvitations).to.have.lengthOf(0);

      const allCancelledInvitations = await knex('organization-invitations').where({
        organizationId,
        status: cancelledStatus,
      });
      expect(allCancelledInvitations).to.have.lengthOf(3);

      const newlyCancelledInvitations = await knex('organization-invitations').where({
        organizationId,
        status: cancelledStatus,
        updatedAt: now,
      });
      expect(newlyCancelledInvitations).to.have.lengthOf(2);

      const acceptedInvitations = await knex('organization-invitations').where({
        organizationId,
        status: acceptedStatus,
      });
      expect(acceptedInvitations).to.have.lengthOf(1);
    });

    it('should archive active campaigns of a given organization', async function () {
      // given
      const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;
      const previousDate = new Date('2021-01-01');
      const organizationId = 1;
      databaseBuilder.factory.buildOrganization({ id: organizationId });

      databaseBuilder.factory.buildCampaign({ id: 1, organizationId });
      databaseBuilder.factory.buildCampaign({ id: 2, organizationId });
      databaseBuilder.factory.buildCampaign({ organizationId, archivedAt: previousDate });

      await databaseBuilder.commit();

      // when
      await organizationForAdminRepository.archive({ id: organizationId, archivedBy: superAdminUserId });

      // then
      const activeCampaigns = await knex('campaigns').where({
        archivedAt: null,
      });
      expect(activeCampaigns).to.have.lengthOf(0);

      const newlyArchivedCampaigns = await knex('campaigns').where({ archivedAt: now });
      expect(newlyArchivedCampaigns).to.have.lengthOf(2);

      const previousArchivedCampaigns = await knex('campaigns').where({ archivedAt: previousDate });
      expect(previousArchivedCampaigns).to.have.lengthOf(1);
    });

    it('should disable active members of a given organization', async function () {
      // given
      const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;
      const previousDate = new Date('2021-01-01');
      const organizationId = 1;
      databaseBuilder.factory.buildOrganization({ id: organizationId });

      databaseBuilder.factory.buildUser({ id: 7 });
      databaseBuilder.factory.buildMembership({ id: 1, userId: 7, organizationId });
      databaseBuilder.factory.buildUser({ id: 8 });
      databaseBuilder.factory.buildMembership({ id: 2, userId: 8, organizationId });
      databaseBuilder.factory.buildUser({ id: 9 });
      databaseBuilder.factory.buildMembership({ organizationId, userId: 9, disabledAt: previousDate });

      await databaseBuilder.commit();

      // when
      await organizationForAdminRepository.archive({ id: organizationId, archivedBy: superAdminUserId });

      // then
      const activeMembers = await knex('memberships').where({ disabledAt: null });
      expect(activeMembers).to.have.lengthOf(0);

      const newlyDisabledMembers = await knex('memberships').where({ disabledAt: now });
      expect(newlyDisabledMembers).to.have.lengthOf(2);

      const previouslyDisabledMembers = await knex('memberships').where({ disabledAt: previousDate });
      expect(previouslyDisabledMembers).to.have.lengthOf(1);
    });

    it('should archive organization', async function () {
      // given
      const organizationId = 1;
      databaseBuilder.factory.buildOrganization({ id: organizationId });
      databaseBuilder.factory.buildOrganization({ id: 2 });
      const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;

      await databaseBuilder.commit();

      // when
      await organizationForAdminRepository.archive({ id: organizationId, archivedBy: superAdminUserId });

      // then
      const archivedOrganization = await knex('organizations').where({ id: organizationId }).first();
      expect(archivedOrganization.archivedBy).to.equal(superAdminUserId);
      expect(archivedOrganization.archivedAt).to.deep.equal(now);

      const organizations = await knex('organizations').where({ archivedBy: null });
      expect(organizations).to.have.lengthOf(1);
      expect(organizations[0].id).to.equal(2);
    });

    describe('when attributes missing', function () {
      it('should throw MissingAttributesError', async function () {
        // given
        const organizationId = 1;
        databaseBuilder.factory.buildOrganization({ id: organizationId });
        databaseBuilder.factory.buildOrganization({ id: 2 });

        await databaseBuilder.commit();

        // when
        const error = await catchErr(organizationForAdminRepository.archive)({ id: organizationId });

        // then
        expect(error).to.be.instanceOf(MissingAttributesError);
      });
    });
  });

  describe('#exist', function () {
    context('when organization exists', function () {
      it('returns true', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;

        await databaseBuilder.commit();

        // when
        const result = await organizationForAdminRepository.exist(organizationId);

        // then
        expect(result).to.be.true;
      });
    });

    context('when organization does not exist', function () {
      it('returns false', async function () {
        // given
        const organizationId = 1234;

        // when
        const result = await organizationForAdminRepository.exist(organizationId);

        // then
        expect(result).to.be.false;
      });
    });
  });

  describe('#findChildrenByParentOrganizationId', function () {
    let parentOrganizationId;

    beforeEach(function () {
      parentOrganizationId = databaseBuilder.factory.buildOrganization({
        name: 'name_ok_1',
        type: 'SCO',
        externalId: '1234567A',
      }).id;
    });

    context('when there is no child organization', function () {
      it('returns an empty array', async function () {
        //given
        //when
        const children = await organizationForAdminRepository.findChildrenByParentOrganizationId(parentOrganizationId);

        //then
        expect(children).to.have.lengthOf(0);
      });
    });

    context('when there is at least one child organization', function () {
      it('returns an array of organizations', async function () {
        // given
        databaseBuilder.factory.buildOrganization({
          name: 'First Child',
          type: 'SCO',
          parentOrganizationId,
        });

        await databaseBuilder.commit();

        // when
        const children = await organizationForAdminRepository.findChildrenByParentOrganizationId(parentOrganizationId);

        // then
        expect(children.length).to.be.greaterThanOrEqual(1);
        expect(children[0]).to.be.instanceOf(OrganizationForAdmin);
        expect(_.map(children, 'name')).to.have.members(['First Child']);
      });
    });
  });

  describe('#get', function () {
    it('returns an organization for admin by provided id', async function () {
      // given
      const superAdminUser = databaseBuilder.factory.buildUser({ firstName: 'Cécile', lastName: 'Encieux' });
      const parentOrganization = databaseBuilder.factory.buildOrganization({
        type: 'SCO',
        name: 'Mother Of Dark Side',
        logoUrl: 'another logo url',
        externalId: 'DEF456',
        provinceCode: '45',
        isManagingStudents: true,
        credit: 666,
        email: 'sco.generic.account@example.net',
        createdBy: superAdminUser.id,
        documentationUrl: 'https://pix.fr/',
      });
      const organization = databaseBuilder.factory.buildOrganization({
        type: 'SCO',
        name: 'Organization of the dark side',
        logoUrl: 'some logo url',
        credit: 154,
        externalId: '100',
        provinceCode: '75',
        isManagingStudents: 'true',
        email: 'sco.generic.account@example.net',
        documentationUrl: 'https://pix.fr/',
        createdBy: superAdminUser.id,
        createdAt: now,
        showNPS: true,
        formNPSUrl: 'https://pix.fr/',
        showSkills: false,
        identityProviderForCampaigns: 'genericOidcProviderCode',
        parentOrganizationId: parentOrganization.id,
      });

      databaseBuilder.factory.buildDataProtectionOfficer.withOrganizationId({
        firstName: 'Justin',
        lastName: 'Ptipeu',
        email: 'justin.ptipeu@example.net',
        organizationId: organization.id,
      });

      const featureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.LEARNER_IMPORT).id;
      const organizationLearnerImportFormatId = databaseBuilder.factory.buildOrganizationLearnerImportFormat({
        name: 'BIDON',
      }).id;
      databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY).id;
      databaseBuilder.factory.buildOrganizationFeature({
        organizationId: organization.id,
        featureId,
        params: { organizationLearnerImportFormatId },
      });

      await databaseBuilder.commit();

      // when
      const foundOrganizationForAdmin = await organizationForAdminRepository.get(organization.id);

      // then
      const expectedOrganizationForAdmin = new OrganizationForAdmin({
        id: organization.id,
        type: 'SCO',
        name: 'Organization of the dark side',
        logoUrl: 'some logo url',
        credit: 154,
        externalId: '100',
        provinceCode: '75',
        isManagingStudents: true,
        email: 'sco.generic.account@example.net',
        students: [],
        targetProfileShares: [],
        organizationInvitations: [],
        tags: [],
        documentationUrl: 'https://pix.fr/',
        createdBy: organization.createdBy,
        createdAt: now,
        showNPS: true,
        formNPSUrl: 'https://pix.fr/',
        showSkills: false,
        archivedAt: null,
        archivistFirstName: null,
        archivistLastName: null,
        dataProtectionOfficerFirstName: 'Justin',
        dataProtectionOfficerLastName: 'Ptipeu',
        dataProtectionOfficerEmail: 'justin.ptipeu@example.net',
        creatorFirstName: 'Cécile',
        creatorLastName: 'Encieux',
        identityProviderForCampaigns: 'genericOidcProviderCode',
        features: {
          [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: { active: false },
          [ORGANIZATION_FEATURE.LEARNER_IMPORT.key]: { active: true, params: { name: 'BIDON' } },
        },
        parentOrganizationId: parentOrganization.id,
        parentOrganizationName: 'Mother Of Dark Side',
      });
      expect(foundOrganizationForAdmin).to.deep.equal(expectedOrganizationForAdmin);
    });

    it('should throw when organization is not found', async function () {
      // given
      const nonExistentId = 10083;

      // when
      const error = await catchErr(organizationForAdminRepository.get)(nonExistentId);

      // then
      expect(error).to.be.an.instanceof(NotFoundError);
      expect(error.message).to.equal('Not found organization for ID 10083');
    });

    describe('when the import feature is not active', function () {
      it('should return an organization with import feature with empty params', async function () {
        // given
        const superAdminUser = databaseBuilder.factory.buildUser({ firstName: 'Cécile', lastName: 'Encieux' });
        const organization = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          name: 'Organization of the dark side',
          logoUrl: 'some logo url',
          credit: 154,
          externalId: '100',
          provinceCode: '75',
          isManagingStudents: false,
          email: 'sco.generic.account@example.net',
          documentationUrl: 'https://pix.fr/',
          createdBy: superAdminUser.id,
          createdAt: now,
          showNPS: true,
          formNPSUrl: 'https://pix.fr/',
          showSkills: false,
          identityProviderForCampaigns: 'genericOidcProviderCode',
        });

        databaseBuilder.factory.buildDataProtectionOfficer.withOrganizationId({
          firstName: 'Justin',
          lastName: 'Ptipeu',
          email: 'justin.ptipeu@example.net',
          organizationId: organization.id,
        });

        databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.LEARNER_IMPORT).id;
        databaseBuilder.factory.buildOrganizationLearnerImportFormat({
          name: 'BIDON',
        }).id;

        await databaseBuilder.commit();

        // when
        const foundOrganizationForAdmin = await organizationForAdminRepository.get(organization.id);

        // then
        const expectedOrganizationForAdmin = new OrganizationForAdmin({
          id: organization.id,
          type: 'SCO',
          name: 'Organization of the dark side',
          logoUrl: 'some logo url',
          credit: 154,
          externalId: '100',
          provinceCode: '75',
          isManagingStudents: false,
          email: 'sco.generic.account@example.net',
          students: [],
          targetProfileShares: [],
          organizationInvitations: [],
          tags: [],
          documentationUrl: 'https://pix.fr/',
          createdBy: organization.createdBy,
          createdAt: now,
          showNPS: true,
          formNPSUrl: 'https://pix.fr/',
          showSkills: false,
          archivedAt: null,
          archivistFirstName: null,
          archivistLastName: null,
          dataProtectionOfficerFirstName: 'Justin',
          dataProtectionOfficerLastName: 'Ptipeu',
          dataProtectionOfficerEmail: 'justin.ptipeu@example.net',
          creatorFirstName: 'Cécile',
          creatorLastName: 'Encieux',
          identityProviderForCampaigns: 'genericOidcProviderCode',
          features: {
            [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: { active: true, params: null },
            [ORGANIZATION_FEATURE.LEARNER_IMPORT.key]: { active: false, params: null },
          },
          parentOrganizationId: null,
          parentOrganizationName: null,
        });
        expect(foundOrganizationForAdmin).to.deep.equal(expectedOrganizationForAdmin);
      });
    });

    describe('when the organization has associated tags', function () {
      it('should return an organization with associated tags', async function () {
        // given
        const insertedOrganization = databaseBuilder.factory.buildOrganization();
        const tag1 = databaseBuilder.factory.buildTag({ name: 'PRO' });
        databaseBuilder.factory.buildOrganizationTag({
          organizationId: insertedOrganization.id,
          tagId: tag1.id,
        });
        const tag2 = databaseBuilder.factory.buildTag({ name: 'SCO' });
        databaseBuilder.factory.buildOrganizationTag({
          organizationId: insertedOrganization.id,
          tagId: tag2.id,
        });
        databaseBuilder.factory.buildOrganizationTag();
        await databaseBuilder.commit();

        // when
        const organization = await organizationForAdminRepository.get(insertedOrganization.id);

        // then
        const expectedTags = [domainBuilder.buildTag({ ...tag1 }), domainBuilder.buildTag({ ...tag2 })];
        expect(organization.tags).to.deep.equal(expectedTags);
        expect(organization.tags).to.have.lengthOf(2);
      });
    });

    describe('when the organization is archived', function () {
      it('should return its archived details', async function () {
        // given
        const superAdminUser = databaseBuilder.factory.buildUser();
        const archivist = databaseBuilder.factory.buildUser();
        const archivedAt = new Date('2022-02-02');

        const insertedOrganization = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          name: 'Organization of the dark side',
          logoUrl: 'some logo url',
          credit: 154,
          externalId: '100',
          provinceCode: '75',
          isManagingStudents: 'true',
          email: 'sco.generic.account@example.net',
          documentationUrl: 'https://pix.fr/',
          createdBy: superAdminUser.id,
          createdAt: now,
          showNPS: true,
          formNPSUrl: 'https://pix.fr/',
          showSkills: false,
          archivedBy: archivist.id,
          archivedAt,
        });

        await databaseBuilder.commit();

        // when
        const foundOrganizationForAdmin = await organizationForAdminRepository.get(insertedOrganization.id);

        // then
        const expectedOrganizationForAdmin = new OrganizationForAdmin({
          id: insertedOrganization.id,
          type: 'SCO',
          name: 'Organization of the dark side',
          logoUrl: 'some logo url',
          credit: 154,
          externalId: '100',
          provinceCode: '75',
          isManagingStudents: true,
          email: 'sco.generic.account@example.net',
          students: [],
          targetProfileShares: [],
          organizationInvitations: [],
          tags: [],
          documentationUrl: 'https://pix.fr/',
          createdBy: insertedOrganization.createdBy,
          createdAt: now,
          showNPS: true,
          formNPSUrl: 'https://pix.fr/',
          showSkills: false,
          archivedAt,
          archivistFirstName: archivist.firstName,
          archivistLastName: archivist.lastName,
          dataProtectionOfficerFirstName: null,
          dataProtectionOfficerLastName: null,
          dataProtectionOfficerEmail: null,
          creatorFirstName: superAdminUser.firstName,
          creatorLastName: superAdminUser.lastName,
          identityProviderForCampaigns: null,
          features: {},
          parentOrganizationId: null,
          parentOrganizationName: null,
        });
        expect(foundOrganizationForAdmin).to.deepEqualInstance(expectedOrganizationForAdmin);
      });
    });
  });

  describe('#save', function () {
    it('saves the given organization', async function () {
      // given
      const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;
      await insertMultipleSendingFeatureForNewOrganization();

      await databaseBuilder.commit();

      const organization = new OrganizationForAdmin({
        name: 'Organization SCO',
        type: 'SCO',
        createdBy: superAdminUserId,
      });

      // when
      const savedOrganization = await organizationForAdminRepository.save(organization);

      // then
      expect(savedOrganization).to.be.instanceOf(OrganizationForAdmin);
      expect(savedOrganization.name).to.equal('Organization SCO');
      expect(savedOrganization.type).to.equal('SCO');
      expect(savedOrganization.createdBy).to.equal(superAdminUserId);
    });

    context('when the organization type is SCO-1D', function () {
      it('adds mission_management, oralization and learner_import features to the organization', async function () {
        const superAdminUserId = databaseBuilder.factory.buildUser().id;
        const missionManagementFeatureId = databaseBuilder.factory.buildFeature(
          ORGANIZATION_FEATURE.MISSIONS_MANAGEMENT,
        ).id;
        const oralizationFeatureId = databaseBuilder.factory.buildFeature(
          ORGANIZATION_FEATURE.ORALIZATION_MANAGED_BY_PRESCRIBER,
        ).id;
        const learnerImportFeatureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.LEARNER_IMPORT).id;
        const organizationLearnerImportOndeFormat = databaseBuilder.factory.buildOrganizationLearnerImportFormat({
          name: 'ONDE',
        });
        byDefaultFeatureId = await insertMultipleSendingFeatureForNewOrganization();

        await databaseBuilder.commit();

        const organization = new OrganizationForAdmin({
          name: "École de l'avenir",
          type: 'SCO-1D',
          createdBy: superAdminUserId,
        });

        const savedOrganization = await organizationForAdminRepository.save(organization);

        const savedOrganizationFeatures = await knex('organization-features')
          .where({
            organizationId: savedOrganization.id,
          })
          .whereNot({ featureId: byDefaultFeatureId });

        expect(savedOrganizationFeatures).to.have.lengthOf(3);
        const savedOrganizationFeatureIds = savedOrganizationFeatures.map(
          (organizationFeature) => organizationFeature.featureId,
        );
        expect(savedOrganizationFeatureIds).to.include(missionManagementFeatureId);
        expect(savedOrganizationFeatureIds).to.include(oralizationFeatureId);
        expect(savedOrganizationFeatureIds).to.include(learnerImportFeatureId);

        const learnerImportFeatureParams = savedOrganizationFeatures.find((organizationFeature) => {
          return organizationFeature.featureId == learnerImportFeatureId;
        }).params;

        expect(learnerImportFeatureParams).to.deep.equal({
          organizationLearnerImportFormatId: organizationLearnerImportOndeFormat.id,
        });
      });
    });
  });

  describe('#update', function () {
    beforeEach(async function () {
      byDefaultFeatureId = await insertMultipleSendingFeatureForNewOrganization();
    });

    it('updates organization detail', async function () {
      // given
      const parentOrganizationId = databaseBuilder.factory.buildOrganization({ name: 'Parent Organization' }).id;
      const childOrganization = databaseBuilder.factory.buildOrganization({ name: 'Child Organization' });
      await databaseBuilder.commit();
      const childOrganizationForAdmin = new OrganizationForAdmin(childOrganization);

      // when
      childOrganizationForAdmin.parentOrganizationId = parentOrganizationId;
      await organizationForAdminRepository.update(childOrganizationForAdmin);

      // then
      const updatedOrganization = await knex('organizations').where({ id: childOrganization.id }).first();
      expect(updatedOrganization.parentOrganizationId).to.equal(parentOrganizationId);
      expect(updatedOrganization.updatedAt).to.deep.equal(new Date('2022-02-02'));
    });

    it('should enable feature', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser({ firstName: 'Anne', lastName: 'Héantie' }).id;
      const organization = databaseBuilder.factory.buildOrganization({
        name: 'super orga',
        createdBy: userId,
      });
      const featureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.MISSIONS_MANAGEMENT).id;
      await databaseBuilder.commit();

      // when
      const organizationToUpdate = new OrganizationForAdmin({
        id: organization.id,
        documentationUrl: 'https://pix.fr/',
        features: {
          [ORGANIZATION_FEATURE.LEARNER_IMPORT.key]: { active: false },
          [ORGANIZATION_FEATURE.MISSIONS_MANAGEMENT.key]: { active: true },
        },
      });
      await organizationForAdminRepository.update(organizationToUpdate);

      // then
      const enabledFeatures = await knex('organization-features')
        .where({ organizationId: organization.id, featureId })
        .whereNot({ featureId: byDefaultFeatureId });
      expect(enabledFeatures).to.have.lengthOf(1);
      expect(enabledFeatures[0].featureId).to.equal(featureId);
    });

    it('should not enable feature twice', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser({ firstName: 'Anne', lastName: 'Héantie' }).id;
      const organization = databaseBuilder.factory.buildOrganization({
        name: 'super orga',
        createdBy: userId,
      });

      const featureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.MISSIONS_MANAGEMENT).id;

      databaseBuilder.factory.buildOrganizationFeature({ organizationId: organization.id, featureId });
      await databaseBuilder.commit();

      // when
      const organizationToUpdate = new OrganizationForAdmin({
        id: organization.id,
        documentationUrl: 'https://pix.fr/',
        features: {
          [ORGANIZATION_FEATURE.MISSIONS_MANAGEMENT.key]: { active: true },
        },
      });

      await organizationForAdminRepository.update(organizationToUpdate);

      // then
      const enabledFeatures = await knex('organization-features')
        .where({ organizationId: organization.id })
        .whereNot({ featureId: byDefaultFeatureId });
      expect(enabledFeatures).to.have.lengthOf(1);
      expect(enabledFeatures[0].featureId).to.equal(featureId);
    });

    it('should disable feature for a given organization', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser({ firstName: 'Anne', lastName: 'Héantie' }).id;
      const organization = databaseBuilder.factory.buildOrganization({
        name: 'super orga',
        createdBy: userId,
      });

      const otherOrganization = databaseBuilder.factory.buildOrganization({
        name: 'other orga',
        createdBy: userId,
      });

      const featureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.MISSIONS_MANAGEMENT).id;
      databaseBuilder.factory.buildOrganizationFeature({ organizationId: organization.id, featureId });
      databaseBuilder.factory.buildOrganizationFeature({ organizationId: otherOrganization.id, featureId });

      await databaseBuilder.commit();

      // when
      const organizationToUpdate = new OrganizationForAdmin({
        id: organization.id,
        documentationUrl: 'https://pix.fr/',
        features: {
          [ORGANIZATION_FEATURE.MISSIONS_MANAGEMENT.key]: { active: false },
        },
      });
      await organizationForAdminRepository.update(organizationToUpdate);

      //then
      const enabledFeatures = await knex('organization-features').whereNot({ featureId: byDefaultFeatureId });
      expect(enabledFeatures).to.have.lengthOf(1);
      expect(enabledFeatures[0].organizationId).to.equal(otherOrganization.id);
    });

    it('should disable the "by default" feature for a given organization', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser({ firstName: 'Anne', lastName: 'Héantie' }).id;
      const organization = databaseBuilder.factory.buildOrganization({
        name: 'super orga',
        createdBy: userId,
      });

      await databaseBuilder.commit();

      // when
      const organizationToUpdate = new OrganizationForAdmin({
        id: organization.id,
        documentationUrl: 'https://pix.fr/',
        features: {
          [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: { active: false },
        },
      });
      await organizationForAdminRepository.update(organizationToUpdate);

      //then
      const enabledFeatures = await knex('organization-features');
      expect(enabledFeatures).to.have.lengthOf(0);
    });

    it('should create data protection officer', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser({ firstName: 'Spider', lastName: 'Man' }).id;
      const organization = databaseBuilder.factory.buildOrganization({
        name: 'super orga',
        createdBy: userId,
      });

      await databaseBuilder.commit();

      // when
      const organizationToUpdate = new OrganizationForAdmin({
        id: organization.id,
        documentationUrl: 'https://pix.fr/',
        dataProtectionOfficerEmail: 'iron@man.fr',
        dataProtectionOfficerFirstName: 'Iron',
        dataProtectionOfficerLastName: 'Man',
      });
      await organizationForAdminRepository.update(organizationToUpdate);

      // then
      const dataProtectionOfficerCreated = await knex('data-protection-officers')
        .where({
          organizationId: organization.id,
        })
        .first();
      expect(dataProtectionOfficerCreated.firstName).to.equal('Iron');
      expect(dataProtectionOfficerCreated.lastName).to.equal('Man');
      expect(dataProtectionOfficerCreated.email).to.equal('iron@man.fr');
    });

    it('should update data protection officer', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser({ firstName: 'Spider', lastName: 'Man' }).id;
      const organization = databaseBuilder.factory.buildOrganization({
        name: 'super orga',
        createdBy: userId,
      });

      databaseBuilder.factory.buildDataProtectionOfficer.withOrganizationId({
        organizationId: organization.id,
        firstName: 'Tony',
        lastName: 'Stark',
        email: 'tony@stark.com',
      });

      await databaseBuilder.commit();

      // when
      const organizationToUpdate = new OrganizationForAdmin({
        id: organization.id,
        documentationUrl: 'https://pix.fr/',
        dataProtectionOfficerEmail: 'iron@man.fr',
        dataProtectionOfficerFirstName: 'Iron',
        dataProtectionOfficerLastName: 'Man',
      });
      await organizationForAdminRepository.update(organizationToUpdate);

      // then
      const dataProtectionOfficerUpdated = await knex('data-protection-officers')
        .where({
          organizationId: organization.id,
        })
        .first();
      expect(dataProtectionOfficerUpdated.firstName).to.equal('Iron');
      expect(dataProtectionOfficerUpdated.lastName).to.equal('Man');
      expect(dataProtectionOfficerUpdated.email).to.equal('iron@man.fr');
    });

    it('should add tags', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const tagId = databaseBuilder.factory.buildTag({ name: 'myTag' }).id;
      const otherTagId = databaseBuilder.factory.buildTag({ name: 'myOtherTag' }).id;

      await databaseBuilder.commit();
      const tagsToAdd = [
        { tagId, organizationId },
        { tagId: otherTagId, organizationId },
      ];
      // when

      const organizationToUpdate = new OrganizationForAdmin({
        id: organizationId,
        documentationUrl: 'https://pix.fr/',
      });

      organizationToUpdate.tagsToAdd = tagsToAdd;
      await organizationForAdminRepository.update(organizationToUpdate);

      // then
      const addedTags = await knex('organization-tags').select('tagId', 'organizationId').where({ organizationId });
      expect(addedTags).to.deep.equal(tagsToAdd);
    });

    it('should not add tags twice', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const tagId = databaseBuilder.factory.buildTag({ name: 'myTag' }).id;
      databaseBuilder.factory.buildOrganizationTag({ tagId, organizationId });
      await databaseBuilder.commit();
      const tagsToAdd = [{ tagId, organizationId }];

      // when
      const organizationToUpdate = new OrganizationForAdmin({
        id: organizationId,
        documentationUrl: 'https://pix.fr/',
      });

      organizationToUpdate.tagsToAdd = tagsToAdd;
      await organizationForAdminRepository.update(organizationToUpdate);

      // then
      const addedTags = await knex('organization-tags').where({ organizationId });
      expect(addedTags).to.have.lengthOf(1);
    });

    it('should remove tags', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const tagId = databaseBuilder.factory.buildTag({ name: 'myTag' }).id;
      const otherTagId = databaseBuilder.factory.buildTag({ name: 'myOtherTag' }).id;
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId });
      databaseBuilder.factory.buildOrganizationTag({ organizationId, tagId: otherTagId });
      await databaseBuilder.commit();

      const tagsToRemove = [
        { tagId, organizationId },
        { tagId: otherTagId, organizationId },
      ];

      // when
      const organizationToUpdate = new OrganizationForAdmin({
        id: organizationId,
        documentationUrl: 'https://pix.fr/',
      });

      organizationToUpdate.tagsToRemove = tagsToRemove;
      await organizationForAdminRepository.update(organizationToUpdate);

      // then
      const result = await knex('organization-tags').where({ organizationId });
      expect(result).to.have.lengthOf(0);
    });

    it('should not add row in table "organizations"', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization({ id: 1 });
      await databaseBuilder.commit();
      const { count: nbOrganizationsBeforeUpdate } = await knex('organizations').count('*').first();

      // when
      await organizationForAdminRepository.update(new OrganizationForAdmin(organization));

      // then
      const { count: nbOrganizationsAfterUpdate } = await knex('organizations').count('*').first();
      expect(nbOrganizationsAfterUpdate).to.equal(nbOrganizationsBeforeUpdate);
    });
  });
});
