const { expect, knex, sinon } = require('../../../test-helper');
const faker = require('faker');
const bcrypt = require('bcrypt');
const Organization = require('../../../../lib/domain/models/Organization');

const BookshelfOrganization = require('../../../../lib/infrastructure/data/organization');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');

describe('Integration | Repository | Organization', function() {

  describe('#saveFromModel', () => {

    const userPassword = bcrypt.hashSync('A124B2C3#!', 1);
    const inserted_user = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      password: userPassword,
      cgu: true
    };

    beforeEach(() => {
      return knex('users').insert(inserted_user);
    });

    afterEach(() => {
      return knex('users').delete();
    });

    it('should save model in database', () => {
      // given
      const organization = new BookshelfOrganization({ code: 'AAAA99', name: 'Lycée Rousseau', type: 'SCO', email: 'a@b.fr' });

      // when
      const promise = organizationRepository.saveFromModel(organization);

      // then
      return promise.then((organizationSaved) => {
        expect(organizationSaved).to.be.an.instanceof(BookshelfOrganization);
        expect(organizationSaved.get('code')).to.equal('AAAA99');
      });
    });
  });

  describe('#isCodeAvailable', () => {

    const organization = {
      email: faker.internet.email(),
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

    it('should return the code when the code is not already used', () => {
      // when
      const promise = organizationRepository.isCodeAvailable('ABCD02');

      // then
      return promise.then((code) => {
        expect(code).to.equal('ABCD02');
      });
    });

    it('should reject when the organization already exists', () => {
      // when
      const promise = organizationRepository.isCodeAvailable('ABCD01');

      // then
      return promise
        .then(() => {
          sinon.assert.fail('Should not be a success');
        })
        .catch(() => {
          expect(promise).to.be.rejected;
        });
    });
  });

  describe('#isOrganizationIdExist', () => {

    const organization = {
      email: faker.internet.email(),
      type: 'PRO',
      name: faker.name.firstName(),
      code: 'ABCD01'
    };

    let organizationId;

    before(() => {
      return knex('organizations')
        .insert(organization)
        .then((id) => {
          organizationId = id.toString();
        });
    });

    after(() => {
      return knex('organizations').delete();
    });

    it('should return true when an organization id is found', () => {
      // when
      const promise = organizationRepository.isOrganizationIdExist(organizationId);

      // then
      return promise.then((result) => {
        expect(result).to.be.true;
      });
    });

    it('should return false when the organization id is not found', () => {
      // when
      const promise = organizationRepository.isOrganizationIdExist(6);

      // then
      return promise.then((result) => {
        expect(result).to.be.false;
      });
    });
  });

  describe('#get', () => {

    const existingId = 1;
    const insertedOrganization = {
      email: 'test@email.com',
      type: 'PRO',
      name: 'The name of the organization',
      userId: 294,
      id: existingId
    };

    before(() => {
      return knex('organizations')
        .then(() => {
          return knex('organizations').insert(insertedOrganization);
        });
    });

    after(() => {
      return knex('organizations').delete();
    });

    describe('success management', function() {

      it('should return a organization by provided id', function() {
        // when
        const promise = organizationRepository.get(existingId);

        // then
        return promise.then((foundOrganization) => {
          expect(foundOrganization).to.be.an.instanceof(Organization);
          expect(foundOrganization.email).to.equal(insertedOrganization.email);
          expect(foundOrganization.type).to.equal(insertedOrganization.type);
          expect(foundOrganization.name).to.equal(insertedOrganization.name);
          expect(foundOrganization.id).to.equal(insertedOrganization.id);
        });
      });

      it('should return a rejection when organization id is not found', function() {
        // given
        const inexistenteId = 10083;

        // when
        const promise = organizationRepository.get(inexistenteId);

        // then
        return promise.then(() => {
          expect.fail('Treatment did not throw an error as expected', 'Expected a "NotFoundError" to have been throwed');
        }).catch((err) => {
          expect(err.message).to.equal('Not found organization for ID 10083');
        });
      });

    });
  });

  describe('#getByUserId', () => {

    const firstInsertedOrganization = {
      email: 'entreprise1@email.com',
      type: 'PRO',
      name: 'organization 1',
      userId: 1,
      id: 1,
      code: 'ABCD12'
    };

    const secondInsertedOrganization = {
      email: 'entreprise2@email.com',
      type: 'SCO',
      name: 'organization 2',
      userId: 2,
      id: 2,
      code: 'EFGH34'
    };

    const thirdInsertedOrganization = {
      email: 'entreprise3@email.com',
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
            expect(foundOrganization[0].attributes.email).to.equal(secondInsertedOrganization.email);
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
        return promise.then(foundOrganizations => {
          expect(foundOrganizations).to.exist;
          expect(foundOrganizations).to.be.an('array');
          expect(foundOrganizations).to.have.lengthOf(2);
        });

      });

      it('should return an empty Array, when organization id is not found', function() {
        const userId = 10083;
        return organizationRepository.getByUserId(userId)
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
      email: faker.internet.email(),
      type: 'PRO',
      name: faker.name.firstName(),
      code: 'ABCD01',
    };
    const insertedOrganization2 = {
      email: faker.internet.email(),
      type: 'SCO',
      name: faker.name.firstName(),
      code: 'ABCD02',
    };

    beforeEach(() => {
      return knex('users').returning('id').insert(associatedUser)
        .then(userIdArray => {
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

    it('should return the organizations that matches the filters', function() {
      // given
      const filters = { type: 'PRO' };

      // when
      const promise = organizationRepository.findBy(filters);

      // then
      return promise.then(organizations => {
        expect(organizations).to.have.lengthOf(1);

        const foundOrganization = organizations[0];

        expect(foundOrganization).to.be.an.instanceof(Organization);
        expect(foundOrganization.code).to.equal(insertedOrganization1.code);
        expect(foundOrganization.type).to.equal('PRO');
        expect(foundOrganization.user).to.be.undefined;
      });
    });

  });
});
