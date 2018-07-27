const { expect, knex } = require('../../../test-helper');
const faker = require('faker');
const bcrypt = require('bcrypt');

const Bookshelf = require('../../../../lib/infrastructure/bookshelf');
const BookshelfUser = require('../../../../lib/infrastructure/data/user');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const { AlreadyRegisteredEmailError, UserNotFoundError } = require('../../../../lib/domain/errors');
const User = require('../../../../lib/domain/models/User');
const OrganizationAccess = require('../../../../lib/domain/models/OrganizationAccess');
const Organization = require('../../../../lib/domain/models/Organization');
const OrganizationRole = require('../../../../lib/domain/models/OrganizationRole');

describe('Integration | Infrastructure | Repository | UserRepository', () => {

  const userToInsert = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email().toLowerCase(),
    password: bcrypt.hashSync('A124B2C3#!', 1),
    cgu: true,
  };

  function _insertUser() {
    return knex('users')
      .insert(userToInsert)
      .returning('id')
      .then((result) => {
        userToInsert.id = result.shift();
        return userToInsert;
      });
  }

  function _insertUserWithOrganizationsAccesses() {
    const organizationToInsert = {
      email: faker.internet.email().toLowerCase(),
      type: 'PRO',
      name: 'Mon Entreprise',
      code: 'ABCD12',
    };
    const organizationRoleToInsert = { name: 'ADMIN' };
    const organizationAccessToInsert = {};

    let organizationId, organizationRoleId;
    return knex('users').insert(userToInsert)
      .then((insertedUser) => {
        userToInsert.id = insertedUser[0];
        organizationAccessToInsert.userId = insertedUser[0];
        return knex('organizations').insert(organizationToInsert);
      })
      .then((insertedOrganization) => {
        organizationId = insertedOrganization[0];
        organizationToInsert.id = organizationId;
        organizationAccessToInsert.organizationId = organizationId;
        return knex('organization-roles').insert(organizationRoleToInsert);
      })
      .then((insertedOrganizationRole) => {
        organizationRoleId = insertedOrganizationRole[0];
        organizationRoleToInsert.id = organizationRoleId;
        organizationAccessToInsert.organizationRoleId = organizationRoleId;
        return knex('organizations-accesses').insert(organizationAccessToInsert);
      })
      .then((insertedOrganizationAccess) => {
        organizationAccessToInsert.id = insertedOrganizationAccess[0];
        return {
          userInDB: userToInsert,
          organizationInDB: organizationToInsert,
          organizationRoleInDB: organizationRoleToInsert,
          organizationAccessInDB: organizationAccessToInsert
        };
      });
  }

  describe('find user', () => {

    describe('#findUserById', () => {

      let userInDb;

      beforeEach(() => {
        return _insertUser().then((insertedUser) => userInDb = insertedUser);
      });

      afterEach(() => {
        return knex('users').delete();
      });

      describe('Success management', () => {

        it('should find a user by provided id', () => {
          return userRepository.findUserById(userInDb.id)
            .then((foundedUser) => {
              expect(foundedUser).to.exist;
              expect(foundedUser).to.be.an('object');
              expect(foundedUser.attributes.email).to.equal(userInDb.email);
              expect(foundedUser.attributes.firstName).to.equal(userInDb.firstName);
              expect(foundedUser.attributes.lastName).to.equal(userInDb.lastName);
            });
        });

        it('should handle a rejection, when user id is not found', () => {
          const inexistenteId = 10093;
          return userRepository.findUserById(inexistenteId)
            .catch((err) => {
              expect(err).to.be.an.instanceof(BookshelfUser.NotFoundError);
            });
        });
      });
    });

    describe('#findByEmail', () => {

      let userInDb;

      beforeEach(() => {
        return _insertUser().then((insertedUser) => userInDb = insertedUser);
      });

      afterEach(() => {
        return knex('users').delete();
      });

      it('should be a function', () => {
        // then
        expect(userRepository.findByEmail).to.be.a('function');
      });

      it('should handle a rejection, when user id is not found', () => {
        // given
        const emailThatDoesNotExist = 10093;

        // when
        const promise = userRepository.findByEmail(emailThatDoesNotExist);

        // then
        return promise.catch((err) => {
          expect(err).to.be.instanceof(Bookshelf.Model.NotFoundError);
        });
      });

      it('should return a domain user when found', () => {
        // when
        const promise = userRepository.findByEmail(userInDb.email);

        // then
        return promise.then((user) => {
          expect(user.email).to.equal(userInDb.email);
        });
      });
    });

    describe('#findByEmailWithRoles', () => {

      let userInDB, organizationInDB, organizationRoleInDB, organizationAccessInDB;

      beforeEach(() => {
        return _insertUserWithOrganizationsAccesses()
          .then((persistedEntities) =>
            ({ userInDB, organizationInDB, organizationRoleInDB, organizationAccessInDB } = persistedEntities));
      });

      afterEach(() => {
        return knex('organizations-accesses').delete()
          .then(() => {
            return Promise.all([
              knex('organizations').delete(),
              knex('users').delete(),
              knex('organization-roles').delete()
            ]);
          });
      });

      it('should return user informations for the given email', () => {
        // given
        const expectedUser = new User(userInDB);

        // when
        const promise = userRepository.findByEmailWithRoles(userInDB.email);

        // then
        return promise.then((user) => {
          expect(user).to.be.an.instanceof(User);
          expect(user.id).to.equal(expectedUser.id);
          expect(user.firstName).to.equal(expectedUser.firstName);
          expect(user.lastName).to.equal(expectedUser.lastName);
          expect(user.email).to.equal(expectedUser.email);
          expect(user.password).to.equal(expectedUser.password);
          expect(user.cgu).to.equal(expectedUser.cgu);
        });
      });

      it('should return organization access associated to the user', () => {
        // when
        const promise = userRepository.findByEmailWithRoles(userToInsert.email);

        // then
        return promise.then((user) => {

          expect(user.organizationAccesses).to.be.an('array');

          const firstOrganizationAccess = user.organizationAccesses[0];
          expect(firstOrganizationAccess).to.be.an.instanceof(OrganizationAccess);
          expect(firstOrganizationAccess.id).to.equal(organizationAccessInDB.id);

          const accessibleOrganization = firstOrganizationAccess.organization;
          expect(accessibleOrganization).to.be.an.instanceof(Organization);
          expect(accessibleOrganization.id).to.equal(organizationInDB.id);
          expect(accessibleOrganization.code).to.equal(organizationInDB.code);
          expect(accessibleOrganization.name).to.equal(organizationInDB.name);
          expect(accessibleOrganization.type).to.equal(organizationInDB.type);
          expect(accessibleOrganization.email).to.equal(organizationInDB.email);

          const associatedRole = firstOrganizationAccess.organizationRole;
          expect(associatedRole).to.be.an.instanceof(OrganizationRole);
          expect(associatedRole.id).to.equal(organizationRoleInDB.id);
          expect(associatedRole.name).to.equal(organizationRoleInDB.name);
        });
      });

      it('should reject with a UserNotFound error when no user was found with this email', () => {
        // given
        const unusedEmail = 'kikou@pix.fr';

        // when
        const promise = userRepository.findByEmailWithRoles(unusedEmail);

        // then
        return expect(promise).to.be.rejectedWith(UserNotFoundError);
      });
    });

  });

  describe('get user', () => {

    describe('#get', () => {

      let userInDb;

      beforeEach(() => {
        return _insertUser().then((insertedUser) => userInDb = insertedUser);
      });

      afterEach(() => {
        return knex('users').delete();
      });

      it('should return the found user', () => {
        // when
        const promise = userRepository.get(userInDb.id);

        // then
        return promise.then((user) => {
          expect(user).to.be.an.instanceOf(User);
          expect(user.id).to.equal(userInDb.id);
          expect(user.firstName).to.equal(userInDb.firstName);
          expect(user.lastName).to.equal(userInDb.lastName);
          expect(user.email).to.equal(userInDb.email);
          expect(user.cgu).to.be.true;
          expect(user.pixRoles).to.be.an('array');
        });
      });

      it('should return a UserNotFoundError if no user is found', () => {
        // given
        const nonExistentUserId = 678;

        // when
        const promise = userRepository.get(nonExistentUserId);

        // then
        return expect(promise).to.be.rejectedWith(UserNotFoundError);
      });
    });

    describe('#getWithOrganizationAccesses', () => {
      let userInDB, organizationInDB, organizationRoleInDB, organizationAccessInDB;

      beforeEach(() => {
        return _insertUserWithOrganizationsAccesses()
          .then((persistedEntities) =>
            ({ userInDB, organizationInDB, organizationRoleInDB, organizationAccessInDB } = persistedEntities));
      });

      afterEach(() => {
        return knex('organizations-accesses').delete()
          .then(() => {
            return Promise.all([
              knex('organizations').delete(),
              knex('users').delete(),
              knex('organization-roles').delete()
            ]);
          });
      });

      it('should return user for the given id', () => {
        // given
        const expectedUser = new User(userInDB);

        // when
        const promise = userRepository.getWithOrganizationAccesses(userInDB.id);

        // then
        return promise.then((user) => {
          expect(user).to.be.an.instanceof(User);
          expect(user.id).to.equal(expectedUser.id);
          expect(user.firstName).to.equal(expectedUser.firstName);
          expect(user.lastName).to.equal(expectedUser.lastName);
          expect(user.email).to.equal(expectedUser.email);
          expect(user.password).to.equal(expectedUser.password);
          expect(user.cgu).to.equal(expectedUser.cgu);
        });
      });

      it('should return organization access associated to the user', () => {
        // when
        const promise = userRepository.getWithOrganizationAccesses(userInDB.id);

        // then
        return promise.then((user) => {

          expect(user.organizationAccesses).to.be.an('array');

          const organizationAccess = user.organizationAccesses[0];
          expect(organizationAccess).to.be.an.instanceof(OrganizationAccess);
          expect(organizationAccess.id).to.equal(organizationAccessInDB.id);

          const accessibleOrganization = organizationAccess.organization;
          expect(accessibleOrganization).to.be.an.instanceof(Organization);
          expect(accessibleOrganization.id).to.equal(organizationInDB.id);
          expect(accessibleOrganization.code).to.equal(organizationInDB.code);
          expect(accessibleOrganization.name).to.equal(organizationInDB.name);
          expect(accessibleOrganization.type).to.equal(organizationInDB.type);
          expect(accessibleOrganization.email).to.equal(organizationInDB.email);

          const associatedRole = organizationAccess.organizationRole;
          expect(associatedRole).to.be.an.instanceof(OrganizationRole);
          expect(associatedRole.id).to.equal(organizationRoleInDB.id);
          expect(associatedRole.name).to.equal(organizationRoleInDB.name);
        });
      });

      it('should reject with a UserNotFound error when no user was found with the given id', () => {
        // given
        const unknownUserId = 666;

        // when
        const promise = userRepository.getWithOrganizationAccesses(unknownUserId);

        // then
        return expect(promise).to.be.rejectedWith(UserNotFoundError);
      });
    });

  });

  describe('#save', () => {

    afterEach(() => {
      return knex('users').delete();
    });

    it('should save the user', () => {
      // given
      const email = 'my-email-to-save@example.net';
      const user = new User({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: email,
        password: 'Pix1024#',
        cgu: true,
      });

      // when
      const promise = userRepository.create(user);

      // then
      return promise
        .then(() => knex('users').select())
        .then((usersSaved) => {
          expect(usersSaved).to.have.lengthOf(1);
        });
    });

    it('should return a Domain User object', () => {
      // given
      const email = 'my-email-to-save@example.net';
      const user = new User({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: email,
        password: 'Pix1024#',
        cgu: true,
      });

      // when
      const promise = userRepository.create(user);

      // then
      return promise.then((userSaved) => {
        expect(userSaved).to.be.an.instanceOf(User);
        expect(userSaved.firstName).to.equal(user.firstName);
        expect(userSaved.lastName).to.equal(user.lastName);
        expect(userSaved.email).to.equal(user.email);
        expect(userSaved.cgu).to.equal(user.cgu);
      });
    });
  });

  describe('#isEmailAvailable', () => {

    let userInDb;

    beforeEach(() => {
      return _insertUser().then((insertedUser) => userInDb = insertedUser);
    });

    afterEach(() => {
      return knex('users').delete();
    });

    it('should return the email when the email is not registered', () => {
      // when
      const promise = userRepository.isEmailAvailable('email@example.net');

      // then
      return promise.then((email) => {
        expect(email).to.equal('email@example.net');
      });
    });

    it('should reject an AlreadyRegisteredEmailError when it already exists', () => {
      // when
      const promise = userRepository.isEmailAvailable(userInDb.email);

      // then
      return promise.catch((err) => {
        expect(err).to.be.an.instanceOf(AlreadyRegisteredEmailError);
      });

    });

  });

  describe('#updatePassword', () => {

    let userInDb;

    beforeEach(() => {
      return _insertUser().then((insertedUser) => userInDb = insertedUser);
    });

    afterEach(() => {
      return knex('users').delete();
    });

    it('should save the user', () => {
      // given
      const newPassword = '1235Pix!';

      // when
      const promise = userRepository.updatePassword(userInDb.id, newPassword);

      // then
      return promise
        .then((updatedUser) => {
          expect(updatedUser).to.be.an.instanceOf(User);
          expect(updatedUser.password).to.equal(newPassword);
        });
    });
  });

});
