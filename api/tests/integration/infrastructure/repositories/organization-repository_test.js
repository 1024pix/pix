const { expect, knex, domainBuilder, databaseBuilder } = require('../../../test-helper');
const Organization = require('../../../../lib/domain/models/Organization');
const BookshelfOrganization = require('../../../../lib/infrastructure/data/organization');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const _ = require('lodash');

describe('Integration | Repository | Organization', function() {

  beforeEach(async () => {
    await databaseBuilder.clean();
  });

  afterEach(async () => {
    await databaseBuilder.clean();
  });

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
      expect(organizationSaved.code).to.equal(organization.code);
      expect(organizationSaved.externalId).to.equal(organization.externalId);
      expect(organizationSaved.provinceCode).to.equal(organization.provinceCode);
    });
  });

  describe('#update', () => {

    const organizationCode = 'ABCD12';

    let organization;

    beforeEach(async () => {
      const bookshelfOrganization = databaseBuilder.factory.buildOrganization({ id: 1, code: organizationCode });
      organization = domainBuilder.buildOrganization(bookshelfOrganization);
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
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
      expect(organizationSaved.code).to.equal(organization.code);
      expect(organizationSaved.externalId).to.equal(organization.externalId);
      expect(organizationSaved.provinceCode).to.equal(organization.provinceCode);
      expect(organizationSaved.isManagingStudents).to.equal(organization.isManagingStudents);
    });

    it('should not modify code property', async () => {
      // given
      const originalOrganizationCode = organization.code;
      organization.code = 'New manual code that should not be saved';

      // when
      const organizationSaved = await organizationRepository.update(organization);

      // then
      expect(organizationSaved.code).to.equal(originalOrganizationCode);
    });
  });

  describe('#isCodeAvailable', () => {
    beforeEach(async () => {
      // given
      databaseBuilder.factory.buildOrganization(
        {
          type: 'PRO',
          code: 'ABCD01',
        });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return the code when the code is not already used', async () => {
      // when
      const code = await organizationRepository.isCodeAvailable('ABCD02');

      // then
      expect(code).to.equal('ABCD02');
    });

    it('should reject when the organization already exists', () => {
      // when
      const promise = organizationRepository.isCodeAvailable('ABCD01');

      // then
      return expect(promise).to.be.rejected;
    });
  });

  describe('#get', () => {

    describe('success management', function() {

      let insertedOrganization;

      beforeEach(async () => {
        insertedOrganization = databaseBuilder.factory.buildOrganization();
        await databaseBuilder.commit();
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should return a organization by provided id', async () => {
        // when
        const foundOrganization = await organizationRepository.get(insertedOrganization.id);

        // then
        expect(foundOrganization).to.be.an.instanceof(Organization);
        expect(foundOrganization.type).to.equal(insertedOrganization.type);
        expect(foundOrganization.name).to.equal(insertedOrganization.name);
        expect(foundOrganization.logoUrl).to.equal(insertedOrganization.logoUrl);
        expect(foundOrganization.id).to.equal(insertedOrganization.id);
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

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should return an list of profile containing the shared profile', async () => {
        // when
        const organization = await organizationRepository.get(insertedOrganization.id);

        // then
        const firstTargetProfileShare = organization.targetProfileShares[0];
        expect(firstTargetProfileShare.targetProfileId).to.deep.equal(sharedProfile.id);
        expect(firstTargetProfileShare.organizationId).to.deep.equal(insertedOrganization.id);

        expect(firstTargetProfileShare.targetProfile).to.deep.equal(sharedProfile);
      });
    });
  });

  describe('#getByUserId', () => {
    let userId, anotherUserId, notUsedUserId;
    let organizations;

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser({}).id;
      anotherUserId = databaseBuilder.factory.buildUser({}).id;
      notUsedUserId = databaseBuilder.factory.buildUser({}).id;
      organizations = _.map([
        { type: 'PRO', name: 'organization 1', userId: anotherUserId, code: 'ABCD12' },
        { type: 'SCO', name: 'organization 2', userId, code: 'EFGH34' },
        { type: 'SUP', name: 'organization 3', userId: anotherUserId, code: 'IJKL56' },
      ], (organization) => {
        return databaseBuilder.factory.buildOrganization(organization);
      });

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    describe('success management', function() {

      it('should return an organization by provided userId', async () => {
        // when
        const actualOrganizations = await organizationRepository.findByUserId(userId);

        // then
        expect(actualOrganizations).to.be.an('array');
        expect(actualOrganizations).to.have.lengthOf(1);
        expect(actualOrganizations[0].type).to.equal(organizations[1].type);
        expect(actualOrganizations[0].name).to.equal(organizations[1].name);
        expect(actualOrganizations[0].code).to.equal(organizations[1].code);
        expect(actualOrganizations[0].id).to.equal(organizations[1].id);
      });

      it('should return all organizations when provided userId has multiple organizations', async () => {
        // when
        const actualOrganizations = await organizationRepository.findByUserId(anotherUserId);

        // then
        expect(actualOrganizations).to.be.an('array');
        expect(actualOrganizations).to.have.lengthOf(2);
      });

      it('should return an empty Array, when organization id is not found', async () => {
        // when
        const actualOrganizations = await organizationRepository.findByUserId(notUsedUserId);

        // then
        expect(actualOrganizations).to.deep.equal([]);
      });
    });
  });

  describe('#findBy', () => {
    let organizations;

    beforeEach(async () => {
      const userId = databaseBuilder.factory.buildUser({}).id;
      organizations = _.map([
        { type: 'PRO', name: 'organization 1', userId, code: 'ABCD12' },
        { type: 'SCO', name: 'organization 2', userId, code: 'EFGH34' },
        { type: 'SUP', name: 'organization 3', userId, code: 'IJKL56' },
      ], (organization) => {
        return databaseBuilder.factory.buildOrganization(organization);
      });

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return the organizations that matches the filters', async () => {
      // given
      const filters = { type: 'PRO' };

      // when
      const actualOrganizations = await organizationRepository.findBy(filters);

      // then
      expect(actualOrganizations).to.have.lengthOf(1);
      expect(actualOrganizations[0]).to.be.an.instanceof(Organization);
      expect(actualOrganizations[0].code).to.equal(organizations[0].code);
      expect(actualOrganizations[0].type).to.equal('PRO');
      expect(actualOrganizations[0].type).to.equal(organizations[0].type);
    });
  });

  describe('#find', () => {
    after(async () => {
      await databaseBuilder.clean();
    });

    context('when there are Organizations in the database', () => {

      beforeEach(async () => {
        _.times(3, databaseBuilder.factory.buildOrganization);
        await databaseBuilder.commit();
      });

      it('should return an Array of Organizations', async () => {
        // given
        const filters = {};
        const pagination = { page: 1, pageSize: 10 };

        // when
        const promise = organizationRepository.find(filters, pagination);

        // then
        return promise.then((matchingOrganizations) => {
          expect(matchingOrganizations).to.exist;
          expect(matchingOrganizations).to.have.lengthOf(3);
          expect(matchingOrganizations[0]).to.be.an.instanceOf(Organization);
        });
      });

    });

    context('when there are lots of Organizations (> 10) in the database', () => {

      beforeEach(() => {
        _.times(12, databaseBuilder.factory.buildOrganization);
        return databaseBuilder.commit();
      });

      it('should return paginated matching Organizations', async () => {
        // given
        const filters = {};
        const pagination = { page: 1, pageSize: 3 };

        // when
        const promise = organizationRepository.find(filters, pagination);

        // then
        return promise.then((matchingOrganizations) => {
          expect(matchingOrganizations).to.have.lengthOf(3);
        });
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
        const filters = { name: 'dra' };
        const pagination = { page: 1, pageSize: 10 };

        // when
        const promise = organizationRepository.find(filters, pagination);

        // then
        return promise.then((matchingOrganizations) => {
          expect(matchingOrganizations).to.have.lengthOf(2);
          expect(_.map(matchingOrganizations, 'name')).to.have.members(['Dragon & co', 'Dragonades & co']);
        });
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
        const filters = { type: 'S' };
        const pagination = { page: 1, pageSize: 10 };

        // when
        const promise = organizationRepository.find(filters, pagination);

        // then
        return promise.then((matchingOrganizations) => {
          expect(_.map(matchingOrganizations, 'type')).to.have.members(['SUP', 'SCO']);
        });
      });
    });

    context('when there are multiple Organizations matching the same "code" search pattern', () => {

      beforeEach(() => {
        databaseBuilder.factory.buildOrganization({ code: 'AZH578' });
        databaseBuilder.factory.buildOrganization({ code: 'BFR842' });
        databaseBuilder.factory.buildOrganization({ code: 'AZH002' });
        return databaseBuilder.commit();
      });

      it('should return only Organizations matching "code" if given in filters', async () => {
        // given
        const filters = { code: 'AZ' };
        const pagination = { page: 1, pageSize: 10 };

        // when
        const promise = organizationRepository.find(filters, pagination);

        // then
        return promise.then((matchingOrganizations) => {
          expect(_.map(matchingOrganizations, 'code')).to.have.members(['AZH578', 'AZH002']);
        });
      });
    });

    context('when there are multiple Organizations matching the fields "first name", "last name" and "email" search pattern', () => {

      beforeEach(() => {
        // Matching users
        databaseBuilder.factory.buildOrganization({ name: 'name_ok_1', type: 'SCO', code: 'c_ok_1' });
        databaseBuilder.factory.buildOrganization({ name: 'name_ok_2', type: 'SCO', code: 'c_ok_2' });
        databaseBuilder.factory.buildOrganization({ name: 'name_ok_3', type: 'SCO', code: 'c_ok_3' });

        // Unmatching users
        databaseBuilder.factory.buildOrganization({ name: 'name_ko_4', type: 'SCO', code: 'c_ok_4' });
        databaseBuilder.factory.buildOrganization({ name: 'name_ok_5', type: 'SUP', code: 'c_ok_5' });
        databaseBuilder.factory.buildOrganization({ name: 'name_ok_6', type: 'SCO', code: 'c_ko_1' });

        return databaseBuilder.commit();
      });

      it('should return only Organizations matching "name" AND "type" AND "code" if given in filters', async () => {
        // given
        const filters = { name: 'name_ok', type: 'SCO', code: 'c_ok' };
        const pagination = { page: 1, pageSize: 10 };

        // when
        const promise = organizationRepository.find(filters, pagination);

        // then
        return promise.then((matchingOrganizations) => {
          expect(_.map(matchingOrganizations, 'name')).to.have.members(['name_ok_1', 'name_ok_2', 'name_ok_3']);
          expect(_.map(matchingOrganizations, 'type')).to.have.members(['SCO', 'SCO', 'SCO']);
          expect(_.map(matchingOrganizations, 'code')).to.have.members(['c_ok_1', 'c_ok_2', 'c_ok_3']);
        });
      });
    });

    context('when there are filters that should be ignored', () => {

      beforeEach(() => {
        databaseBuilder.factory.buildOrganization({ id: 1 });
        databaseBuilder.factory.buildOrganization({ id: 2 });

        return databaseBuilder.commit();
      });

      it('should ignore the filters and retrieve all organizations', () => {
        // given
        const filters = { id: 1 };
        const pagination = { page: 1, pageSize: 10 };

        // when
        const promise = organizationRepository.find(filters, pagination);

        // then
        return promise.then((matchingOrganizations) => {
          expect(_.map(matchingOrganizations, 'id')).to.have.members([1, 2]);
        });
      });
    });
  });

  describe('#count', () => {

    context('when there are multiple Organizations in database', () => {

      beforeEach(() => {
        _.times(8, databaseBuilder.factory.buildOrganization);
        return databaseBuilder.commit();
      });

      it('should return the total number of Organizations when there is no filter', async () => {
        // given
        const filters = {};

        // when
        const promise = organizationRepository.count(filters);

        // then
        return promise.then((totalMatchingOrganizations) => {
          expect(totalMatchingOrganizations).to.equal(8);
        });
      });
    });

    context('when there are multiple Organizations matching the same "name" search pattern', () => {

      beforeEach(() => {
        databaseBuilder.factory.buildOrganization({ name: 'Drago & co' });
        databaseBuilder.factory.buildOrganization({ name: 'Maxie & co' });
        return databaseBuilder.commit();
      });

      it('should return the total number of matching Organizations', async () => {
        // given
        const filters = { name: 'dra' };

        // when
        const promise = organizationRepository.count(filters);

        // then
        return promise.then((totalMatchingOrganizations) => {
          expect(totalMatchingOrganizations).to.equal(1);
        });
      });
    });
  });

});
