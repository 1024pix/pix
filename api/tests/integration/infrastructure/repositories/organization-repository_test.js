const { expect, knex, domainBuilder, databaseBuilder } = require('../../../test-helper');
const Organization = require('../../../../lib/domain/models/Organization');
const BookshelfOrganization = require('../../../../lib/infrastructure/data/organization');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const _ = require('lodash');

describe('Integration | Repository | Organization', function() {

  describe('#create', () => {

    afterEach(async () => {
      await knex('organizations').delete();
    });

    it('should return an Organization domain object', async () => {
      // given
      const organization = domainBuilder.buildOrganization();

      // when
      const organizationSaved = await organizationRepository.create(organization);

      // then
      expect(organizationSaved).to.be.an.instanceof(Organization);
    });

    it('should add a row in the table "organizations"', async () => {
      // given
      const nbOrganizationsBeforeCreation = await BookshelfOrganization.count();

      // when
      await organizationRepository.create(domainBuilder.buildOrganization());

      // then
      const nbOrganizationsAfterCreation = await BookshelfOrganization.count();
      expect(nbOrganizationsAfterCreation).to.equal(nbOrganizationsBeforeCreation + 1);
    });

    it('should save model properties', async () => {
      // given
      const organization = domainBuilder.buildOrganization({ id: null });

      // when
      const organizationSaved = await organizationRepository.create(organization);

      // then
      expect(organizationSaved.id).to.not.be.undefined;
      expect(organizationSaved.name).to.equal(organization.name);
      expect(organizationSaved.type).to.equal(organization.type);
      expect(organizationSaved.logoUrl).to.equal(organization.logoUrl);
      expect(organizationSaved.externalId).to.equal(organization.externalId);
      expect(organizationSaved.provinceCode).to.equal(organization.provinceCode);
    });
  });

  describe('#update', () => {
    let organization;

    beforeEach(async () => {
      const bookshelfOrganization = databaseBuilder.factory.buildOrganization({ id: 1 });
      organization = domainBuilder.buildOrganization(bookshelfOrganization);
      await databaseBuilder.commit();
    });

    it('should return an Organization domain object', async () => {
      // when
      const organizationSaved = await organizationRepository.update(organization);

      // then
      expect(organizationSaved).to.be.an.instanceof(Organization);
    });

    it('should not add row in table "organizations"', async () => {
      // given
      const nbOrganizationsBeforeUpdate = await BookshelfOrganization.count();

      // when
      await organizationRepository.update(organization);

      // then
      const nbOrganizationsAfterUpdate = await BookshelfOrganization.count();
      expect(nbOrganizationsAfterUpdate).to.equal(nbOrganizationsBeforeUpdate);
    });

    it('should update model in database', async () => {
      // given
      organization.name = 'New name';
      organization.type = 'SCO';
      organization.logoUrl = 'http://new.logo.url';
      organization.externalId = '999Z527F';
      organization.provinceCode = '999';
      organization.isManagingStudents = true;

      // when
      const organizationSaved = await organizationRepository.update(organization);

      // then
      expect(organizationSaved.id).to.equal(organization.id);
      expect(organizationSaved.name).to.equal('New name');
      expect(organizationSaved.type).to.equal('SCO');
      expect(organizationSaved.logoUrl).to.equal('http://new.logo.url');
      expect(organizationSaved.externalId).to.equal(organization.externalId);
      expect(organizationSaved.provinceCode).to.equal(organization.provinceCode);
      expect(organizationSaved.isManagingStudents).to.equal(organization.isManagingStudents);
    });
  });

  describe('#get', () => {

    describe('success management', function() {

      let insertedOrganization;
      const organizationAttributes = {
        type: 'SCO',
        name: 'Organization of the dark side',
        logoUrl: 'some logo url',
        credit: 154,
        externalId: '100',
        provinceCode: '75',
        isManagingStudents: 'true',
        canCollectProfiles: 'true',
        email: 'sco.generic.account@example.net'
      };

      let expectedAttributes;

      beforeEach(async () => {
        insertedOrganization = databaseBuilder.factory.buildOrganization(organizationAttributes);
        expectedAttributes = {
          id:  insertedOrganization.id,
          type: 'SCO',
          name: 'Organization of the dark side',
          logoUrl: 'some logo url',
          credit: 154,
          externalId: '100',
          provinceCode: '75',
          isManagingStudents: true,
          canCollectProfiles: true,
          email: 'sco.generic.account@example.net',
          members: [],
          memberships: [],
          students: [],
          targetProfileShares: [],
          organizationInvitations: []
        };
        await databaseBuilder.commit();
      });

      it('should return a organization by provided id', async () => {
        // when
        const foundOrganization = await organizationRepository.get(insertedOrganization.id);

        // then
        expect(foundOrganization).to.deep.equal(expectedAttributes);
      });

      it('should return a rejection when organization id is not found', function() {
        // given
        const nonExistentId = 10083;

        // when
        const promise = organizationRepository.get(nonExistentId);

        // then
        return promise.then(() => {
          expect.fail('Treatment did not throw an error as expected', 'Expected a "NotFoundError" to have been throwed');
        }).catch((err) => {
          expect(err.message).to.equal('Not found organization for ID 10083');
        });
      });
    });

    describe('when a target profile is shared with the organisation', () => {

      let insertedOrganization;
      let sharedProfile;

      beforeEach(async () => {
        insertedOrganization = databaseBuilder.factory.buildOrganization();
        sharedProfile = databaseBuilder.factory.buildTargetProfile({
          isPublic: false
        });
        databaseBuilder.factory.buildTargetProfileShare({
          organizationId: insertedOrganization.id,
          targetProfileId: sharedProfile.id,
        });

        await databaseBuilder.commit();
      });

      it('should return a list of profile containing the shared profile', async () => {
        // when
        const organization = await organizationRepository.get(insertedOrganization.id);

        // then
        const firstTargetProfileShare = organization.targetProfileShares[0];
        expect(firstTargetProfileShare.targetProfileId).to.deep.equal(sharedProfile.id);
        expect(firstTargetProfileShare.organizationId).to.deep.equal(insertedOrganization.id);

        expect(firstTargetProfileShare.targetProfile).to.deep.equal(sharedProfile);
      });
    });

    context('when organization have memberships', () => {

      it('should return a list of active members', async () => {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;

        const membershipActive = {
          organizationId,
          userId: databaseBuilder.factory.buildUser().id
        };
        const membershipDisabled = {
          organizationId,
          userId: databaseBuilder.factory.buildUser().id,
          disabledAt: new Date(),
        };
        databaseBuilder.factory.buildMembership(membershipActive);
        databaseBuilder.factory.buildMembership(membershipDisabled);

        await databaseBuilder.commit();

        // when
        const foundOrganization = await organizationRepository.get(organizationId);

        // then
        expect(foundOrganization.members).to.have.lengthOf(1);
        expect(foundOrganization.members[0].id).to.deep.equal(membershipActive.userId);
      });
    });
  });

  describe('#findByExternalIdsFetchingIdsOnly', () => {
    let organizations;

    beforeEach(async () => {
      organizations = _.map([
        { type: 'PRO', name: 'organization 1', externalId: '1234567' },
        { type: 'SCO', name: 'organization 2', externalId: '1234568' },
        { type: 'SUP', name: 'organization 3', externalId: '1234569' },
      ], (organization) => {
        return databaseBuilder.factory.buildOrganization(organization);
      });

      await databaseBuilder.commit();
    });

    it('should return the organizations that matches the filters', async () => {
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

    it('should only return id and externalId', async () => {
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

  describe('#findScoOrganizationByUai', () => {
    let organizations;

    beforeEach(async () => {
      organizations = _.map([
        { type: 'PRO', name: 'organization 1', externalId: '1234567', email: null },
        { type: 'SCO', name: 'organization 2', externalId: '1234568', email: 'sco.generic.account@example.net' },
        { type: 'SUP', name: 'organization 3', externalId: '1234569', email: null },
      ], (organization) => {
        return databaseBuilder.factory.buildOrganization(organization);
      });

      await databaseBuilder.commit();
    });

    it('should return external identifier and email for SCO organizations matching given UAI', async () => {
      // given
      const uai = '1234568';
      const organizationSCO = organizations[1];

      // when
      const foundOrganization = await organizationRepository.findScoOrganizationByUai(uai);

      // then
      expect(foundOrganization).to.have.lengthOf(1);
      expect(foundOrganization[0]).to.be.an.instanceof(Organization);
      expect(foundOrganization[0].externalId).to.equal(organizationSCO.externalId);
      expect(foundOrganization[0].type).to.equal(organizationSCO.type);
      expect(foundOrganization[0].email).to.equal(organizationSCO.email);
    });
  });

  describe('#findPaginatedFiltered', () => {

    context('when there are Organizations in the database', () => {

      beforeEach(() => {
        _.times(3, databaseBuilder.factory.buildOrganization);
        return databaseBuilder.commit();
      });

      it('should return an Array of Organizations', async () => {
        // given
        const filter = {};
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 3 };

        // when
        const { models: matchingOrganizations, pagination } = await organizationRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(matchingOrganizations).to.exist;
        expect(matchingOrganizations).to.have.lengthOf(3);
        expect(matchingOrganizations[0]).to.be.an.instanceOf(Organization);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are lots of Organizations (> 10) in the database', () => {

      beforeEach(() => {
        _.times(12, databaseBuilder.factory.buildOrganization);
        return databaseBuilder.commit();
      });

      it('should return paginated matching Organizations', async () => {
        // given
        const filter = {};
        const page = { number: 1, size: 3 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 4, rowCount: 12 };

        // when
        const { models: matchingOrganizations, pagination } = await organizationRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(matchingOrganizations).to.have.lengthOf(3);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are multiple Organizations matching the same "name" search pattern', () => {

      beforeEach(() => {
        databaseBuilder.factory.buildOrganization({ name: 'Dragon & co' });
        databaseBuilder.factory.buildOrganization({ name: 'Dragonades & co' });
        databaseBuilder.factory.buildOrganization({ name: 'Broca & co' });
        databaseBuilder.factory.buildOrganization({ name: 'Donnie & co' });
        return databaseBuilder.commit();
      });

      it('should return only Organizations matching "name" if given in filters', async () => {
        // given
        const filter = { name: 'dra' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingOrganizations, pagination } = await organizationRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(matchingOrganizations).to.have.lengthOf(2);
        expect(_.map(matchingOrganizations, 'name')).to.have.members(['Dragon & co', 'Dragonades & co']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are multiple Organizations matching the same "type" search pattern', () => {

      beforeEach(() => {
        databaseBuilder.factory.buildOrganization({ type: 'PRO' });
        databaseBuilder.factory.buildOrganization({ type: 'PRO' });
        databaseBuilder.factory.buildOrganization({ type: 'SUP' });
        databaseBuilder.factory.buildOrganization({ type: 'SCO' });
        return databaseBuilder.commit();
      });

      it('should return only Organizations matching "type" if given in filters', async () => {
        // given
        const filter = { type: 'S' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingOrganizations, pagination } = await organizationRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(_.map(matchingOrganizations, 'type')).to.have.members(['SUP', 'SCO']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are multiple Organizations matching the same "externalId" search pattern', () => {

      beforeEach(() => {
        databaseBuilder.factory.buildOrganization({ externalId: '1234567A' });
        databaseBuilder.factory.buildOrganization({ externalId: '1234567B' });
        databaseBuilder.factory.buildOrganization({ externalId: '1234567C' });
        databaseBuilder.factory.buildOrganization({ externalId: '123456AD' });
        return databaseBuilder.commit();
      });

      it('should return only Organizations matching "externalId" if given in filters', async () => {
        // given
        const filter = { externalId: 'a' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingOrganizations, pagination } = await organizationRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(_.map(matchingOrganizations, 'externalId')).to.have.members(['1234567A', '123456AD']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are multiple Organizations matching the fields "name", "type" and "externalId" search pattern', () => {

      beforeEach(() => {
        // Matching organizations
        databaseBuilder.factory.buildOrganization({ name: 'name_ok_1', type: 'SCO', externalId: '1234567A' });
        databaseBuilder.factory.buildOrganization({ name: 'name_ok_2', type: 'SCO', externalId: '1234568A' });
        databaseBuilder.factory.buildOrganization({ name: 'name_ok_3', type: 'SCO', externalId: '1234569A' });

        // Unmatching organizations
        databaseBuilder.factory.buildOrganization({ name: 'name_ko_4', type: 'SCO', externalId: '1234567B' });
        databaseBuilder.factory.buildOrganization({ name: 'name_ok_5', type: 'SUP', externalId: '1234567C' });

        return databaseBuilder.commit();
      });

      it('should return only Organizations matching "name" AND "type" "AND" "externalId" if given in filters', async () => {
        // given
        const filter = { name: 'name_ok', type: 'SCO', externalId: 'a' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 3 };

        // when
        const { models: matchingOrganizations, pagination } = await organizationRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(_.map(matchingOrganizations, 'name')).to.have.members(['name_ok_1', 'name_ok_2', 'name_ok_3']);
        expect(_.map(matchingOrganizations, 'type')).to.have.members(['SCO', 'SCO', 'SCO']);
        expect(_.map(matchingOrganizations, 'externalId')).to.have.members(['1234567A', '1234568A', '1234569A']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are filters that should be ignored', () => {

      beforeEach(() => {
        databaseBuilder.factory.buildOrganization({ id: 1 });
        databaseBuilder.factory.buildOrganization({ id: 2 });

        return databaseBuilder.commit();
      });

      it('should ignore the filters and retrieve all organizations', async () => {
        // given
        const filter = { id: 1 };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingOrganizations, pagination } = await organizationRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(_.map(matchingOrganizations, 'id')).to.have.members([1, 2]);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });
  });
});
