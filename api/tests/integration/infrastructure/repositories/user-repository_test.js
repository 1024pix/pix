const { expect, knex } = require('../../../test-helper');
const faker = require('faker');
const bcrypt = require('bcrypt');

const Bookshelf = require('../../../../lib/infrastructure/bookshelf');
const BookshelfUser = require('../../../../lib/infrastructure/data/user');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const { AlreadyRegisteredEmailError, UserNotFoundError, NotFoundError } = require('../../../../lib/domain/errors');
const User = require('../../../../lib/domain/models/User');
const OrganizationAccess = require('../../../../lib/domain/models/OrganizationAccess');
const Organization = require('../../../../lib/domain/models/Organization');
const OrganizationRole = require('../../../../lib/domain/models/OrganizationRole');

describe('Integration | Infrastructure | Repository | UserRepository', () => {

  let userId;
  const email = faker.internet.email().toLowerCase();
  const userPassword = bcrypt.hashSync('A124B2C3#!', 1);
  const inserted_user = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email,
    password: userPassword,
    cgu: true,
  };

  describe('#findUserById', () => {

    beforeEach(() => {
      return knex('users').insert(inserted_user)
        .then((result) => (userId = result.shift()));
    });

    afterEach(() => {
      return knex('users').delete();
    });

    describe('Success management', () => {

      it('should find a user by provided id', () => {
        return userRepository.findUserById(userId)
          .then((foundedUser) => {
            expect(foundedUser).to.exist;
            expect(foundedUser).to.be.an('object');
            expect(foundedUser.attributes.email).to.equal(inserted_user.email);
            expect(foundedUser.attributes.firstName).to.equal(inserted_user.firstName);
            expect(foundedUser.attributes.lastName).to.equal(inserted_user.lastName);
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

    beforeEach(() => {
      return knex('users').insert(inserted_user);
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
      const promise = userRepository.findByEmail(email);

      // then
      return promise.then((user) => {
        expect(user.email).to.equal(email);
      });
    });
  });

  describe('#findByEmailWithRoles', () => {
    const organization = { email, type: 'PRO', name: 'Mon Entreprise', code: 'ABCD12' };
    const organizationRole = { name: 'ADMIN' };
    const organizationAccess = {};

    beforeEach(() => {
      let organizationId, organizationRoleId;
      return knex('users').insert(inserted_user)
        .then((insertedUser) => {
          userId = insertedUser[0];
          inserted_user.id = userId;
          organizationAccess.userId = userId;
          return knex('organizations').insert(organization);
        })
        .then((insertedOrganization) => {
          organizationId = insertedOrganization[0];
          organization.id = organizationId;
          organizationAccess.organizationId = organizationId;
          return knex('organization-roles').insert(organizationRole);
        })
        .then((insertedOrganizationRole) => {
          organizationRoleId = insertedOrganizationRole[0];
          organizationRole.id = organizationRoleId;
          organizationAccess.organizationRoleId = organizationRoleId;
          return knex('organizations-accesses').insert(organizationAccess);
        })
        .then((insertedOrganizationAccess) => {
          organizationAccess.id = insertedOrganizationAccess[0];
        });
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
      const expectedUser = new User(inserted_user);

      // when
      const promise = userRepository.findByEmailWithRoles(email);

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
      const promise = userRepository.findByEmailWithRoles(email);

      // then
      return promise.then((user) => {

        expect(user.organizationsAccesses).to.be.an('array');

        const firstOrganizationAccess = user.organizationsAccesses[0];
        expect(firstOrganizationAccess).to.be.an.instanceof(OrganizationAccess);
        expect(firstOrganizationAccess.id).to.equal(organizationAccess.id);

        const accessibleOrganization = firstOrganizationAccess.organization;
        expect(accessibleOrganization).to.be.an.instanceof(Organization);
        expect(accessibleOrganization.id).to.equal(organization.id);
        expect(accessibleOrganization.code).to.equal(organization.code);
        expect(accessibleOrganization.name).to.equal(organization.name);
        expect(accessibleOrganization.type).to.equal(organization.type);
        expect(accessibleOrganization.email).to.equal(organization.email);

        const associatedRole = firstOrganizationAccess.organizationRole;
        expect(associatedRole).to.be.an.instanceof(OrganizationRole);
        expect(associatedRole.id).to.equal(organizationRole.id);
        expect(associatedRole.name).to.equal(organizationRole.name);
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

  describe('#isEmailAvailable', () => {

    beforeEach(() => {
      return knex('users').insert(inserted_user)
        .then((result) => (userId = result.shift()));
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
      const promise = userRepository.isEmailAvailable(email);

      // then
      return promise.catch(err => {
        expect(err).to.be.an.instanceOf(AlreadyRegisteredEmailError);
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

  describe('#updatePassword', () => {

    let user;

    beforeEach(() => {
      const userToSave = new User({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: 'my-email-to-save@example.net',
        password: 'Pix1024#',
        cgu: true,
      });

      return userRepository.create(userToSave)
        .then((savedUser) => {
          user = savedUser;
        });
    });

    afterEach(() => {
      return knex('users').delete();
    });

    it('should save the user', () => {
      // given
      const newPassword = '1235Pix!';

      // when
      const promise = userRepository.updatePassword(user.id, newPassword);

      // then
      return promise
        .then((updatedUser) => {
          expect(updatedUser).to.be.an.instanceOf(User);
          expect(updatedUser.password).to.equal(newPassword);
        });
    });
  });

  describe('#get', () => {

    beforeEach(() => {
      return knex('users').insert(inserted_user)
        .then((insertedIds) => (userId = insertedIds.shift()));
    });

    afterEach(() => {
      return knex('users').delete();
    });

    it('should return the found user', () => {
      // when
      const promise = userRepository.get(userId);

      // then
      return promise.then((user) => {
        expect(user).to.be.an.instanceOf(User);
        expect(user.id).to.equal(userId);
        expect(user.firstName).to.equal(inserted_user.firstName);
        expect(user.lastName).to.equal(inserted_user.lastName);
        expect(user.email).to.equal(inserted_user.email);
        expect(user.cgu).to.be.true;
        expect(user.pixRoles).to.be.an('array');
      });
    });

    it('should return a NotFoundError if no user is found', () => {
      // given
      const nonExistentUserId = 678;

      // when
      const promise = userRepository.get(nonExistentUserId);

      // then
      return expect(promise).to.be.rejectedWith(NotFoundError);
    });
  });

});

