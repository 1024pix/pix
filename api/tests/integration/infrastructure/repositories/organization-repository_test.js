const { expect, knex, domainBuilder, databaseBuilder } = require('../../../test-helper');

const faker = require('faker');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const Organization = require('../../../../lib/domain/models/Organization');
const BookshelfOrganization = require('../../../../lib/infrastructure/data/organization');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');

describe('Integration | Repository | Organization', function() {

  beforeEach(() => {
    return databaseBuilder.clean();
  });

  afterEach(() => {
    return databaseBuilder.clean();
  });

  describe('#create', () => {

    afterEach(() => {
      return knex('organizations').delete();
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
    });
  });

  describe('#update', () => {

    const organizationCode = 'ABCD12';

    let organization;

    beforeEach(() => {
      const bookshelfOrganization = databaseBuilder.factory.buildOrganization({ id: 1, code: organizationCode });
      organization = domainBuilder.buildOrganization(bookshelfOrganization);
      return databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
      await knex('organizations').delete();
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

      // when
      const organizationSaved = await organizationRepository.update(organization);

      // then
      expect(organizationSaved.id).to.equal(organization.id);
      expect(organizationSaved.name).to.equal('New name');
      expect(organizationSaved.type).to.equal('SCO');
      expect(organizationSaved.logoUrl).to.equal('http://new.logo.url');
      expect(organizationSaved.code).to.equal(organization.code);
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

    const organization = {
      type: 'PRO',
      name: faker.name.firstName(),
      code: 'ABCD01'
    };

    before(() => {
      return knex('organizations').insert(organization);
    });

    after(() => {
      return knex('organizations').delete();
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

  describe('#isOrganizationIdExist', () => {

    const organization = {
      type: 'PRO',
      name: faker.name.firstName(),
      code: 'ABCD01'
    };

    let organizationId;

    before(() => {
      return knex('organizations')
        .insert(organization)
        .returning('id')
        .then((id) => {
          organizationId = id.shift();
        });
    });

    after(() => {
      return knex('organizations').delete();
    });

    it('should return true when an organization id is found', async () => {
      // when
      const result = await organizationRepository.isOrganizationIdExist(organizationId);

      // then
      expect(result).to.equal(true);
    });

    it('should return false when the organization id is not found', async () => {
      // when
      const result = await organizationRepository.isOrganizationIdExist(6);

      // then
      expect(result).to.equal(false);
    });
  });

  describe('#get', () => {

    describe('success management', function() {

      let insertedOrganization;

      beforeEach(() => {
        insertedOrganization = databaseBuilder.factory.buildOrganization();
        return databaseBuilder.commit();
      });

      afterEach(() => {
        return databaseBuilder.clean();
      });

      it('should return a organization by provided id', function() {
        // when
        const promise = organizationRepository.get(insertedOrganization.id);

        // then
        return promise.then((foundOrganization) => {
          expect(foundOrganization).to.be.an.instanceof(Organization);
          expect(foundOrganization.type).to.equal(insertedOrganization.type);
          expect(foundOrganization.name).to.equal(insertedOrganization.name);
          expect(foundOrganization.logoUrl).to.equal(insertedOrganization.logoUrl);
          expect(foundOrganization.id).to.equal(insertedOrganization.id);
        });
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

      beforeEach(() => {
        insertedOrganization = databaseBuilder.factory.buildOrganization();
        sharedProfile = databaseBuilder.factory.buildTargetProfile({
          isPublic: 0
        });
        databaseBuilder.factory.buildTargetProfileShare({
          organizationId: insertedOrganization.id,
          targetProfileId: sharedProfile.id,
        });

        return databaseBuilder.commit();
      });

      afterEach(() => {
        return databaseBuilder.clean();
      });

      it('should return an list of profile containing the shared profile', () => {
        // when
        const promise = organizationRepository.get(insertedOrganization.id);

        // then
        return promise.then((organization) => {
          const firstTargetProfileShare = organization.targetProfileShares[0];
          expect(firstTargetProfileShare.targetProfileId).to.deep.equal(sharedProfile.id);
          expect(firstTargetProfileShare.organizationId).to.deep.equal(insertedOrganization.id);

          const profileWithoutCreatedAt = _.omit(firstTargetProfileShare.targetProfile, 'createdAt');
          expect(profileWithoutCreatedAt).to.deep.equal(sharedProfile);
        });
      });
    });
  });

  describe('#getByUserId', () => {

    const firstInsertedOrganization = {
      type: 'PRO',
      name: 'organization 1',
      userId: 1,
      id: 1,
      code: 'ABCD12'
    };

    const secondInsertedOrganization = {
      type: 'SCO',
      name: 'organization 2',
      userId: 2,
      id: 2,
      code: 'EFGH34'
    };

    const thirdInsertedOrganization = {
      type: 'SUP',
      name: 'organization 3',
      userId: 1,
      id: 3,
      code: 'IJKL56'
    };

    const organizations = [firstInsertedOrganization, secondInsertedOrganization, thirdInsertedOrganization];

    before(() => {
      return knex('organizations')
        .then(() => {
          return knex('organizations').insert(organizations);
        });
    });

    after(() => {
      return knex('organizations').delete();
    });

    describe('success management', function() {

      it('should return an organization by provided userId', function() {
        // given
        const userId = 2;

        // then
        return organizationRepository.getByUserId(userId)
          .then((foundOrganization) => {
            expect(foundOrganization).to.exist;
            expect(foundOrganization).to.be.an('array');
            expect(foundOrganization[0].attributes.type).to.equal(secondInsertedOrganization.type);
            expect(foundOrganization[0].attributes.name).to.equal(secondInsertedOrganization.name);
            expect(foundOrganization[0].attributes.userId).to.equal(secondInsertedOrganization.userId);
            expect(foundOrganization[0].attributes.id).to.equal(secondInsertedOrganization.id);
            expect(foundOrganization[0].attributes.code).to.equal(secondInsertedOrganization.code);
          });
      });

      it('should return all organizations when provided userId has multiple organizations', function() {
        // given
        const userId = 1;

        // when
        const promise = organizationRepository.getByUserId(userId);

        // then
        return promise.then((foundOrganizations) => {
          expect(foundOrganizations).to.exist;
          expect(foundOrganizations).to.be.an('array');
          expect(foundOrganizations).to.have.lengthOf(2);
        });

      });

      it('should return an empty Array, when organization id is not found', function() {
        const organizationId = 10083;
        return organizationRepository.getByUserId(organizationId)
          .then((organization) => {
            expect(organization).to.deep.equal([]);
          });
      });

    });
  });

  describe('#findBy', () => {

    const userPassword = bcrypt.hashSync('A124B2C3#!', 1);
    const associatedUser = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      password: userPassword,
      cgu: true
    };

    const insertedOrganization1 = {
      type: 'PRO',
      name: faker.name.firstName(),
      code: 'ABCD01',
    };
    const insertedOrganization2 = {
      type: 'SCO',
      name: faker.name.firstName(),
      code: 'ABCD02',
    };

    beforeEach(() => {
      return knex('users').returning('id').insert(associatedUser)
        .then((userIdArray) => {
          insertedOrganization1.userId = userIdArray[0];
          insertedOrganization2.userId = userIdArray[0];
          return knex('organizations').insert([insertedOrganization1, insertedOrganization2]);
        });
    });

    afterEach(() => {
      return knex('users').delete()
        .then(() => {
          return knex('organizations').delete();
        });
    });

    it('should return the organizations that matches the filters', async () => {
      // given
      const filters = { type: 'PRO' };

      // when
      const organizations = await organizationRepository.findBy(filters);

      // then
      expect(organizations).to.have.lengthOf(1);

      const foundOrganization = organizations[0];

      expect(foundOrganization).to.be.an.instanceof(Organization);
      expect(foundOrganization.code).to.equal(insertedOrganization1.code);
      expect(foundOrganization.type).to.equal('PRO');
      expect(foundOrganization.user).to.be.undefined;
    });
  });

  describe('#find', () => {

    context('when there are Organizations in the database', () => {

      beforeEach(() => {
        _.times(3, databaseBuilder.factory.buildOrganization);
        return databaseBuilder.commit();
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

      it('should return only Organizations matching name" if given in filters', async () => {
        // given
        const filters = { name: 'dra' };
        const pagination = { page: 1, pageSize: 10 };

        // when
        const promise = organizationRepository.find(filters, pagination);

        // then
        return promise.then((matchingOrganizations) => {
          expect(matchingOrganizations).to.have.lengthOf(2);
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
          expect(matchingOrganizations).to.have.lengthOf(2);
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
          expect(matchingOrganizations).to.have.lengthOf(2);
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
          expect(matchingOrganizations).to.have.lengthOf(3);
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
