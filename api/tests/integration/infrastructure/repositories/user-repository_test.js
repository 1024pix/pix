const { expect, knex, databaseBuilder, domainBuilder, catchErr } = require('../../../test-helper');
const faker = require('faker');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const { NotFoundError } = require('../../../../lib/domain/errors');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const { AlreadyRegisteredEmailError, UserNotFoundError } = require('../../../../lib/domain/errors');
const User = require('../../../../lib/domain/models/User');
const Membership = require('../../../../lib/domain/models/Membership');
const CertificationCenter = require('../../../../lib/domain/models/CertificationCenter');
const CertificationCenterMembership = require('../../../../lib/domain/models/CertificationCenterMembership');
const Organization = require('../../../../lib/domain/models/Organization');
const OrganizationRole = require('../../../../lib/domain/models/OrganizationRole');

describe('Integration | Infrastructure | Repository | UserRepository', () => {

  const userToInsert = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email().toLowerCase(),
    password: bcrypt.hashSync('A124B2C3#!', 1),
    cgu: true,
    samlId: 'some-saml-id',
  };
  let userInDB, organizationInDB, organizationRoleInDB, membershipInDB, certificationCenterInDB, certificationCenterMembershipInDB;

  beforeEach(() => {
    return databaseBuilder.clean();
  });

  afterEach(() => {
    return databaseBuilder.clean();
  });

  function _insertUser() {
    return knex('users')
      .insert(userToInsert)
      .returning('id')
      .then((result) => {
        userToInsert.id = result.shift();
        return userToInsert;
      });
  }

  function _insertUserWithOrganizationsAndCertificationCenterAccesses() {
    organizationInDB = databaseBuilder.factory.buildOrganization({
      type: 'PRO',
      name: 'Mon Entreprise',
      code: 'ABCD12',
    });
    userInDB = databaseBuilder.factory.buildUser(userToInsert);
    organizationRoleInDB = databaseBuilder.factory.buildOrganizationRole({ id: 1, name: 'ADMIN' });
    membershipInDB = databaseBuilder.factory.buildMembership({
      userId: userInDB.id,
      organizationRoleId: organizationRoleInDB.id,
      organizationId: organizationInDB.id
    });
    certificationCenterInDB = databaseBuilder.factory.buildCertificationCenter();
    certificationCenterMembershipInDB = databaseBuilder.factory.buildCertificationCenterMembership({
      userId: userInDB.id,
      certificationCenterId: certificationCenterInDB.id
    });

    return databaseBuilder.commit();

  }

  describe('find user', () => {

    describe('#findUserById', () => {

      let userInDb;

      beforeEach(async () => {
        userInDb = databaseBuilder.factory.buildUser(userToInsert);
        await databaseBuilder.commit();
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      describe('Success management', () => {

        it('should find a user by provided id', async () => {
          // when
          const foundedUser = await userRepository.findUserById(userInDb.id);

          // then
          expect(foundedUser).to.exist;
          expect(foundedUser).to.be.an('object');
          expect(foundedUser.attributes.email).to.equal(userInDb.email);
          expect(foundedUser.attributes.firstName).to.equal(userInDb.firstName);
          expect(foundedUser.attributes.lastName).to.equal(userInDb.lastName);
        });

        it('should handle a rejection, when user id is not found', async () => {
          // given
          const inexistenteId = 10093;

          // when
          const result = await catchErr(userRepository.findUserById)(inexistenteId);

          // then
          expect(result).to.be.instanceOf(NotFoundError);
        });
      });
    });

    describe('#findByEmail', () => {

      let userInDb;

      beforeEach(async () => {
        userInDb = databaseBuilder.factory.buildUser(userToInsert);
        await databaseBuilder.commit();
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should be a function', () => {
        // then
        expect(userRepository.findByEmail).to.be.a('function');
      });

      it('should handle a rejection, when user id is not found', async () => {
        // given
        const emailThatDoesNotExist = 10093;

        // when
        const result = await catchErr(userRepository.findByEmail)(emailThatDoesNotExist);

        // then
        expect(result).to.be.instanceOf(NotFoundError);
      });

      it('should return a domain user when found', async () => {
        // when
        const user = await userRepository.findByEmail(userInDb.email);

        // then
        expect(user.email).to.equal(userInDb.email);
      });
    });

    describe('#findByEmailWithRoles', () => {

      beforeEach(async () => {
        await _insertUserWithOrganizationsAndCertificationCenterAccesses();
      });

      afterEach(() => {
        return databaseBuilder.clean();
      });

      it('should return user informations for the given email', async () => {
        // given
        const expectedUser = new User(userInDB);

        // when
        const user = await userRepository.findByEmailWithRoles(userInDB.email);

        // then
        expect(user).to.be.an.instanceof(User);
        expect(user.id).to.equal(expectedUser.id);
        expect(user.firstName).to.equal(expectedUser.firstName);
        expect(user.lastName).to.equal(expectedUser.lastName);
        expect(user.email).to.equal(expectedUser.email);
        expect(user.password).to.equal(expectedUser.password);
        expect(user.cgu).to.equal(expectedUser.cgu);
      });

      it('should return membership associated to the user', async () => {
        // when
        const user = await userRepository.findByEmailWithRoles(userInDB.email);

        // then
        expect(user.memberships).to.be.an('array');

        const firstMembership = user.memberships[0];
        expect(firstMembership).to.be.an.instanceof(Membership);
        expect(firstMembership.id).to.equal(membershipInDB.id);

        const associatedOrganization = firstMembership.organization;
        expect(associatedOrganization).to.be.an.instanceof(Organization);
        expect(associatedOrganization.id).to.equal(organizationInDB.id);
        expect(associatedOrganization.code).to.equal(organizationInDB.code);
        expect(associatedOrganization.name).to.equal(organizationInDB.name);
        expect(associatedOrganization.type).to.equal(organizationInDB.type);

        const associatedRole = firstMembership.organizationRole;
        expect(associatedRole).to.be.an.instanceof(OrganizationRole);
        expect(associatedRole.id).to.equal(organizationRoleInDB.id);
        expect(associatedRole.name).to.equal(organizationRoleInDB.name);
      });

      it('should return certification center membership associated to the user', async () => {
        // when
        const user = await userRepository.findByEmailWithRoles(userInDB.email);

        // then
        expect(user.certificationCenterMemberships).to.be.an('array');

        const firstMembership = user.certificationCenterMemberships[0];
        expect(firstMembership).to.be.an.instanceof(CertificationCenterMembership);
        expect(firstMembership.certificationCenter.id).to.equal(certificationCenterInDB.id);
        expect(firstMembership.certificationCenter.name).to.equal(certificationCenterInDB.name);
      });

      it('should reject with a UserNotFound error when no user was found with this email', async () => {
        // given
        const unusedEmail = 'kikou@pix.fr';

        // when
        const result = await catchErr(userRepository.findByEmailWithRoles)(unusedEmail);

        // then
        expect(result).to.be.instanceOf(UserNotFoundError);
      });
    });

    describe('#getBySamlId', () => {

      let userInDb;

      beforeEach(() => {
        // given
        return _insertUser().then((insertedUser) => userInDb = insertedUser);
      });

      afterEach(() => {
        return knex('users').delete();
      });

      it('should return user informations for the given SAML ID', () => {
        // when
        const promise = userRepository.getBySamlId('some-saml-id');

        // then
        return promise.then((user) => {
          expect(user).to.be.an.instanceof(User);
          expect(user.id).to.equal(userInDb.id);
        });
      });

      it('should return undefined when no user was found with this SAML ID', async () => {
        // given
        const badSamlId = 'bad-saml-id';

        // when
        const user = await userRepository.getBySamlId(badSamlId);

        // then
        return expect(user).to.be.null;
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

    describe('#getWithMemberships', () => {

      beforeEach(async () => {
        await _insertUserWithOrganizationsAndCertificationCenterAccesses();
      });

      afterEach(() => {
        return databaseBuilder.clean();
      });

      it('should return user for the given id', () => {
        // given
        const expectedUser = new User(userInDB);

        // when
        const promise = userRepository.getWithMemberships(userInDB.id);

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

      it('should return membership associated to the user', () => {
        // when
        const promise = userRepository.getWithMemberships(userInDB.id);

        // then
        return promise.then((user) => {

          expect(user.memberships).to.be.an('array');

          const membership = user.memberships[0];
          expect(membership).to.be.an.instanceof(Membership);
          expect(membership.id).to.equal(membershipInDB.id);

          const associatedOrganization = membership.organization;
          expect(associatedOrganization).to.be.an.instanceof(Organization);
          expect(associatedOrganization.id).to.equal(organizationInDB.id);
          expect(associatedOrganization.code).to.equal(organizationInDB.code);
          expect(associatedOrganization.name).to.equal(organizationInDB.name);
          expect(associatedOrganization.type).to.equal(organizationInDB.type);

          const associatedRole = membership.organizationRole;
          expect(associatedRole).to.be.an.instanceof(OrganizationRole);
          expect(associatedRole.id).to.equal(organizationRoleInDB.id);
          expect(associatedRole.name).to.equal(organizationRoleInDB.name);
        });
      });

      it('should reject with a UserNotFound error when no user was found with the given id', () => {
        // given
        const unknownUserId = 666;

        // when
        const promise = userRepository.getWithMemberships(unknownUserId);

        // then
        return expect(promise).to.be.rejectedWith(UserNotFoundError);
      });
    });

    describe('#getWithCertificationCenterMemberships', () => {

      beforeEach(async () => {
        await _insertUserWithOrganizationsAndCertificationCenterAccesses();
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should return user for the given id', () => {
        // given
        const expectedUser = new User(userInDB);

        // when
        const promise = userRepository.getWithCertificationCenterMemberships(userInDB.id);

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

      it('should return certification center membership associated to the user', () => {
        // when
        const promise = userRepository.getWithCertificationCenterMemberships(userInDB.id);

        // then
        return promise.then((user) => {

          expect(user.certificationCenterMemberships).to.be.an('array');

          const certificationCenterMembership = user.certificationCenterMemberships[0];
          expect(certificationCenterMembership).to.be.an.instanceof(CertificationCenterMembership);
          expect(certificationCenterMembership.id).to.equal(certificationCenterMembershipInDB.id);

          const associatedCertificationCenter = certificationCenterMembership.certificationCenter;
          expect(associatedCertificationCenter).to.be.an.instanceof(CertificationCenter);
          expect(associatedCertificationCenter.id).to.equal(certificationCenterInDB.id);
          expect(associatedCertificationCenter.name).to.equal(certificationCenterInDB.name);
        });
      });

      it('should reject with a UserNotFound error when no user was found with the given id', () => {
        // given
        const unknownUserId = 666;

        // when
        const promise = userRepository.getWithCertificationCenterMemberships(unknownUserId);

        // then
        return expect(promise).to.be.rejectedWith(UserNotFoundError);
      });
    });

  });

  describe('#create', () => {

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

  describe('#updateUser', () => {

    let userToUpdate;

    beforeEach(async () => {
      userToUpdate = domainBuilder.buildUser({
        pixOrgaTermsOfServiceAccepted: true,
        pixCertifTermsOfServiceAccepted: true
      });
      databaseBuilder.factory.buildUser({
        id: userToUpdate.id,
        pixOrgaTermsOfServiceAccepted: false,
        pixCertifTermsOfServiceAccepted: false
      });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should update pixOrgaTermsOfServiceAccepted field', () => {
      // when
      const promise = userRepository.updateUser(userToUpdate);

      // then
      return promise.then((user) => {
        expect(user).be.instanceOf(User);
        expect(user.pixOrgaTermsOfServiceAccepted).to.be.true;
        knex('users').select().where({ id: userToUpdate.id })
          .then((usersSaved) => {
            expect(Boolean(usersSaved[0].pixOrgaTermsOfServiceAccepted)).to.be.true;
          });
      });
    });

    it('should update pixCertifTermsOfServiceAccepted field', () => {
      // when
      const promise = userRepository.updateUser(userToUpdate);

      // then
      return promise.then((user) => {
        expect(user).be.instanceOf(User);
        expect(user.pixCertifTermsOfServiceAccepted).to.be.true;
        knex('users').select().where({ id: userToUpdate.id })
          .then((usersSaved) => {
            expect(Boolean(usersSaved[0].pixCertifTermsOfServiceAccepted)).to.be.true;
          });
      });
    });
  });

  describe('#find', () => {

    context('when there are users in the database', () => {

      beforeEach(() => {
        _.times(3, databaseBuilder.factory.buildUser);
        return databaseBuilder.commit();
      });

      afterEach(() => {
        return databaseBuilder.clean();
      });

      it('should return an Array of Users', async () => {
        // given
        const filters = {};
        const pagination = { page: 1, pageSize: 10 };

        // when
        const promise = userRepository.find(filters, pagination);

        // then
        return promise.then((matchingUsers) => {
          expect(matchingUsers).to.exist;
          expect(matchingUsers).to.have.lengthOf(3);
          expect(matchingUsers[0]).to.be.an.instanceOf(User);
        });
      });

    });

    context('when there are lots of users (> 10) in the database', () => {

      beforeEach(() => {
        _.times(12, databaseBuilder.factory.buildUser);
        return databaseBuilder.commit();
      });

      afterEach(() => {
        return databaseBuilder.clean();
      });

      it('should return paginated matching users', async () => {
        // given
        const filters = {};
        const pagination = { page: 1, pageSize: 3 };

        // when
        const promise = userRepository.find(filters, pagination);

        // then
        return promise.then((matchingUsers) => {
          expect(matchingUsers).to.have.lengthOf(3);
        });
      });
    });

    context('when there are multiple users matching the same "first name" search pattern', () => {

      beforeEach(() => {
        databaseBuilder.factory.buildUser({ firstName: 'Son Gohan' });
        databaseBuilder.factory.buildUser({ firstName: 'Son Goku' });
        databaseBuilder.factory.buildUser({ firstName: 'Son Goten' });
        databaseBuilder.factory.buildUser({ firstName: 'Vegeta' });
        databaseBuilder.factory.buildUser({ firstName: 'Piccolo' });
        return databaseBuilder.commit();
      });

      afterEach(() => {
        return databaseBuilder.clean();
      });

      it('should return only users matching "first name" if given in filters', async () => {
        // given
        const filters = { firstName: 'Go' };
        const pagination = { page: 1, pageSize: 10 };

        // when
        const promise = userRepository.find(filters, pagination);

        // then
        return promise.then((matchingUsers) => {
          expect(_.map(matchingUsers, 'firstName')).to.have.members(['Son Gohan', 'Son Goku', 'Son Goten']);
        });
      });
    });

    context('when there are multiple users matching the same "last name" search pattern', () => {

      beforeEach(() => {
        databaseBuilder.factory.buildUser({ firstName: 'Anakin', lastName: 'Skywalker' });
        databaseBuilder.factory.buildUser({ firstName: 'Luke', lastName: 'Skywalker' });
        databaseBuilder.factory.buildUser({ firstName: 'Leia', lastName: 'Skywalker' });
        databaseBuilder.factory.buildUser({ firstName: 'Han', lastName: 'Solo' });
        databaseBuilder.factory.buildUser({ firstName: 'Ben', lastName: 'Solo' });
        return databaseBuilder.commit();
      });

      afterEach(() => {
        return databaseBuilder.clean();
      });

      it('should return only users matching "last name" if given in filters', async () => {
        // given
        const filters = { lastName: 'walk' };
        const pagination = { page: 1, pageSize: 10 };

        // when
        const promise = userRepository.find(filters, pagination);

        // then
        return promise.then((matchingUsers) => {
          expect(_.map(matchingUsers, 'firstName')).to.have.members(['Anakin', 'Luke', 'Leia']);
        });
      });
    });

    context('when there are multiple users matching the same "email" search pattern', () => {

      beforeEach(() => {
        databaseBuilder.factory.buildUser({ email: 'playpus@pix.fr' });
        databaseBuilder.factory.buildUser({ email: 'panda@pix.fr' });
        databaseBuilder.factory.buildUser({ email: 'otter@pix.fr' });
        databaseBuilder.factory.buildUser({ email: 'playpus@example.net' });
        databaseBuilder.factory.buildUser({ email: 'panda@example.net' });
        return databaseBuilder.commit();
      });

      afterEach(() => {
        return databaseBuilder.clean();
      });

      it('should return only users matching "email" if given in filters', async () => {
        // given
        const filters = { email: 'pix.fr' };
        const pagination = { page: 1, pageSize: 10 };

        // when
        const promise = userRepository.find(filters, pagination);

        // then
        return promise.then((matchingUsers) => {
          expect(_.map(matchingUsers, 'email')).to.have.members(['playpus@pix.fr', 'panda@pix.fr', 'otter@pix.fr']);
        });
      });
    });

    context('when there are multiple users matching the fields "first name", "last name" and "email" search pattern', () => {

      beforeEach(() => {
        // Matching users
        databaseBuilder.factory.buildUser({ firstName: 'fn_ok_1', lastName: 'ln_ok_1', email: 'email_ok_1@mail.com' });
        databaseBuilder.factory.buildUser({ firstName: 'fn_ok_2', lastName: 'ln_ok_2', email: 'email_ok_2@mail.com' });
        databaseBuilder.factory.buildUser({ firstName: 'fn_ok_3', lastName: 'ln_ok_3', email: 'email_ok_3@mail.com' });

        // Unmatching users
        databaseBuilder.factory.buildUser({ firstName: 'fn_ko_4', lastName: 'ln_ok_4', email: 'email_ok_4@mail.com' });
        databaseBuilder.factory.buildUser({ firstName: 'fn_ok_5', lastName: 'ln_ko_5', email: 'email_ok_5@mail.com' });
        databaseBuilder.factory.buildUser({ firstName: 'fn_ok_6', lastName: 'ln_ok_6', email: 'email_ko_6@mail.com' });

        return databaseBuilder.commit();
      });

      afterEach(() => {
        return databaseBuilder.clean();
      });

      it('should return only users matching "first name" AND "last name" AND "email" if given in filters', async () => {
        // given
        const filters = { firstName: 'fn_ok', lastName: 'ln_ok', email: 'email_ok' };
        const pagination = { page: 1, pageSize: 10 };

        // when
        const promise = userRepository.find(filters, pagination);

        // then
        return promise.then((matchingUsers) => {
          expect(_.map(matchingUsers, 'firstName')).to.have.members(['fn_ok_1', 'fn_ok_2', 'fn_ok_3']);
          expect(_.map(matchingUsers, 'lastName')).to.have.members(['ln_ok_1', 'ln_ok_2', 'ln_ok_3']);
          expect(_.map(matchingUsers, 'email')).to.have.members(['email_ok_1@mail.com', 'email_ok_2@mail.com', 'email_ok_3@mail.com']);
        });
      });
    });

    context('when there are filters that should be ignored', () => {

      beforeEach(() => {
        databaseBuilder.factory.buildUser({ id: 1 });
        databaseBuilder.factory.buildUser({ id: 2 });

        return databaseBuilder.commit();
      });

      it('should ignore the filters and retrieve all users', () => {
        // given
        const filters = { id: 1 };
        const pagination = { page: 1, pageSize: 10 };

        // when
        const promise = userRepository.find(filters, pagination);

        // then
        return promise.then((matchingUsers) => {
          expect(_.map(matchingUsers, 'id')).to.have.members([1, 2]);
        });
      });
    });

  });

  describe('#count', () => {

    context('when there are multiple users in database', () => {

      beforeEach(() => {
        _.times(8, databaseBuilder.factory.buildUser);
        return databaseBuilder.commit();
      });

      afterEach(() => {
        return databaseBuilder.clean();
      });

      it('should return the total number of Users when there is no filter', async () => {
        // given
        const filters = {};

        // when
        const promise = userRepository.count(filters);

        // then
        return promise.then((totalMatchingUsers) => {
          expect(totalMatchingUsers).to.equal(8);
        });
      });
    });

    context('when there are multiple users matching the same "email" search pattern', () => {

      beforeEach(() => {
        databaseBuilder.factory.buildUser({ email: 'playpus@pix.fr' });
        databaseBuilder.factory.buildUser({ email: 'panda@pix.fr' });
        databaseBuilder.factory.buildUser({ email: 'otter@pix.fr' });
        databaseBuilder.factory.buildUser({ email: 'playpus@example.net' });
        databaseBuilder.factory.buildUser({ email: 'panda@example.net' });
        return databaseBuilder.commit();
      });

      afterEach(() => {
        return databaseBuilder.clean();
      });

      it('should return the total number of matching Users', async () => {
        // given
        const filters = { email: 'pix.fr' };

        // when
        const promise = userRepository.count(filters);

        // then
        return promise.then((totalMatchingUsers) => {
          expect(totalMatchingUsers).to.equal(3);
        });
      });
    });
  });
});
