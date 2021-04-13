const { catchErr, expect, knex, domainBuilder, databaseBuilder } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const Organization = require('../../../../lib/domain/models/Organization');
const BookshelfOrganization = require('../../../../lib/infrastructure/data/organization');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const _ = require('lodash');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');

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

    it('should insert default value for canCollectProfiles (false), credit (0) when not defined', async () => {
      // given
      const organization = new Organization({
        name: 'organization',
        externalId: 'b400',
        type: 'PRO',
      });

      // when
      const organizationSaved = await organizationRepository.create(organization);

      // then
      expect(organizationSaved.canCollectProfiles).to.equal(Organization.defaultValues['canCollectProfiles']);
      expect(organizationSaved.credit).to.equal(Organization.defaultValues['credit']);
      expect(organizationSaved.email).to.be.null;
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
      organization.canCollectProfiles = true;
      organization.credit = 50;
      organization.email = 'email@example.net';

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
      expect(organizationSaved.canCollectProfiles).to.equal(organization.canCollectProfiles);
      expect(organizationSaved.credit).to.equal(organization.credit);
      expect(organizationSaved.email).to.equal(organization.email);
    });
  });

  describe('#get', () => {

    describe('success management', function() {

      const organizationAttributes = {
        type: 'SCO',
        name: 'Organization of the dark side',
        logoUrl: 'some logo url',
        credit: 154,
        externalId: '100',
        provinceCode: '75',
        isManagingStudents: 'true',
        canCollectProfiles: 'true',
        email: 'sco.generic.account@example.net',
      };

      let expectedAttributes;
      let insertedOrganization;

      beforeEach(async () => {
        insertedOrganization = databaseBuilder.factory.buildOrganization(organizationAttributes);
        expectedAttributes = {
          id: insertedOrganization.id,
          type: 'SCO',
          name: 'Organization of the dark side',
          logoUrl: 'some logo url',
          credit: 154,
          externalId: '100',
          provinceCode: '75',
          isManagingStudents: true,
          canCollectProfiles: true,
          email: 'sco.generic.account@example.net',
          students: [],
          targetProfileShares: [],
          organizationInvitations: [],
          tags: [],
        };
        await databaseBuilder.commit();
      });

      it('should return a organization by provided id', async () => {
        // when
        const foundOrganization = await DomainTransaction.execute(async (domainTransaction) =>
          organizationRepository.get(insertedOrganization.id, domainTransaction),
        );

        // then
        expect(foundOrganization).to.deep.equal(expectedAttributes);
      });

      it('should return a rejection when organization id is not found', function() {
        // given
        const nonExistentId = 10083;

        // when
        const promise = DomainTransaction.execute(async (domainTransaction) =>
          organizationRepository.get(nonExistentId, domainTransaction),
        );

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
          isPublic: false,
        });
        databaseBuilder.factory.buildTargetProfileShare({
          organizationId: insertedOrganization.id,
          targetProfileId: sharedProfile.id,
        });

        await databaseBuilder.commit();
      });

      it('should return a list of profile containing the shared profile', async () => {
        // when
        const organization = await DomainTransaction.execute(async (domainTransaction) =>
          organizationRepository.get(insertedOrganization.id, domainTransaction),
        );

        // then
        const firstTargetProfileShare = organization.targetProfileShares[0];
        expect(firstTargetProfileShare.targetProfileId).to.deep.equal(sharedProfile.id);
        expect(firstTargetProfileShare.organizationId).to.deep.equal(insertedOrganization.id);

        expect(firstTargetProfileShare.targetProfile).to.deep.equal(sharedProfile);
      });
    });
  });

  describe('#getIdByCertificationCenterId', () => {
    let organizations;
    let organization;
    let certificationCenterId;

    beforeEach(async () => {
      organizations = _.map([
        { id: 1, type: 'SCO', name: 'organization 1', externalId: '1234567' },
        { id: 2, type: 'SCO', name: 'organization 2', externalId: '1234568' },
        { id: 3, type: 'SCO', name: 'organization 3', externalId: '1234569' },
      ], (organization) => {
        return databaseBuilder.factory.buildOrganization(organization);
      });

      organization = organizations[1];

      certificationCenterId = databaseBuilder.factory
        .buildCertificationCenter({ externalId: organization.externalId })
        .id;

      await databaseBuilder.commit();
    });

    it('should return the id of the organization given the certification center id', async () => {
      // when
      const organisationId = await organizationRepository.getIdByCertificationCenterId(certificationCenterId);

      // then
      expect(organisationId).to.equal(organization.id);
    });

    it('should throw an error if the id does not match an certification center with organization ', async () => {
      // given
      const wrongCertificationCenterId = '666';

      // when
      const error = await catchErr(organizationRepository.getIdByCertificationCenterId)(wrongCertificationCenterId);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('Not found organization for certification center id 666');
    });
  });

  describe('#getScoOrganizationByExternalId', () => {

    describe('when there is an organization with given externalId', () => {

      it('should return the organization', async () => {
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

    describe('when there is no organization with given externalId', () => {

      it('should throw an error if the externalId does not match an organization ', async () => {
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
        { type: 'SCO', name: 'organization 4', externalId: '0595401A', email: 'sco2.generic.account@example.net' },
        { type: 'SCO', name: 'organization 5', externalId: '0587996a', email: 'sco3.generic.account@example.net' },
        { type: 'SCO', name: 'organization 6', externalId: '058799Aa', email: 'sco4.generic.account@example.net' },
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

    it('should return external identifier for SCO organizations matching given UAI with lower case', async () => {
      // given
      const uai = '0595401a';
      const organizationSCO = organizations[3];

      // when
      const foundOrganization = await organizationRepository.findScoOrganizationByUai(uai);

      // then
      expect(foundOrganization).to.have.lengthOf(1);
      expect(foundOrganization[0]).to.be.an.instanceof(Organization);
      expect(foundOrganization[0].externalId).to.equal(organizationSCO.externalId);
      expect(foundOrganization[0].type).to.equal(organizationSCO.type);
      expect(foundOrganization[0].email).to.equal(organizationSCO.email);
    });

    it('should return external identifier for SCO organizations matching given UAI with Upper case', async () => {
      // given
      const uai = '0587996A';
      const organizationSCO = organizations[4];

      // when
      const foundOrganization = await organizationRepository.findScoOrganizationByUai(uai);

      // then
      expect(foundOrganization).to.have.lengthOf(1);
      expect(foundOrganization[0]).to.be.an.instanceof(Organization);
      expect(foundOrganization[0].externalId).to.equal(organizationSCO.externalId);
      expect(foundOrganization[0].type).to.equal(organizationSCO.type);
      expect(foundOrganization[0].email).to.equal(organizationSCO.email);
    });

    it('should return external identifier for SCO organizations matching given UAI with Upper and lower case', async () => {
      // given
      const uai = '058799Aa';
      const organizationSCO = organizations[5];

      // when
      const foundOrganization = await organizationRepository.findScoOrganizationByUai(uai);

      // then
      expect(foundOrganization).to.have.lengthOf(1);
      expect(foundOrganization[0]).to.be.an.instanceof(Organization);
      expect(foundOrganization[0].externalId).to.equal(organizationSCO.externalId);
      expect(foundOrganization[0].type).to.equal(organizationSCO.type);
      expect(foundOrganization[0].email).to.equal(organizationSCO.email);
    });

    it('should return external identifier for SCO organizations matching given UAI with lower and upper case', async () => {
      // given
      const uai = '058799aA';
      const organizationSCO = organizations[5];

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

    context('when there is an Organization matching the "id"', () => {

      beforeEach(() => {
        databaseBuilder.factory.buildOrganization({ id: 123 });
        databaseBuilder.factory.buildOrganization({ id: 456 });
        databaseBuilder.factory.buildOrganization({ id: 789 });
        return databaseBuilder.commit();
      });

      it('should return only the Organization matching "id" if given in filters', async () => {
        // given
        const filter = { id: 123 };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 1 };

        // when
        const { models: matchingOrganizations, pagination } = await organizationRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(matchingOrganizations).to.have.lengthOf(1);
        expect(matchingOrganizations[0].id).to.equal(123);
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
        databaseBuilder.factory.buildOrganization({ provinceCode: 'ABC' });
        databaseBuilder.factory.buildOrganization({ provinceCode: 'DEF' });

        return databaseBuilder.commit();
      });

      it('should ignore the filters and retrieve all organizations', async () => {
        // given
        const filter = { provinceCode: 'ABC' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingOrganizations, pagination } = await organizationRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(_.map(matchingOrganizations, 'provinceCode')).to.have.members(['ABC', 'DEF']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });
  });

  describe('#findPaginatedFilteredByTargetProfile', () => {
    let targetProfileId;

    beforeEach(() => {
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      return databaseBuilder.commit();
    });

    context('when there are organizations linked to the target profile', () => {

      beforeEach(() => {
        _.times(2, () => {
          const organizationId = databaseBuilder.factory.buildOrganization().id;
          databaseBuilder.factory.buildTargetProfileShare({ organizationId, targetProfileId });
        });
        return databaseBuilder.commit();
      });

      it('should return an Array of Organizations', async () => {
        // given
        const filter = {};
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingOrganizations, pagination } = await organizationRepository.findPaginatedFilteredByTargetProfile({ targetProfileId, filter, page });

        // then
        expect(matchingOrganizations).to.exist;
        expect(matchingOrganizations).to.have.lengthOf(2);
        expect(matchingOrganizations[0]).to.be.an.instanceOf(Organization);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are lots of organizations (> 10) linked to the target profile', () => {

      beforeEach(() => {
        _.times(12, () => {
          const organizationId = databaseBuilder.factory.buildOrganization().id;
          databaseBuilder.factory.buildTargetProfileShare({ organizationId, targetProfileId });
        });
        return databaseBuilder.commit();
      });

      it('should return paginated matching Organizations', async () => {
        // given
        const filter = {};
        const page = { number: 1, size: 3 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 4, rowCount: 12 };

        // when
        const { models: matchingOrganizations, pagination } = await organizationRepository.findPaginatedFilteredByTargetProfile({ targetProfileId, filter, page });

        // then
        expect(matchingOrganizations).to.have.lengthOf(3);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there is a filter on "id"', () => {

      beforeEach(() => {
        const organizationId1 = databaseBuilder.factory.buildOrganization({ id: 123 }).id;
        const organizationId2 = databaseBuilder.factory.buildOrganization({ id: 456 }).id;
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId1, targetProfileId });
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId2, targetProfileId });
        return databaseBuilder.commit();
      });

      it('should return only organizations matching "id"', async () => {
        // given
        const filter = { id: 456 };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 1 };

        // when
        const { models: matchingOrganizations, pagination } = await organizationRepository.findPaginatedFilteredByTargetProfile({ targetProfileId, filter, page });

        // then
        expect(matchingOrganizations).to.have.lengthOf(1);
        expect(matchingOrganizations[0].id).to.equal(456);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are some filter on "name"', () => {

      beforeEach(() => {
        const organizationId1 = databaseBuilder.factory.buildOrganization({ name: 'Dragon & co' }).id;
        const organizationId2 = databaseBuilder.factory.buildOrganization({ name: 'Broca & co' }).id;
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId1, targetProfileId });
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId2, targetProfileId });
        return databaseBuilder.commit();
      });

      it('should return only organizations matching "name"', async () => {
        // given
        const filter = { name: 'dra' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 1 };

        // when
        const { models: matchingOrganizations, pagination } = await organizationRepository.findPaginatedFilteredByTargetProfile({ targetProfileId, filter, page });

        // then
        expect(matchingOrganizations).to.have.lengthOf(1);
        expect(_.map(matchingOrganizations, 'name')).to.have.members(['Dragon & co']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are some filter on "type"', () => {

      beforeEach(() => {
        const organizationId1 = databaseBuilder.factory.buildOrganization({ type: 'PRO' }).id;
        const organizationId2 = databaseBuilder.factory.buildOrganization({ type: 'SUP' }).id;
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId1, targetProfileId });
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId2, targetProfileId });
        return databaseBuilder.commit();
      });

      it('should return only organizations matching "type"', async () => {
        // given
        const filter = { type: 'S' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 1 };

        // when
        const { models: matchingOrganizations, pagination } = await organizationRepository.findPaginatedFilteredByTargetProfile({ targetProfileId, filter, page });

        // then
        expect(_.map(matchingOrganizations, 'type')).to.have.members(['SUP']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are some filter on "externalId"', () => {

      beforeEach(() => {
        const organizationId1 = databaseBuilder.factory.buildOrganization({ externalId: '1234567A' }).id;
        const organizationId2 = databaseBuilder.factory.buildOrganization({ externalId: '1234567B' }).id;
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId1, targetProfileId });
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId2, targetProfileId });
        return databaseBuilder.commit();
      });

      it('should return only organizations matching "externalId"', async () => {
        // given
        const filter = { externalId: 'a' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 1 };

        // when
        const { models: matchingOrganizations, pagination } = await organizationRepository.findPaginatedFilteredByTargetProfile({ targetProfileId, filter, page });

        // then
        expect(_.map(matchingOrganizations, 'externalId')).to.have.members(['1234567A']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are some filters on "name", "type" and "externalId"', () => {

      beforeEach(() => {
        // Matching organizations
        const organizationId1 = databaseBuilder.factory.buildOrganization({ name: 'name_ok_1', type: 'SCO', externalId: '1234567A' }).id;
        const organizationId2 = databaseBuilder.factory.buildOrganization({ name: 'name_ok_2', type: 'SCO', externalId: '1234568A' }).id;
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId1, targetProfileId });
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId2, targetProfileId });

        // Unmatching organizations
        const organizationId3 = databaseBuilder.factory.buildOrganization({ name: 'name_ko_3', type: 'SCO', externalId: '1234567A' }).id;
        const organizationId4 = databaseBuilder.factory.buildOrganization({ name: 'name_ok_4', type: 'SCO', externalId: '1234567B' }).id;
        const organizationId5 = databaseBuilder.factory.buildOrganization({ name: 'name_ok_5', type: 'SUP', externalId: '1234567A' }).id;
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId3, targetProfileId });
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId4, targetProfileId });
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId5, targetProfileId });

        return databaseBuilder.commit();
      });

      it('should return only Organizations matching "name" AND "type" "AND" "externalId" if given in filters', async () => {
        // given
        const filter = { name: 'name_ok', type: 'SCO', externalId: 'a' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingOrganizations, pagination } = await organizationRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(_.map(matchingOrganizations, 'name')).to.have.members(['name_ok_1', 'name_ok_2']);
        expect(_.map(matchingOrganizations, 'type')).to.have.members(['SCO', 'SCO' ]);
        expect(_.map(matchingOrganizations, 'externalId')).to.have.members(['1234567A', '1234568A']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are filters that should be ignored', () => {

      beforeEach(() => {
        const organizationId1 = databaseBuilder.factory.buildOrganization({ provinceCode: 'ABC' }).id;
        const organizationId2 = databaseBuilder.factory.buildOrganization({ provinceCode: 'DEF' }).id;
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId1, targetProfileId });
        databaseBuilder.factory.buildTargetProfileShare({ organizationId: organizationId2, targetProfileId });
        return databaseBuilder.commit();
      });

      it('should ignore the filters and retrieve all organizations', async () => {
        // given
        const filter = { provinceCode: 'DEF' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingOrganizations, pagination } = await organizationRepository.findPaginatedFilteredByTargetProfile({ targetProfileId, filter, page });

        // then
        expect(_.map(matchingOrganizations, 'provinceCode')).to.have.members(['ABC', 'DEF']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });
  });

  describe('#batchCreateProOrganizations', () => {

    afterEach(async () => {
      await knex('organizations').delete();
    });

    it('should add rows in the table "organizations"', async () => {
      // given
      const organization1 = domainBuilder.buildOrganization();
      const organization2 = domainBuilder.buildOrganization();

      // when
      await organizationRepository.batchCreateProOrganizations([organization1, organization2]);

      // then
      const foundOrganizations = await knex('organizations').select();
      expect(foundOrganizations.length).to.equal(2);
    });

  });
});
