import _ from 'lodash';
import sinon from 'sinon';

import { AttachedOrganization } from '../../../../../src/organizational-entities/domain/models/AttachedOrganization.js';
import { OrganizationForAdmin } from '../../../../../src/organizational-entities/domain/models/OrganizationForAdmin.js';
import { OrganizationLearnerType } from '../../../../../src/organizational-entities/domain/models/OrganizationLearnerType.js';
import { repositories } from '../../../../../src/organizational-entities/infrastructure/repositories/index.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/constants.js';
import { MissingAttributesError, NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { OrganizationInvitation } from '../../../../../src/team/domain/models/OrganizationInvitation.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Organizational Entities | Infrastructure | Repository | organization-for-admin', function () {
  let clock, byDefaultFeatureId, administrationTeam, organizationLearnerType, domainOrganizationLearnerType;
  const now = new Date('2022-02-02');

  beforeEach(async function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    administrationTeam = databaseBuilder.factory.buildAdministrationTeam({ name: 'ma team' });
    organizationLearnerType = databaseBuilder.factory.buildOrganizationLearnerType();
    domainOrganizationLearnerType = domainBuilder.acquisition.buildOrganizationLearnerType({
      ...organizationLearnerType,
    });
    await databaseBuilder.commit();
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#findPaginatedFiltered', function () {
    context('when there are Organizations in the database', function () {
      it('should return an Array of Organizations with informations', async function () {
        // given
        const expectedOrganization = databaseBuilder.factory.buildOrganization({
          id: 123,
          name: 'mon orga',
          type: 'PRO',
          externalId: 'externalId',
          administrationTeamId: administrationTeam.id,
        });
        databaseBuilder.factory.buildOrganization({ name: 'team', administrationTeamId: administrationTeam.id });
        await databaseBuilder.commit();

        const filter = {};
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingOrganizations, pagination } =
          await repositories.organizationForAdminRepository.findPaginatedFiltered({
            filter,
            page,
          });

        // then
        expect(matchingOrganizations).to.exist;
        expect(matchingOrganizations).to.have.lengthOf(2);
        expect(matchingOrganizations[0]).to.be.an.instanceOf(OrganizationForAdmin);
        expect(matchingOrganizations[0].name).to.equal(expectedOrganization.name);
        expect(matchingOrganizations[0].type).to.equal(expectedOrganization.type);
        expect(matchingOrganizations[0].externalId).to.equal(expectedOrganization.externalId);
        expect(matchingOrganizations[0].administrationTeamId).to.equal(administrationTeam.id);
        expect(matchingOrganizations[0].administrationTeamName).to.equal(administrationTeam.name);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are more Organizations  than pagination pageSize in the database', function () {
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
          await repositories.organizationForAdminRepository.findPaginatedFiltered({
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
          await repositories.organizationForAdminRepository.findPaginatedFiltered({
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
      it('should return only Organizations matching "name" if given in filters', async function () {
        // given
        databaseBuilder.factory.buildOrganization({ name: 'Dragonades co' });
        databaseBuilder.factory.buildOrganization({ name: 'Broca & co' });
        databaseBuilder.factory.buildOrganization({ name: 'Dragonades & co+' });
        databaseBuilder.factory.buildOrganization({ name: 'Donnie & co' });

        await databaseBuilder.commit();

        const filter = { name: 'dragonadesCo' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingOrganizations, pagination } =
          await repositories.organizationForAdminRepository.findPaginatedFiltered({
            filter,
            page,
          });

        // then
        expect(matchingOrganizations).to.have.lengthOf(2);
        expect(_.map(matchingOrganizations, 'name')).to.have.members(['Dragonades co', 'Dragonades & co+']);
        expect(pagination).to.deep.equal(expectedPagination);
      });

      it('should return Organizations matching "name" with accents ignored', async function () {
        // given
        databaseBuilder.factory.buildOrganization({ name: 'College' });
        databaseBuilder.factory.buildOrganization({ name: 'Collège' });
        databaseBuilder.factory.buildOrganization({ name: 'Broca & co' });
        databaseBuilder.factory.buildOrganization({ name: 'Donnie & co' });

        await databaseBuilder.commit();

        const filter = { name: 'college' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingOrganizations, pagination } =
          await repositories.organizationForAdminRepository.findPaginatedFiltered({
            filter,
            page,
          });

        // then
        expect(_.map(matchingOrganizations, 'name')).to.have.members(['College', 'Collège']);
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
          await repositories.organizationForAdminRepository.findPaginatedFiltered({
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
          await repositories.organizationForAdminRepository.findPaginatedFiltered({
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
          await repositories.organizationForAdminRepository.findPaginatedFiltered({
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
            await repositories.organizationForAdminRepository.findPaginatedFiltered({
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
          await repositories.organizationForAdminRepository.findPaginatedFiltered({
            filter,
            page,
          });

        // then
        expect(matchingOrganizations).to.have.lengthOf(2);
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
          await repositories.organizationForAdminRepository.findPaginatedFiltered({
            filter,
            page,
          });

        // then
        expect(_.map(matchingOrganizations, 'archivedAt')).to.have.members([null]);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are organizations matching the "administrationTeamId" filter', function () {
      let teamA, teamB;

      beforeEach(function () {
        teamA = databaseBuilder.factory.buildAdministrationTeam({ name: 'Team A' });
        teamB = databaseBuilder.factory.buildAdministrationTeam({ name: 'Team B' });
        databaseBuilder.factory.buildOrganization({ name: 'Org A1', administrationTeamId: teamA.id });
        databaseBuilder.factory.buildOrganization({ name: 'Org A2', administrationTeamId: teamA.id });
        databaseBuilder.factory.buildOrganization({ name: 'Org B1', administrationTeamId: teamB.id });
        return databaseBuilder.commit();
      });

      it('return only Organizations matching "administrationTeamId" if given in filters', async function () {
        // given
        const filter = { administrationTeamId: teamA.id };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };
        // when
        const { models: matchingOrganizations, pagination } =
          await repositories.organizationForAdminRepository.findPaginatedFiltered({
            filter,
            page,
          });

        // then
        expect(_.map(matchingOrganizations, 'name')).to.have.members(['Org A1', 'Org A2']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are organization matching target-profilte-id filter', function () {
      let targetProfile;

      beforeEach(function () {
        targetProfile = databaseBuilder.factory.buildTargetProfile();
        const orgaA = databaseBuilder.factory.buildOrganization({ name: 'Org A1' });
        const orgaB = databaseBuilder.factory.buildOrganization({ name: 'Org B1' });
        databaseBuilder.factory.buildOrganization({ name: 'Org C1' });
        databaseBuilder.factory.buildTargetProfileShare({
          targetProfileId: targetProfile.id,
          organizationId: orgaA.id,
        });
        databaseBuilder.factory.buildTargetProfileShare({
          targetProfileId: targetProfile.id,
          organizationId: orgaB.id,
        });

        return databaseBuilder.commit();
      });

      it('return only Organizations matching "targetProfileId" if given in filters', async function () {
        // given
        const filter = { targetProfileId: targetProfile.id };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };
        // when
        const { models: matchingOrganizations, pagination } =
          await repositories.organizationForAdminRepository.findPaginatedFiltered({
            filter,
            page,
          });

        // then
        expect(_.map(matchingOrganizations, 'name')).to.have.members(['Org A1', 'Org B1']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });
    context('when there are organization matching combined-course-blueprint-id filter', function () {
      let blueprint;

      beforeEach(function () {
        blueprint = databaseBuilder.factory.buildCombinedCourseBlueprint({ content: [] });
        const orgaA = databaseBuilder.factory.buildOrganization({ name: 'Org A1' });
        const orgaB = databaseBuilder.factory.buildOrganization({ name: 'Org B1' });
        databaseBuilder.factory.buildOrganization({ name: 'Org C1' });
        databaseBuilder.factory.buildCombinedCourseBlueprintShare({
          combinedCourseBlueprintId: blueprint.id,
          organizationId: orgaA.id,
        });
        databaseBuilder.factory.buildCombinedCourseBlueprintShare({
          combinedCourseBlueprintId: blueprint.id,
          organizationId: orgaB.id,
        });

        return databaseBuilder.commit();
      });

      it('return only Organizations matching "combinedCourseBlueprintId" if given in filters', async function () {
        // given
        const filter = { combinedCourseBlueprintId: blueprint.id };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };
        // when
        const { models: matchingOrganizations, pagination } =
          await repositories.organizationForAdminRepository.findPaginatedFiltered({
            filter,
            page,
          });

        // then
        expect(_.map(matchingOrganizations, 'name')).to.have.members(['Org A1', 'Org B1']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });
  });

  describe('#archive', function () {
    context('when the organization does exist', function () {
      it('should hard delete all invitations of a given organization regardless of status', async function () {
        // given
        const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;

        const pendingStatus = OrganizationInvitation.StatusType.PENDING;
        const cancelledStatus = OrganizationInvitation.StatusType.CANCELLED;
        const acceptedStatus = OrganizationInvitation.StatusType.ACCEPTED;

        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;

        databaseBuilder.factory.buildOrganizationInvitation({ organizationId, status: pendingStatus });
        databaseBuilder.factory.buildOrganizationInvitation({
          organizationId,
          status: acceptedStatus,
        });
        databaseBuilder.factory.buildOrganizationInvitation({
          organizationId,
          status: cancelledStatus,
        });

        databaseBuilder.factory.buildOrganizationInvitation({
          organizationId: otherOrganizationId,
          status: pendingStatus,
        });

        await databaseBuilder.commit();

        // when
        await repositories.organizationForAdminRepository.archive({
          id: organizationId,
          archivedBy: superAdminUserId,
        });

        // then
        const organizationInvitations = await knex('organization-invitations').where({
          organizationId,
        });

        const otherOrganizationInvitations = await knex('organization-invitations').where({
          organizationId: otherOrganizationId,
        });

        expect(organizationInvitations).to.have.lengthOf(0);
        expect(otherOrganizationInvitations).to.have.lengthOf(1);
      });

      it('should delete active campaigns of a given organization', async function () {
        // given
        const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;
        const previousDate = new Date('2021-01-01');
        const organizationId = 1;
        databaseBuilder.factory.buildOrganization({ id: organizationId });

        databaseBuilder.factory.buildCampaign({ id: 1, organizationId });
        databaseBuilder.factory.buildCampaign({ id: 2, organizationId });
        databaseBuilder.factory.buildCampaign({ id: 3, organizationId, archivedAt: previousDate });
        databaseBuilder.factory.buildCampaign({ id: 4, organizationId, deletedAt: previousDate });

        await databaseBuilder.commit();

        // when
        await repositories.organizationForAdminRepository.archive({
          id: organizationId,
          archivedBy: superAdminUserId,
        });

        // then
        const activeCampaigns = await knex('campaigns').whereNull('deletedAt');
        expect(activeCampaigns).to.have.lengthOf(0);
        const newlyArchivedCampaigns = await knex('campaigns').where({ deletedAt: now });
        expect(newlyArchivedCampaigns).to.have.lengthOf(3);

        const previousDeletedCampaigns = await knex('campaigns').where({ archivedAt: previousDate });
        expect(previousDeletedCampaigns).to.have.lengthOf(1);
      });

      it('should delete organization learners', async function () {
        // given
        const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;
        const previousDate = new Date('2021-01-01');
        const organizationId = 1;
        databaseBuilder.factory.buildOrganization({ id: organizationId });
        databaseBuilder.factory.buildCampaign({ id: 1, organizationId });
        databaseBuilder.factory.buildOrganizationLearner({ organizationId });
        databaseBuilder.factory.buildOrganizationLearner({ organizationId });
        databaseBuilder.factory.buildOrganizationLearner({ organizationId, deletedAt: previousDate });

        await databaseBuilder.commit();

        // when
        await repositories.organizationForAdminRepository.archive({
          id: organizationId,
          archivedBy: superAdminUserId,
        });

        // then
        const activeLearners = await knex('organization-learners').whereNull('deletedAt');
        expect(activeLearners).to.have.lengthOf(0);
        const deletedLearners = await knex('organization-learners').where({ deletedAt: now });
        expect(deletedLearners).to.have.lengthOf(2);

        const previousDeletedLearners = await knex('organization-learners').where({ deletedAt: previousDate });
        expect(previousDeletedLearners).to.have.lengthOf(1);
      });

      it('#should delete campaign-participations', async function () {
        // given
        const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;
        const previousDate = new Date('2021-01-01');
        const organizationId = 1;
        databaseBuilder.factory.buildOrganization({ id: organizationId });
        const campaign = databaseBuilder.factory.buildCampaign({ id: 1, organizationId });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id, deletedAt: previousDate });

        await databaseBuilder.commit();

        // when
        await repositories.organizationForAdminRepository.archive({
          id: organizationId,
          archivedBy: superAdminUserId,
        });

        // then
        const activeParticipations = await knex('campaign-participations').whereNull('deletedAt');
        expect(activeParticipations).to.have.lengthOf(0);
        const deletedParticipations = await knex('campaign-participations').where({ deletedAt: now });
        expect(deletedParticipations).to.have.lengthOf(2);

        const previousDeletedParticipations = await knex('campaign-participations').where({
          deletedAt: previousDate,
        });
        expect(previousDeletedParticipations).to.have.lengthOf(1);
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
        await repositories.organizationForAdminRepository.archive({ id: organizationId, archivedBy: superAdminUserId });

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
        await repositories.organizationForAdminRepository.archive({ id: organizationId, archivedBy: superAdminUserId });

        // then
        const archivedOrganization = await knex('organizations').where({ id: organizationId }).first();
        expect(archivedOrganization.archivedBy).to.equal(superAdminUserId);
        expect(archivedOrganization.archivedAt).to.deep.equal(now);

        const organizations = await knex('organizations').where({ archivedBy: null });
        expect(organizations).to.have.lengthOf(1);
        expect(organizations[0].id).to.equal(2);
      });
    });

    context('when the organization does not exist', function () {
      it('should throw NotFoundError', async function () {
        // given
        const nonExistingOrganizationId = 1;

        // when
        const error = await catchErr(repositories.organizationForAdminRepository.archive)({
          id: nonExistingOrganizationId,
          archivedBy: 123,
        });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });

    describe('when attributes missing', function () {
      it('should throw MissingAttributesError', async function () {
        // given
        const organizationId = 1;
        databaseBuilder.factory.buildOrganization({ id: organizationId });
        databaseBuilder.factory.buildOrganization({ id: 2 });

        await databaseBuilder.commit();

        // when
        const error = await catchErr(repositories.organizationForAdminRepository.archive)({ id: organizationId });

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
        const result = await repositories.organizationForAdminRepository.exist({ organizationId });

        // then
        expect(result).to.be.true;
      });
    });

    context('when organization does not exist', function () {
      it('returns false', async function () {
        // given
        const organizationId = 1234;

        // when
        const result = await repositories.organizationForAdminRepository.exist({ organizationId });

        // then
        expect(result).to.be.false;
      });
    });
  });

  describe('#findChildrenByParentOrganizationId', function () {
    let parentOrganizationId, parentStructureId, networkId;

    beforeEach(async function () {
      const {
        organization: parentOrganization,
        structure: parentStructure,
        network,
      } = databaseBuilder.factory.buildNetworkAndHeadOrganization({
        headOrganization: { name: 'Parent Org', type: 'SCO', externalId: '1234567A' },
      });
      parentOrganizationId = parentOrganization.id;
      parentStructureId = parentStructure.id;
      networkId = network.id;
      await databaseBuilder.commit();
    });

    context('when there is no child organization', function () {
      it('returns an empty array', async function () {
        // given
        // when
        const children = await repositories.organizationForAdminRepository.findChildrenByParentOrganizationId({
          parentOrganizationId,
        });

        // then
        expect(children).to.have.lengthOf(0);
      });
    });

    context('when there is at least one child organization', function () {
      it('returns an array of OrganizationForAdmin instances ordered by name', async function () {
        // given
        databaseBuilder.factory.buildOrganizationInNetwork({
          networkId,
          parentStructureId,
          organizationData: { name: 'Second Child', type: 'SCO' },
        });
        databaseBuilder.factory.buildOrganizationInNetwork({
          networkId,
          parentStructureId,
          organizationData: { name: 'First Child', type: 'SCO' },
        });

        await databaseBuilder.commit();

        // when
        const children = await repositories.organizationForAdminRepository.findChildrenByParentOrganizationId({
          parentOrganizationId,
        });

        // then
        expect(children).to.have.lengthOf(2);
        expect(children[0]).to.be.instanceOf(OrganizationForAdmin);
        expect(_.map(children, 'name')).to.deep.equal(['First Child', 'Second Child']);
      });
    });

    context('when an organization has a structure but no parent', function () {
      it('does not return it', async function () {
        // given
        databaseBuilder.factory.buildOrganizationWithStructure({
          organizationData: { name: 'Unrelated Org', type: 'SCO' },
        });
        await databaseBuilder.commit();

        // when
        const children = await repositories.organizationForAdminRepository.findChildrenByParentOrganizationId({
          parentOrganizationId,
        });

        // then
        expect(children).to.have.lengthOf(0);
      });
    });
  });

  describe('#get', function () {
    it('returns an organization for admin by provided id', async function () {
      // given
      const superAdminUser = databaseBuilder.factory.buildUser({ firstName: 'Cécile', lastName: 'Encieux' });
      const organizationLearnerType = databaseBuilder.factory.buildOrganizationLearnerType({ name: 'Type Toto' });
      const {
        network,
        structure: parentStructure,
        organization: parentOrganization,
      } = databaseBuilder.factory.buildNetworkAndHeadOrganization({
        headOrganization: {
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
          organizationLearnerTypeId: organizationLearnerType.id,
        },
      });
      const { organization } = databaseBuilder.factory.buildOrganizationInNetwork({
        networkId: network.id,
        parentStructureId: parentStructure.id,
        organizationData: {
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
          administrationTeamId: administrationTeam.id,
          countryCode: 99100,
          organizationLearnerTypeId: organizationLearnerType.id,
        },
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
      const foundOrganizationForAdmin = await repositories.organizationForAdminRepository.get({
        organizationId: organization.id,
      });

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
        administrationTeamId: administrationTeam.id,
        administrationTeamName: administrationTeam.name,
        organizationLearnerType: organizationLearnerType,
        features: {
          [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: { active: false },
          [ORGANIZATION_FEATURE.LEARNER_IMPORT.key]: { active: true, params: { name: 'BIDON' } },
        },
        parentOrganizationId: parentOrganization.id,
        parentOrganizationName: 'Mother Of Dark Side',
        countryCode: 99100,
        networkId: network.id,
        networkName: network.name,
        networkHeadOrganizationId: parentOrganization.id,
        networkHeadOrganizationName: 'Mother Of Dark Side',
      });
      expect(foundOrganizationForAdmin).to.deep.equal(expectedOrganizationForAdmin);
    });

    it('should throw when organization is not found', async function () {
      // given
      const nonExistentId = 10083;

      // when
      const error = await catchErr(repositories.organizationForAdminRepository.get)({ organizationId: nonExistentId });

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
          administrationTeamId: administrationTeam.id,
          countryCode: 99100,
          organizationLearnerTypeId: organizationLearnerType.id,
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
        const foundOrganizationForAdmin = await repositories.organizationForAdminRepository.get({
          organizationId: organization.id,
        });

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
          administrationTeamId: administrationTeam.id,
          administrationTeamName: administrationTeam.name,
          countryCode: 99100,
          organizationLearnerType: domainOrganizationLearnerType,
          networkId: null,
          networkName: null,
        });
        expect(foundOrganizationForAdmin).to.deep.equal(expectedOrganizationForAdmin);
      });
    });

    describe('when organization has a feature,', function () {
      it('should return if its enable and the additional params', async function () {
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
          administrationTeamId: administrationTeam.id,
          countryCode: 99100,
          organizationLearnerTypeId: organizationLearnerType.id,
        });

        databaseBuilder.factory.buildDataProtectionOfficer.withOrganizationId({
          firstName: 'Justin',
          lastName: 'Ptipeu',
          email: 'justin.ptipeu@example.net',
          organizationId: organization.id,
        });

        const placesManagementFeatureId = databaseBuilder.factory.buildFeature(
          ORGANIZATION_FEATURE.PLACES_MANAGEMENT,
        ).id;
        const attestationsManagementFeatureId = databaseBuilder.factory.buildFeature(
          ORGANIZATION_FEATURE.ATTESTATIONS_MANAGEMENT,
        ).id;

        databaseBuilder.factory.buildOrganizationFeature({
          featureId: placesManagementFeatureId,
          organizationId: organization.id,
          params: JSON.stringify({ enableMaximumPlacesLimit: false }),
        });
        databaseBuilder.factory.buildOrganizationFeature({
          featureId: attestationsManagementFeatureId,
          organizationId: organization.id,
          params: JSON.stringify(['SIXTH_GRADE']),
        });

        const otherFeatureId = databaseBuilder.factory.buildFeature({
          key: 'Pizza feature',
          description: 'Not Hawai',
        }).id;
        databaseBuilder.factory.buildOrganizationFeature({
          featureId: otherFeatureId,
          organizationId: organization.id,
          params: JSON.stringify({ mushrooms: true, pinapple: false }),
        });
        await databaseBuilder.commit();

        // when
        const foundOrganizationForAdmin = await repositories.organizationForAdminRepository.get({
          organizationId: organization.id,
        });

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
            [ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key]: { active: true, params: { enableMaximumPlacesLimit: false } },
            [ORGANIZATION_FEATURE.ATTESTATIONS_MANAGEMENT.key]: { active: true, params: ['SIXTH_GRADE'] },
            'Pizza feature': { active: true, params: null },
          },
          parentOrganizationId: null,
          parentOrganizationName: null,
          administrationTeamId: administrationTeam.id,
          administrationTeamName: administrationTeam.name,
          countryCode: 99100,
          organizationLearnerType: domainOrganizationLearnerType,
          networkId: null,
          networkName: null,
        });
        expect(foundOrganizationForAdmin).to.deep.equal(expectedOrganizationForAdmin);
      });
    });

    describe('when the organization belongs to a network', function () {
      it('should return the network with head organization info', async function () {
        // given
        const network = databaseBuilder.factory.buildNetwork({ name: 'Réseau Académique' });
        const { organization } = databaseBuilder.factory.buildOrganizationInNetwork({
          networkId: network.id,
          organizationData: { organizationLearnerTypeId: organizationLearnerType.id },
        });
        await databaseBuilder.commit();

        // when
        const foundOrganizationForAdmin = await repositories.organizationForAdminRepository.get({
          organizationId: organization.id,
        });

        // then
        expect(foundOrganizationForAdmin.network.id).to.equal(network.id);
        expect(foundOrganizationForAdmin.network.name).to.equal(network.name);
        expect(foundOrganizationForAdmin.network.headOrganization.id).to.equal(organization.id);
        expect(foundOrganizationForAdmin.network.headOrganization.name).to.equal(organization.name);
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
        const organization = await repositories.organizationForAdminRepository.get({
          organizationId: insertedOrganization.id,
        });

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
          administrationTeamId: administrationTeam.id,
          countryCode: 99100,
          organizationLearnerTypeId: organizationLearnerType.id,
        });

        await databaseBuilder.commit();

        // when
        const foundOrganizationForAdmin = await repositories.organizationForAdminRepository.get({
          organizationId: insertedOrganization.id,
        });

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
          administrationTeamId: administrationTeam.id,
          administrationTeamName: administrationTeam.name,
          countryCode: 99100,
          organizationLearnerType: domainOrganizationLearnerType,
          networkId: null,
          networkName: null,
        });
        expect(foundOrganizationForAdmin).to.deepEqualInstance(expectedOrganizationForAdmin);
      });
    });
  });

  describe('#save', function () {
    it('saves the given organization', async function () {
      // given
      const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;
      databaseBuilder.factory.buildCertificationCpfCountry({
        code: 99100,
      });
      databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT);

      await databaseBuilder.commit();

      const organization = new OrganizationForAdmin({
        name: 'Organization SCO',
        type: 'SCO',
        createdBy: superAdminUserId,
        administrationTeamId: administrationTeam.id,
        countryCode: 99100,
        organizationLearnerType: new OrganizationLearnerType({
          id: organizationLearnerType.id,
          name: organizationLearnerType.name,
        }),
      });

      // when
      const savedOrganization = await repositories.organizationForAdminRepository.save({ organization });

      // then
      expect(savedOrganization).to.be.instanceOf(OrganizationForAdmin);
      expect(savedOrganization.name).to.equal('Organization SCO');
      expect(savedOrganization.type).to.equal('SCO');
      expect(savedOrganization.createdBy).to.equal(superAdminUserId);
      expect(savedOrganization.countryCode).to.equal(99100);
      expect(savedOrganization.organizationLearnerType).to.be.instanceOf(OrganizationLearnerType);
      expect(savedOrganization.organizationLearnerType.id).to.equal(organizationLearnerType.id);
    });

    it('creates a structure and fct_structure associated to the created organization', async function () {
      // given
      const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;
      databaseBuilder.factory.buildCertificationCpfCountry({
        code: 99100,
      });
      databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT);

      await databaseBuilder.commit();

      const organization = new OrganizationForAdmin({
        name: 'Organization SCO',
        type: 'SCO',
        createdBy: superAdminUserId,
        administrationTeamId: administrationTeam.id,
        countryCode: 99100,
        organizationLearnerType: new OrganizationLearnerType({
          id: organizationLearnerType.id,
          name: organizationLearnerType.name,
        }),
      });

      // when
      const savedOrganization = await repositories.organizationForAdminRepository.save({
        organization,
      });

      // then
      const fct_structure = await knex('fct_structures').where({ organization_id: savedOrganization.id }).first();
      const structure = await knex('structures').where({ id: fct_structure.structure_id }).first();
      expect(fct_structure).to.deep.equal({
        certification_center_id: null,
        child_structure_id: null,
        network_id: null,
        organization_id: savedOrganization.id,
        parent_structure_id: null,
        structure_id: structure.id,
      });
    });

    context('when a parentOrganizationId is provided', function () {
      it('creates a fct_structure linked to the parent structure and network', async function () {
        // given
        const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;
        databaseBuilder.factory.buildCertificationCpfCountry({ code: 99100 });
        databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT);

        const {
          network,
          structure: parentStructure,
          organization: parentOrganization,
        } = databaseBuilder.factory.buildNetworkAndHeadOrganization();

        await databaseBuilder.commit();

        const organization = new OrganizationForAdmin({
          name: 'Child Organization',
          type: 'PRO',
          createdBy: superAdminUserId,
          administrationTeamId: administrationTeam.id,
          countryCode: 99100,
          parentOrganizationId: parentOrganization.id,
          organizationLearnerType: new OrganizationLearnerType({
            id: organizationLearnerType.id,
            name: organizationLearnerType.name,
          }),
        });

        // when
        const savedOrganization = await repositories.organizationForAdminRepository.save({ organization });

        // then
        const fctStructure = await knex('fct_structures').where({ organization_id: savedOrganization.id }).first();
        expect(fctStructure.parent_structure_id).to.equal(parentStructure.id);
        expect(fctStructure.network_id).to.equal(network.id);
      });
    });

    context('when the organization type is SCO-1D', function () {
      it('adds mission_management, oralization and learner_import features to the organization', async function () {
        const superAdminUserId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCpfCountry({ countryCode: 99100 });
        const missionManagementFeatureId = databaseBuilder.factory.buildFeature(
          ORGANIZATION_FEATURE.MISSIONS_MANAGEMENT,
        ).id;
        const organizationLearnerType = databaseBuilder.factory.buildOrganizationLearnerType();
        const oralizationFeatureId = databaseBuilder.factory.buildFeature(
          ORGANIZATION_FEATURE.ORALIZATION_MANAGED_BY_PRESCRIBER,
        ).id;
        const learnerImportFeatureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.LEARNER_IMPORT).id;
        const organizationLearnerImportOndeFormat = databaseBuilder.factory.buildOrganizationLearnerImportFormat({
          name: 'ONDE',
        });
        byDefaultFeatureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT).id;

        await databaseBuilder.commit();

        const organization = new OrganizationForAdmin({
          name: "École de l'avenir",
          type: 'SCO-1D',
          createdBy: superAdminUserId,
          administrationTeamId: administrationTeam.id,
          countryCode: 99100,
          organizationLearnerType: new OrganizationLearnerType(organizationLearnerType),
        });

        const savedOrganization = await repositories.organizationForAdminRepository.save({ organization });

        const savedOrganizationFeatures = await knex('organization-features')
          .where({ organizationId: savedOrganization.id })
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
      byDefaultFeatureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT).id;
    });

    it('updates organization detail', async function () {
      // given
      const parentOrganizationId = databaseBuilder.factory.buildOrganization({ name: 'Parent Organization' }).id;
      const childOrganization = databaseBuilder.factory.buildOrganization({
        name: 'Child Organization',
        countryCode: 99100,
      });
      await databaseBuilder.commit();
      const childOrganizationForAdmin = new OrganizationForAdmin({
        ...childOrganization,
        parentOrganizationId,
        countryCode: 99243,
        organizationLearnerType: domainOrganizationLearnerType,
      });

      // when
      await repositories.organizationForAdminRepository.update({ organization: childOrganizationForAdmin });

      // then
      const updatedOrganization = await knex('organizations').where({ id: childOrganization.id }).first();
      expect(updatedOrganization.parentOrganizationId).to.equal(parentOrganizationId);
      expect(updatedOrganization.countryCode).to.equal(99243);
      expect(updatedOrganization.updatedAt).to.deep.equal(new Date('2022-02-02'));
    });

    describe('#features', function () {
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
          organizationLearnerType: domainOrganizationLearnerType,
        });
        await repositories.organizationForAdminRepository.update({ organization: organizationToUpdate });

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
          organizationLearnerType: domainOrganizationLearnerType,
        });

        await repositories.organizationForAdminRepository.update({ organization: organizationToUpdate });

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
          organizationLearnerType: domainOrganizationLearnerType,
        });
        await repositories.organizationForAdminRepository.update({ organization: organizationToUpdate });

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
            [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: {
              active: false,
            },
          },
          organizationLearnerType: domainOrganizationLearnerType,
        });
        await repositories.organizationForAdminRepository.update({ organization: organizationToUpdate });

        //then
        const enabledFeatures = await knex('organization-features');
        expect(enabledFeatures).to.have.lengthOf(0);
      });

      describe('PLACES_MANAGEMENT', function () {
        let organization, placeManagementFeature;

        beforeEach(async function () {
          placeManagementFeature = databaseBuilder.factory.buildFeature({
            key: ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
          });
          const userId = databaseBuilder.factory.buildUser({ firstName: 'Anne', lastName: 'Héantie' }).id;
          organization = databaseBuilder.factory.buildOrganization({
            name: 'super orga',
            createdBy: userId,
          });

          await databaseBuilder.commit();
        });

        it('should insert new feature with given params', async function () {
          // given && when
          const organizationToUpdate = new OrganizationForAdmin({
            id: organization.id,
            documentationUrl: 'https://pix.fr/',
            features: {
              [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: {
                active: false,
              },
              [ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key]: {
                active: true,
                params: { enableMaximumPlacesLimit: true },
              },
            },
            organizationLearnerType: domainOrganizationLearnerType,
          });
          await repositories.organizationForAdminRepository.update({ organization: organizationToUpdate });

          //then
          const enabledFeatures = await knex('organization-features');
          expect(enabledFeatures).lengthOf(1);
          expect(enabledFeatures[0].params).deep.equal({ enableMaximumPlacesLimit: true });
        });

        it('by default, should insert new feature with falsy enableMaximumPlacesLimit param', async function () {
          // given && when
          const organizationToUpdate = new OrganizationForAdmin({
            id: organization.id,
            documentationUrl: 'https://pix.fr/',
            features: {
              [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: {
                active: false,
              },
              [ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key]: {
                active: true,
                params: null,
              },
            },
            organizationLearnerType: domainOrganizationLearnerType,
          });

          await repositories.organizationForAdminRepository.update({ organization: organizationToUpdate });

          //then
          const enabledFeatures = await knex('organization-features');
          expect(enabledFeatures).lengthOf(1);
          expect(enabledFeatures[0].params).deep.equal({ enableMaximumPlacesLimit: false });
        });

        it('should be possible to update enableMaximumPlacesLimit param value', async function () {
          // given && when
          databaseBuilder.factory.buildOrganizationFeature({
            featureId: placeManagementFeature.id,
            organizationId: organization.id,
            params: { enableMaximumPlacesLimit: false },
          });

          await databaseBuilder.commit();

          const organizationToUpdate = new OrganizationForAdmin({
            id: organization.id,
            documentationUrl: 'https://pix.fr/',
            features: {
              [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: {
                active: false,
              },
              [ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key]: {
                active: true,
                params: { enableMaximumPlacesLimit: true },
              },
            },
            organizationLearnerType: domainOrganizationLearnerType,
          });

          await repositories.organizationForAdminRepository.update({ organization: organizationToUpdate });

          //then
          const enabledFeatures = await knex('organization-features');
          expect(enabledFeatures).lengthOf(1);
          expect(enabledFeatures[0].params).deep.equal({ enableMaximumPlacesLimit: true });
        });
      });

      describe('ATTESTATIONS_MANAGEMENT', function () {
        let organization;

        beforeEach(async function () {
          databaseBuilder.factory.buildFeature({
            key: ORGANIZATION_FEATURE.ATTESTATIONS_MANAGEMENT.key,
          });
          const userId = databaseBuilder.factory.buildUser({ firstName: 'Anne', lastName: 'Héantie' }).id;
          organization = databaseBuilder.factory.buildOrganization({
            name: 'super orga',
            createdBy: userId,
          });

          await databaseBuilder.commit();
        });

        it('should insert new feature with given params', async function () {
          // given && when
          const organizationToUpdate = new OrganizationForAdmin({
            id: organization.id,
            documentationUrl: 'https://pix.fr/',
            features: {
              [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: {
                active: false,
              },
              [ORGANIZATION_FEATURE.ATTESTATIONS_MANAGEMENT.key]: {
                active: true,
                params: ['my-reward', 'other-reward'],
              },
            },
            organizationLearnerType: domainOrganizationLearnerType,
          });
          await repositories.organizationForAdminRepository.update({ organization: organizationToUpdate });

          //then
          const enabledFeatures = await knex('organization-features');
          expect(enabledFeatures).lengthOf(1);
          expect(enabledFeatures[0].params).deep.equal(['my-reward', 'other-reward']);
        });
      });
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
        organizationLearnerType: domainOrganizationLearnerType,
      });
      await repositories.organizationForAdminRepository.update({ organization: organizationToUpdate });

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

    it('should update data protection officer but not the createdAt', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser({ firstName: 'Spider', lastName: 'Man' }).id;
      const organization = databaseBuilder.factory.buildOrganization({
        name: 'super orga',
        createdBy: userId,
      });
      const date = new Date('1992-07-07');
      databaseBuilder.factory.buildDataProtectionOfficer.withOrganizationId({
        organizationId: organization.id,
        firstName: 'Tony',
        lastName: 'Stark',
        email: 'tony@stark.com',
        createdAt: date,
        updatedAt: date,
      });

      await databaseBuilder.commit();

      // when
      const organizationToUpdate = new OrganizationForAdmin({
        id: organization.id,
        documentationUrl: 'https://pix.fr/',
        dataProtectionOfficerEmail: 'iron@man.fr',
        dataProtectionOfficerFirstName: 'Iron',
        dataProtectionOfficerLastName: 'Man',
        organizationLearnerType: domainOrganizationLearnerType,
      });
      await repositories.organizationForAdminRepository.update({ organization: organizationToUpdate });

      // then
      const dataProtectionOfficerUpdated = await knex('data-protection-officers')
        .where({
          organizationId: organization.id,
        })
        .first();
      expect(dataProtectionOfficerUpdated.firstName).to.equal('Iron');
      expect(dataProtectionOfficerUpdated.lastName).to.equal('Man');
      expect(dataProtectionOfficerUpdated.email).to.equal('iron@man.fr');
      expect(dataProtectionOfficerUpdated.createdAt).to.deep.equal(date);
      expect(dataProtectionOfficerUpdated.updatedAt).to.not.deep.equal(date);
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
        organizationLearnerType: domainOrganizationLearnerType,
      });

      organizationToUpdate.tagsToAdd = tagsToAdd;
      await repositories.organizationForAdminRepository.update({ organization: organizationToUpdate });

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
        organizationLearnerType: domainOrganizationLearnerType,
      });

      organizationToUpdate.tagsToAdd = tagsToAdd;
      await repositories.organizationForAdminRepository.update({ organization: organizationToUpdate });

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
        organizationLearnerType: domainOrganizationLearnerType,
      });

      organizationToUpdate.tagsToRemove = tagsToRemove;
      await repositories.organizationForAdminRepository.update({ organization: organizationToUpdate });

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
      await repositories.organizationForAdminRepository.update({
        organization: new OrganizationForAdmin({
          ...organization,
          organizationLearnerType: domainOrganizationLearnerType,
        }),
      });

      // then
      const { count: nbOrganizationsAfterUpdate } = await knex('organizations').count('*').first();
      expect(nbOrganizationsAfterUpdate).to.equal(nbOrganizationsBeforeUpdate);
    });

    it('should update learner type name', async function () {
      // given
      const firstOrganizationLearnerType = databaseBuilder.factory.buildOrganizationLearnerType({
        name: 'Ancien Learner Type',
      });
      const secondOrganizationLearnerType = databaseBuilder.factory.buildOrganizationLearnerType({
        name: 'Nouveau Learner Type',
      });
      const organization = databaseBuilder.factory.buildOrganization({
        organizationLearnerTypeId: firstOrganizationLearnerType.id,
      });

      await databaseBuilder.commit();

      // when
      const organizationToUpdate = new OrganizationForAdmin({
        id: organization.id,
        organizationLearnerType: new OrganizationLearnerType({
          id: secondOrganizationLearnerType.id,
          name: secondOrganizationLearnerType.name,
        }),
      });
      await repositories.organizationForAdminRepository.update({ organization: organizationToUpdate });

      // then
      const { organizationLearnerTypeId } = await knex('organizations')
        .where({
          id: organization.id,
        })
        .first();
      expect(organizationLearnerTypeId).to.equal(secondOrganizationLearnerType.id);
    });
  });

  describe('findExistingIds', function () {
    it('should return organization ids matching given ids', async function () {
      // given
      const organization1 = databaseBuilder.factory.buildOrganization();
      const organization2 = databaseBuilder.factory.buildOrganization();
      await databaseBuilder.commit();

      // when
      const foundOrganizationIds = await repositories.organizationForAdminRepository.findExistingIds({
        ids: [organization1.id, organization2.id],
      });

      // then
      expect(foundOrganizationIds).to.deep.equal([organization1.id, organization2.id]);
    });

    it('should return an empty array if no organization id matches', async function () {
      // given
      const unknownOrganizationIds = [999, 998];

      // when
      const foundOrganizationIds = await repositories.organizationForAdminRepository.findExistingIds({
        ids: unknownOrganizationIds,
      });

      // then
      expect(foundOrganizationIds).to.deep.equal([]);
    });
  });

  describe('#findAttachedByCertificationCenterId', function () {
    describe('when a certification center is linked to an organization', function () {
      it('returns organization linked to a given certification center', async function () {
        // given
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;

        const { organization } = databaseBuilder.factory.buildOrganizationWithStructure({
          certificationCenterId: certificationCenterId,
        });

        await databaseBuilder.commit();

        // when
        const foundOrganization = await repositories.organizationForAdminRepository.findAttachedByCertificationCenterId(
          { certificationCenterId },
        );

        // then
        expect(foundOrganization).to.have.lengthOf(1);
        expect(foundOrganization[0].id).to.equal(organization.id);
        expect(foundOrganization[0]).to.be.instanceOf(AttachedOrganization);
      });

      it('does not return organization linked to another certification center', async function () {
        // given
        const firstCertificationCenter = databaseBuilder.factory.buildCertificationCenter();
        const { organization: firstOrganization } = databaseBuilder.factory.buildOrganizationWithStructure({
          certificationCenterId: firstCertificationCenter.id,
        });

        const secondCertificationCenter = databaseBuilder.factory.buildCertificationCenter();
        databaseBuilder.factory.buildOrganizationWithStructure({
          certificationCenterId: secondCertificationCenter.id,
        });

        await databaseBuilder.commit();

        // when
        const foundOrganization = await repositories.organizationForAdminRepository.findAttachedByCertificationCenterId(
          {
            certificationCenterId: firstCertificationCenter.id,
          },
        );

        // then
        expect(foundOrganization[0].id).to.equal(firstOrganization.id);
      });
    });

    describe('when a given certification center has no linked organization', function () {
      it('returns an empty array', async function () {
        // given
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
        await databaseBuilder.commit();

        // when
        const foundOrganization = await repositories.organizationForAdminRepository.findAttachedByCertificationCenterId(
          {
            certificationCenterId: certificationCenter.id,
          },
        );

        // then
        expect(foundOrganization).to.be.an('array').that.is.empty;
      });
    });
  });

  describe('#attachCertificationCenterId', function () {
    it('attaches the certification center to the organization through its fact_structure', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const { organization } = databaseBuilder.factory.buildOrganizationWithStructure();

      await databaseBuilder.commit();

      // when
      await repositories.organizationForAdminRepository.attachCertificationCenter({
        organizationId: organization.id,
        certificationCenterId,
      });

      // then
      const organizationFactStructure = await knex('fct_structures')
        .where({ organization_id: organization.id })
        .first();

      expect(organizationFactStructure.certification_center_id).to.equal(certificationCenterId);
    });

    it('does not attach certification center to another organization', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const { organization } = databaseBuilder.factory.buildOrganizationWithStructure();
      const { organization: otherOrganization } = databaseBuilder.factory.buildOrganizationWithStructure();

      await databaseBuilder.commit();

      // when
      await repositories.organizationForAdminRepository.attachCertificationCenter({
        organizationId: organization.id,
        certificationCenterId,
      });

      // then
      const otherOrganizationFactStructure = await knex('fct_structures')
        .where({ organization_id: otherOrganization.id })
        .first();

      expect(otherOrganizationFactStructure.certification_center_id).to.be.null;
    });
  });

  describe('#detachCertificationCenter', function () {
    it('detaches the certification center from the organization through its fact_structure', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const { organization } = databaseBuilder.factory.buildOrganizationWithStructure({
        certificationCenterId,
      });

      await databaseBuilder.commit();

      // when
      await repositories.organizationForAdminRepository.detachCertificationCenter({
        organizationId: organization.id,
      });

      // then
      const organizationFactStructure = await knex('fct_structures')
        .where({ organization_id: organization.id })
        .first();

      expect(organizationFactStructure.certification_center_id).to.be.null;
    });

    it('does not detach certification center from another organization', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const { organization } = databaseBuilder.factory.buildOrganizationWithStructure({
        certificationCenterId,
      });
      const otherCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const { organization: otherOrganization } = databaseBuilder.factory.buildOrganizationWithStructure({
        certificationCenterId: otherCertificationCenterId,
      });

      await databaseBuilder.commit();

      // when
      await repositories.organizationForAdminRepository.detachCertificationCenter({
        organizationId: otherOrganization.id,
      });

      // then
      const organizationFactStructure = await knex('fct_structures')
        .where({ organization_id: organization.id })
        .first();

      expect(organizationFactStructure.certification_center_id).to.equal(certificationCenterId);
    });
  });
});
