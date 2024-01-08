import _ from 'lodash';
import { catchErr, expect, knex, domainBuilder, databaseBuilder } from '../../../test-helper.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';
import { Organization, OrganizationForAdmin } from '../../../../lib/domain/models/index.js';
import * as organizationRepository from '../../../../lib/infrastructure/repositories/organization-repository.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../lib/domain/constants/identity-providers.js';
import { ORGANIZATION_FEATURE } from '../../../../lib/domain/constants.js';

describe('Integration | Repository | Organization', function () {
  describe('#create', function () {
    it('should return an Organization domain object', async function () {
      // given
      const organization = domainBuilder.buildOrganization();

      // when
      const organizationSaved = await organizationRepository.create(organization);

      // then
      expect(organizationSaved).to.be.an.instanceof(Organization);
    });

    it('should add a row in the table "organizations"', async function () {
      // given
      const { count: nbOrganizationsBeforeCreation } = await knex('organizations').count('*').first();

      // when
      await organizationRepository.create(domainBuilder.buildOrganization());

      // then
      const { count: nbOrganizationsAfterCreation } = await knex('organizations').count('*').first();
      expect(nbOrganizationsAfterCreation).to.equal(nbOrganizationsBeforeCreation + 1);
    });

    it('should save model properties', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      const organization = domainBuilder.buildOrganization({ id: null, createdBy: userId });

      // when
      const organizationSaved = await organizationRepository.create(organization);

      // then
      expect(organizationSaved.id).to.not.be.undefined;
      expect(organizationSaved.name).to.equal(organization.name);
      expect(organizationSaved.type).to.equal(organization.type);
      expect(organizationSaved.logoUrl).to.equal(organization.logoUrl);
      expect(organizationSaved.externalId).to.equal(organization.externalId);
      expect(organizationSaved.provinceCode).to.equal(organization.provinceCode);
      expect(organizationSaved.createdBy).to.equal(organization.createdBy);
      expect(organizationSaved.documentationUrl).to.equal(organization.documentationUrl);
    });

    it('should insert default value for credit (0) when not defined', async function () {
      // given
      const organization = new Organization({
        name: 'organization',
        externalId: 'b400',
        type: 'PRO',
      });

      // when
      const organizationSaved = await organizationRepository.create(organization);

      // then
      expect(organizationSaved.credit).to.equal(Organization.defaultValues['credit']);
      expect(organizationSaved.email).to.be.null;
    });
  });

  describe('#update', function () {
    it('should return an Organization domain object with related tags', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organization = databaseBuilder.factory.buildOrganization({
        name: 'super orga',
        type: 'SCO',
        logoUrl: 'http://new.logo.url',
        externalId: '999Z527F',
        provinceCode: '999',
        identityProviderForCampaigns: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
        isManagingStudents: true,
        credit: 50,
        email: 'email@example.net',
        documentationUrl: 'https://pix.fr/',
        archivedAt: null,
        createdAt: '2022-03-07',
        createdBy: userId,
      });
      const tagId = databaseBuilder.factory.buildTag({ name: 'orga tag' }).id;
      databaseBuilder.factory.buildTag({ name: 'other tag' }).id;
      databaseBuilder.factory.buildOrganizationTag({ organizationId: organization.id, tagId });
      await databaseBuilder.commit();

      // when
      const organizationSaved = await organizationRepository.update(organization);

      // then
      expect(organizationSaved).to.be.an.instanceof(Organization);
      expect(organizationSaved).to.deep.equal({
        id: organization.id,
        name: 'super orga',
        type: 'SCO',
        logoUrl: 'http://new.logo.url',
        externalId: '999Z527F',
        provinceCode: '999',
        isManagingStudents: true,
        identityProviderForCampaigns: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
        credit: 50,
        email: 'email@example.net',
        documentationUrl: 'https://pix.fr/',
        tags: [{ id: tagId, name: 'orga tag' }],
        formNPSUrl: null,
        organizationInvitations: [],
        showNPS: false,
        showSkills: false,
        archivedAt: null,
        createdBy: userId,
        targetProfileShares: [],
      });
      expect(organizationSaved.tags[0].id).to.be.equal(tagId);
    });

    it('should not add row in table "organizations"', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization({ id: 1 });
      await databaseBuilder.commit();
      const { count: nbOrganizationsBeforeUpdate } = await knex('organizations').count('*').first();

      // when
      await organizationRepository.update(organization);

      // then
      const { count: nbOrganizationsAfterUpdate } = await knex('organizations').count('*').first();
      expect(nbOrganizationsAfterUpdate).to.equal(nbOrganizationsBeforeUpdate);
    });
  });

  describe('#get', function () {
    describe('success management', function () {
      it('should return an organization by provided id', async function () {
        // given
        const superAdminUserId = databaseBuilder.factory.buildUser().id;

        const insertedOrganization = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          name: 'Organization of the dark side',
          logoUrl: 'some logo url',
          credit: 154,
          externalId: '100',
          provinceCode: '75',
          identityProviderForCampaigns: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
          isManagingStudents: 'true',
          email: 'sco.generic.account@example.net',
          documentationUrl: 'https://pix.fr/',
          createdBy: superAdminUserId,
          showNPS: true,
          formNPSUrl: 'https://pix.fr/',
          showSkills: false,
        });

        const tag = databaseBuilder.factory.buildTag({ name: 'SUPER-TAG' });
        databaseBuilder.factory.buildTag({ name: 'OTHER-TAG' });
        databaseBuilder.factory.buildOrganizationTag({ organizationId: insertedOrganization.id, tagId: tag.id });

        await databaseBuilder.commit();

        // when
        const foundOrganization = await organizationRepository.get(insertedOrganization.id);

        // then
        expect(foundOrganization).to.deep.equal({
          id: insertedOrganization.id,
          type: 'SCO',
          name: 'Organization of the dark side',
          logoUrl: 'some logo url',
          credit: 154,
          externalId: '100',
          provinceCode: '75',
          isManagingStudents: true,
          email: 'sco.generic.account@example.net',
          targetProfileShares: [],
          organizationInvitations: [],
          identityProviderForCampaigns: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
          tags: [{ id: tag.id, name: 'SUPER-TAG' }],
          documentationUrl: 'https://pix.fr/',
          createdBy: insertedOrganization.createdBy,
          showNPS: true,
          formNPSUrl: 'https://pix.fr/',
          showSkills: false,
          archivedAt: null,
        });
      });

      it('should return a rejection when organization id is not found', async function () {
        // given
        const nonExistentId = 10083;

        // when
        const error = await catchErr(organizationRepository.get)(nonExistentId);

        // then
        expect(error).to.be.an.instanceof(NotFoundError);
        expect(error.message).to.equal('Not found organization for ID 10083');
      });
    });
  });

  describe('#getIdByCertificationCenterId', function () {
    beforeEach(function () {
      _.map(
        [
          { id: 1, type: 'SCO', name: 'organization 1', externalId: '1234567' },
          { id: 2, type: 'SCO', name: 'organization 2', externalId: '1234568' },
          { id: 3, type: 'SUP', name: 'organization 3', externalId: '1234568' },
          { id: 4, type: 'SCO', name: 'organization 4', externalId: '1234569' },
          { id: 5, type: 'SCO', name: 'organization 5', externalId: '1234569' },
        ],
        (organization) => {
          databaseBuilder.factory.buildOrganization(organization);
        },
      );

      databaseBuilder.factory.buildCertificationCenter({
        id: 10,
        externalId: '1234568',
        type: 'SCO',
      });

      return databaseBuilder.commit();
    });

    it('should return the id of the organization given the certification center id matching the same type', async function () {
      // when
      const organisationId = await organizationRepository.getIdByCertificationCenterId(10);

      // then
      expect(organisationId).to.equal(2);
    });

    it('should throw an error if the id does not match a certification center with organization', async function () {
      // when
      const error = await catchErr(organizationRepository.getIdByCertificationCenterId)(123456);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('Not found organization for certification center id 123456');
    });
  });

  describe('#getScoOrganizationByExternalId', function () {
    describe('when there is an organization with given externalId', function () {
      it('should return the organization', async function () {
        // given
        databaseBuilder.factory.buildOrganization({
          id: 1,
          type: 'SCO',
          name: 'organization 1',
          externalId: '1234567',
          isManagingStudents: true,
        });
        await databaseBuilder.commit();

        // when
        const result = await organizationRepository.getScoOrganizationByExternalId('1234567');

        // then
        expect(result).to.be.instanceOf(Organization);
        expect(result.id).to.deep.equal(1);
        expect(result.type).to.deep.equal('SCO');
        expect(result.externalId).to.deep.equal('1234567');
        expect(result.isManagingStudents).to.deep.equal(true);
      });
    });

    describe('when there is no organization with given externalId', function () {
      it('should throw an error if the externalId does not match an organization ', async function () {
        // given
        databaseBuilder.factory.buildOrganization({
          id: 1,
          type: 'SCO',
          name: 'organization 1',
          externalId: '1234567',
          isManagingStudents: true,
        });
        await databaseBuilder.commit();

        // when
        const error = await catchErr(organizationRepository.getScoOrganizationByExternalId)('AAAAAA');

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal('Could not find organization for externalId AAAAAA.');
      });
    });
  });

  describe('#findByExternalIdsFetchingIdsOnly', function () {
    let organizations;

    beforeEach(async function () {
      organizations = _.map(
        [
          { type: 'PRO', name: 'organization 1', externalId: '1234567' },
          { type: 'SCO', name: 'organization 2', externalId: '1234568' },
          { type: 'SUP', name: 'organization 3', externalId: '1234569' },
        ],
        (organization) => {
          return databaseBuilder.factory.buildOrganization(organization);
        },
      );

      await databaseBuilder.commit();
    });

    it('should return the organizations that matches the filters', async function () {
      // given
      const externalIds = ['1234567', '1234569'];

      // when
      const foundOrganizations = await organizationRepository.findByExternalIdsFetchingIdsOnly(externalIds);

      // then
      expect(foundOrganizations).to.have.lengthOf(2);
      expect(foundOrganizations[0]).to.be.an.instanceof(Organization);
      expect(foundOrganizations[0].externalId).to.equal(organizations[0].externalId);
      expect(foundOrganizations[1].externalId).to.equal(organizations[2].externalId);
    });

    it('should only return id and externalId', async function () {
      // given
      const externalIds = ['1234567'];

      // when
      const foundOrganizations = await organizationRepository.findByExternalIdsFetchingIdsOnly(externalIds);

      // then
      expect(foundOrganizations[0].externalId).to.equal(organizations[0].externalId);
      expect(foundOrganizations[0].id).to.equal(organizations[0].id);
      expect(foundOrganizations[0].type).to.be.undefined;
    });
  });

  describe('#findScoOrganizationsByUai', function () {
    let organizations;

    beforeEach(async function () {
      organizations = _.map(
        [
          { type: 'PRO', name: 'organization 1', externalId: '1234567', email: null },
          {
            type: 'SCO',
            name: 'organization 2',
            externalId: '1234568',
            email: 'sco.generic.account@example.net',
            archivedAt: new Date(),
          },
          { type: 'SUP', name: 'organization 3', externalId: '1234569', email: null },
          {
            type: 'SCO',
            name: 'organization 4',
            externalId: '0595401A',
            email: 'sco2.generic.account@example.net',
            archivedAt: null,
          },
          { type: 'SCO', name: 'organization 5', externalId: '0587996a', email: 'sco3.generic.account@example.net' },
          { type: 'SCO', name: 'organization 6', externalId: '058799Aa', email: 'sco4.generic.account@example.net' },
        ],
        (organization) => {
          return databaseBuilder.factory.buildOrganization(organization);
        },
      );

      await databaseBuilder.commit();
    });

    it('should return external identifier and email for SCO organizations matching given UAI', async function () {
      // given
      const uai = '1234568';
      const organizationSCO = organizations[1];

      // when
      const foundOrganization = await organizationRepository.findScoOrganizationsByUai({ uai });

      // then
      expect(foundOrganization).to.have.lengthOf(1);
      expect(foundOrganization[0]).to.be.an.instanceof(Organization);
      expect(foundOrganization[0].externalId).to.equal(organizationSCO.externalId);
      expect(foundOrganization[0].type).to.equal(organizationSCO.type);
      expect(foundOrganization[0].email).to.equal(organizationSCO.email);
    });

    it('should return external identifier for SCO organizations matching given UAI with lower case', async function () {
      // given
      const uai = '0595401a';
      const organizationSCO = organizations[3];

      // when
      const foundOrganization = await organizationRepository.findScoOrganizationsByUai({ uai });

      // then
      expect(foundOrganization).to.have.lengthOf(1);
      expect(foundOrganization[0]).to.be.an.instanceof(Organization);
      expect(foundOrganization[0].externalId).to.equal(organizationSCO.externalId);
      expect(foundOrganization[0].type).to.equal(organizationSCO.type);
      expect(foundOrganization[0].email).to.equal(organizationSCO.email);
    });

    it('should return external identifier for SCO organizations matching given UAI with Upper case', async function () {
      // given
      const uai = '0587996A';
      const organizationSCO = organizations[4];

      // when
      const foundOrganization = await organizationRepository.findScoOrganizationsByUai({ uai });

      // then
      expect(foundOrganization).to.have.lengthOf(1);
      expect(foundOrganization[0]).to.be.an.instanceof(Organization);
      expect(foundOrganization[0].externalId).to.equal(organizationSCO.externalId);
      expect(foundOrganization[0].type).to.equal(organizationSCO.type);
      expect(foundOrganization[0].email).to.equal(organizationSCO.email);
    });

    it('should return external identifier for SCO organizations matching given UAI with Upper and lower case', async function () {
      // given
      const uai = '058799Aa';
      const organizationSCO = organizations[5];

      // when
      const foundOrganization = await organizationRepository.findScoOrganizationsByUai({ uai });

      // then
      expect(foundOrganization).to.have.lengthOf(1);
      expect(foundOrganization[0]).to.be.an.instanceof(Organization);
      expect(foundOrganization[0].externalId).to.equal(organizationSCO.externalId);
      expect(foundOrganization[0].type).to.equal(organizationSCO.type);
      expect(foundOrganization[0].email).to.equal(organizationSCO.email);
    });

    it('should return external identifier for SCO organizations matching given UAI with lower and upper case', async function () {
      // given
      const uai = '058799aA';
      const organizationSCO = organizations[5];

      // when
      const foundOrganization = await organizationRepository.findScoOrganizationsByUai({ uai });

      // then
      expect(foundOrganization).to.have.lengthOf(1);
      expect(foundOrganization[0]).to.be.an.instanceof(Organization);
      expect(foundOrganization[0].externalId).to.equal(organizationSCO.externalId);
      expect(foundOrganization[0].type).to.equal(organizationSCO.type);
      expect(foundOrganization[0].email).to.equal(organizationSCO.email);
    });

    it('should return archivedAt null value', async function () {
      // given
      const uai = '0595401A';

      // when
      const foundOrganization = await organizationRepository.findScoOrganizationsByUai({ uai });

      // then
      expect(foundOrganization[0].archivedAt).to.deep.equal(null);
    });

    context('when organization is archived', function () {
      it('should return archivedAt attribute', async function () {
        // given
        const uai = '1234568';
        const organizationSCO = organizations[1];

        // when
        const foundOrganization = await organizationRepository.findScoOrganizationsByUai({ uai });

        // then
        expect(foundOrganization[0].archivedAt).to.deep.equal(organizationSCO.archivedAt);
      });
    });
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
        const { models: matchingOrganizations, pagination } = await organizationRepository.findPaginatedFiltered({
          filter,
          page,
        });

        // then
        expect(matchingOrganizations).to.exist;
        expect(matchingOrganizations).to.have.lengthOf(3);
        expect(matchingOrganizations[0]).to.be.an.instanceOf(Organization);
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
        const { models: matchingOrganizations, pagination } = await organizationRepository.findPaginatedFiltered({
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
        const { models: matchingOrganizations, pagination } = await organizationRepository.findPaginatedFiltered({
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
        const { models: matchingOrganizations, pagination } = await organizationRepository.findPaginatedFiltered({
          filter,
          page,
        });

        // then
        expect(matchingOrganizations).to.have.lengthOf(2);
        expect(_.map(matchingOrganizations, 'name')).to.have.members(['Dragon & co', 'Dragonades & co']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are multiple Organizations matching the same "type" search pattern', function () {
      beforeEach(function () {
        databaseBuilder.factory.buildOrganization({ type: 'PRO' });
        databaseBuilder.factory.buildOrganization({ type: 'PRO' });
        databaseBuilder.factory.buildOrganization({ type: 'SUP' });
        databaseBuilder.factory.buildOrganization({ type: 'SCO' });
        return databaseBuilder.commit();
      });

      it('should return only Organizations matching "type" if given in filters', async function () {
        // given
        const filter = { type: 'S' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingOrganizations, pagination } = await organizationRepository.findPaginatedFiltered({
          filter,
          page,
        });

        // then
        expect(_.map(matchingOrganizations, 'type')).to.have.members(['SUP', 'SCO']);
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
        const { models: matchingOrganizations, pagination } = await organizationRepository.findPaginatedFiltered({
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
          const { models: matchingOrganizations, pagination } = await organizationRepository.findPaginatedFiltered({
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
        const { models: matchingOrganizations, pagination } = await organizationRepository.findPaginatedFiltered({
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
        const { models: matchingOrganizations, pagination } = await organizationRepository.findPaginatedFiltered({
          filter,
          page,
        });

        // then
        expect(_.map(matchingOrganizations, 'archivedAt')).to.have.members([null]);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });
  });

  describe('#findPaginatedFilteredByTargetProfile', function () {
    let targetProfileId;

    beforeEach(function () {
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      return databaseBuilder.commit();
    });

    context('when there are organizations linked to the target profile', function () {
      beforeEach(function () {
        _.times(2, () => {
          const organizationId = databaseBuilder.factory.buildOrganization().id;
          databaseBuilder.factory.buildTargetProfileShare({ organizationId, targetProfileId });
        });
        return databaseBuilder.commit();
      });

      it('should return an Array of Organizations', async function () {
        // given
        const filter = {};
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingOrganizations, pagination } =
          await organizationRepository.findPaginatedFilteredByTargetProfile({ targetProfileId, filter, page });

        // then
        expect(matchingOrganizations).to.exist;
        expect(matchingOrganizations).to.have.lengthOf(2);
        expect(matchingOrganizations[0]).to.be.an.instanceOf(Organization);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are lots of organizations (> 10) linked to the target profile', function () {
      beforeEach(function () {
        _.times(12, () => {
          const organizationId = databaseBuilder.factory.buildOrganization().id;
          databaseBuilder.factory.buildTargetProfileShare({ organizationId, targetProfileId });
        });
        return databaseBuilder.commit();
      });

      it('should return paginated matching Organizations', async function () {
        // given
        const filter = {};
        const page = { number: 1, size: 3 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 4, rowCount: 12 };

        // when
        const { models: matchingOrganizations, pagination } =
          await organizationRepository.findPaginatedFilteredByTargetProfile({ targetProfileId, filter, page });

        // then
        expect(matchingOrganizations).to.have.lengthOf(3);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there is a filter on "id"', function () {
      beforeEach(function () {
        const organizationId1 = databaseBuilder.factory.buildOrganization({ id: 123 }).id;
        const organizationId2 = databaseBuilder.factory.buildOrganization({ id: 456 }).id;
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId1, targetProfileId });
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId2, targetProfileId });
        return databaseBuilder.commit();
      });

      it('should return only organizations matching "id"', async function () {
        // given
        const filter = { id: 456 };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 1 };

        // when
        const { models: matchingOrganizations, pagination } =
          await organizationRepository.findPaginatedFilteredByTargetProfile({ targetProfileId, filter, page });

        // then
        expect(matchingOrganizations).to.have.lengthOf(1);
        expect(matchingOrganizations[0].id).to.equal(456);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are some filter on "name"', function () {
      beforeEach(function () {
        const organizationId1 = databaseBuilder.factory.buildOrganization({ name: 'Dragon & co' }).id;
        const organizationId2 = databaseBuilder.factory.buildOrganization({ name: 'Broca & co' }).id;
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId1, targetProfileId });
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId2, targetProfileId });
        return databaseBuilder.commit();
      });

      it('should return only organizations matching "name"', async function () {
        // given
        const filter = { name: 'dra' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 1 };

        // when
        const { models: matchingOrganizations, pagination } =
          await organizationRepository.findPaginatedFilteredByTargetProfile({ targetProfileId, filter, page });

        // then
        expect(matchingOrganizations).to.have.lengthOf(1);
        expect(_.map(matchingOrganizations, 'name')).to.have.members(['Dragon & co']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are some filter on "type"', function () {
      beforeEach(function () {
        const organizationId1 = databaseBuilder.factory.buildOrganization({ type: 'PRO' }).id;
        const organizationId2 = databaseBuilder.factory.buildOrganization({ type: 'SUP' }).id;
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId1, targetProfileId });
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId2, targetProfileId });
        return databaseBuilder.commit();
      });

      it('should return only organizations matching "type"', async function () {
        // given
        const filter = { type: 'S' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 1 };

        // when
        const { models: matchingOrganizations, pagination } =
          await organizationRepository.findPaginatedFilteredByTargetProfile({ targetProfileId, filter, page });

        // then
        expect(_.map(matchingOrganizations, 'type')).to.have.members(['SUP']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are some filter on "externalId"', function () {
      beforeEach(function () {
        const organizationId1 = databaseBuilder.factory.buildOrganization({ externalId: '1234567A' }).id;
        const organizationId2 = databaseBuilder.factory.buildOrganization({ externalId: '1234567B' }).id;
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId1, targetProfileId });
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId2, targetProfileId });
        return databaseBuilder.commit();
      });

      it('should return only organizations matching "externalId"', async function () {
        // given
        const filter = { externalId: 'a' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 1 };

        // when
        const { models: matchingOrganizations, pagination } =
          await organizationRepository.findPaginatedFilteredByTargetProfile({ targetProfileId, filter, page });

        // then
        expect(_.map(matchingOrganizations, 'externalId')).to.have.members(['1234567A']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are some filters on "name", "type" and "externalId"', function () {
      beforeEach(function () {
        // Matching organizations
        const organizationId1 = databaseBuilder.factory.buildOrganization({
          name: 'name_ok_1',
          type: 'SCO',
          externalId: '1234567A',
        }).id;
        const organizationId2 = databaseBuilder.factory.buildOrganization({
          name: 'name_ok_2',
          type: 'SCO',
          externalId: '1234568A',
        }).id;
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId1, targetProfileId });
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId2, targetProfileId });

        // Unmatching organizations
        const organizationId3 = databaseBuilder.factory.buildOrganization({
          name: 'name_ko_3',
          type: 'SCO',
          externalId: '1234567A',
        }).id;
        const organizationId4 = databaseBuilder.factory.buildOrganization({
          name: 'name_ok_4',
          type: 'SCO',
          externalId: '1234567B',
        }).id;
        const organizationId5 = databaseBuilder.factory.buildOrganization({
          name: 'name_ok_5',
          type: 'SUP',
          externalId: '1234567A',
        }).id;
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId3, targetProfileId });
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId4, targetProfileId });
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId5, targetProfileId });

        return databaseBuilder.commit();
      });

      it('should return only Organizations matching "name" AND "type" "AND" "externalId" if given in filters', async function () {
        // given
        const filter = { name: 'name_ok', type: 'SCO', externalId: 'a' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingOrganizations, pagination } =
          await organizationRepository.findPaginatedFilteredByTargetProfile({
            targetProfileId,
            filter,
            page,
          });

        // then
        expect(_.map(matchingOrganizations, 'name')).to.have.members(['name_ok_1', 'name_ok_2']);
        expect(_.map(matchingOrganizations, 'type')).to.have.members(['SCO', 'SCO']);
        expect(_.map(matchingOrganizations, 'externalId')).to.have.members(['1234567A', '1234568A']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are filters that should be ignored', function () {
      beforeEach(function () {
        const organizationId1 = databaseBuilder.factory.buildOrganization({ provinceCode: 'ABC' }).id;
        const organizationId2 = databaseBuilder.factory.buildOrganization({ provinceCode: 'DEF' }).id;
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId1, targetProfileId });
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId2, targetProfileId });
        return databaseBuilder.commit();
      });

      it('should ignore the filters and retrieve all organizations', async function () {
        // given
        const filter = { provinceCode: 'DEF' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingOrganizations, pagination } =
          await organizationRepository.findPaginatedFilteredByTargetProfile({ targetProfileId, filter, page });

        // then
        expect(_.map(matchingOrganizations, 'provinceCode')).to.have.members(['ABC', 'DEF']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });
  });

  describe('#batchCreateOrganizations', function () {
    let computeOrganizationLearnerCertificabilityId;
    beforeEach(async function () {
      computeOrganizationLearnerCertificabilityId = databaseBuilder.factory.buildFeature(
        ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY,
      ).id;
      await databaseBuilder.commit();
    });

    it('should add rows in the table "organizations"', async function () {
      // given
      const organization1 = domainBuilder.buildOrganizationForAdmin();
      const organization2 = domainBuilder.buildOrganizationForAdmin();

      // when
      await organizationRepository.batchCreateOrganizations([organization1, organization2]);

      // then
      const foundOrganizations = await knex('organizations').select();
      expect(foundOrganizations.length).to.equal(2);
    });

    it('should save organization attributes', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      const organization = domainBuilder.buildOrganizationForAdmin({
        id: null,
        externalId: '1237457A',
        name: 'Orga 1',
        provinceCode: '12',
        credit: 100,
        createdBy: userId,
        documentationUrl: 'http://example.net/',
      });

      // when
      await organizationRepository.batchCreateOrganizations([organization]);

      // then
      const foundOrganizations = await knex('organizations').select();
      expect(foundOrganizations[0].id).to.not.be.undefined;
      expect(foundOrganizations[0].name).to.equal(organization.name);
      expect(foundOrganizations[0].externalId).to.equal(organization.externalId);
      expect(foundOrganizations[0].provinceCode).to.equal(organization.provinceCode);
      expect(foundOrganizations[0].createdBy).to.equal(organization.createdBy);
      expect(foundOrganizations[0].documentationUrl).to.equal(organization.documentationUrl);
    });

    it('should enable compute organization learner certificability feature for sco organization managing students', async function () {
      // given
      const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;
      await databaseBuilder.commit();
      const otherOrganization = new OrganizationForAdmin({
        name: 'other organization',
        type: 'SUP',
        isManagingStudents: false,
        createdBy: superAdminUserId,
      });
      const organizationScoManagingStudent = new OrganizationForAdmin({
        name: 'Organization SCO',
        type: 'SCO',
        isManagingStudents: true,
        createdBy: superAdminUserId,
      });

      organizationScoManagingStudent.features[ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key] =
        organizationScoManagingStudent.isManagingStudents;

      // when
      await organizationRepository.batchCreateOrganizations([organizationScoManagingStudent, otherOrganization]);

      const savedOrganizationFeatures = await knex('organization-features');

      // then
      expect(savedOrganizationFeatures.length).to.equal(1);
      expect(savedOrganizationFeatures[0].featureId).to.equal(computeOrganizationLearnerCertificabilityId);
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
        const children = await organizationRepository.findChildrenByParentOrganizationId(parentOrganizationId);

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
        const children = await organizationRepository.findChildrenByParentOrganizationId(parentOrganizationId);

        // then
        expect(children.length).to.be.greaterThanOrEqual(1);
        expect(children[0]).to.be.instanceOf(Organization);
        expect(_.map(children, 'name')).to.have.members(['First Child']);
      });
    });
  });
});
