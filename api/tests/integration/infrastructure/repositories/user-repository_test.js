const { expect, knex, databaseBuilder, domainBuilder, catchErr } = require('../../../test-helper');
const faker = require('faker');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const { NotFoundError, AlreadyRegisteredEmailError, UserNotFoundError } = require('../../../../lib/domain/errors');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const User = require('../../../../lib/domain/models/User');
const Membership = require('../../../../lib/domain/models/Membership');
const CertificationCenter = require('../../../../lib/domain/models/CertificationCenter');
const CertificationCenterMembership = require('../../../../lib/domain/models/CertificationCenterMembership');
const Organization = require('../../../../lib/domain/models/Organization');

describe('Integration | Infrastructure | Repository | UserRepository', () => {

  const userToInsert = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.exampleEmail().toLowerCase(),
    password: bcrypt.hashSync('A124B2C3#!', 1),
    cgu: true,
    samlId: 'some-saml-id',
  };

  let userInDB;
  let organizationInDB, organizationRoleInDB;
  let membershipInDB;
  let certificationCenterInDB, certificationCenterMembershipInDB;

  function _insertUserWithOrganizationsAndCertificationCenterAccesses() {
    organizationInDB = databaseBuilder.factory.buildOrganization({
      type: 'PRO',
      name: 'Mon Entreprise',
      code: 'ABCD12',
    });

    userInDB = databaseBuilder.factory.buildUser(userToInsert);
    organizationRoleInDB = Membership.roles.OWNER;

    membershipInDB = databaseBuilder.factory.buildMembership({
      userId: userInDB.id,
      organizationRole: organizationRoleInDB,
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

      afterEach(async () => {
        await databaseBuilder.clean();
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
        expect(user.memberships).to.have.lengthOf(1);

        const firstMembership = user.memberships[0];
        expect(firstMembership).to.be.an.instanceof(Membership);
        expect(firstMembership.id).to.equal(membershipInDB.id);

        const associatedOrganization = firstMembership.organization;
        expect(associatedOrganization).to.be.an.instanceof(Organization);
        expect(associatedOrganization.id).to.equal(organizationInDB.id);
        expect(associatedOrganization.code).to.equal(organizationInDB.code);
        expect(associatedOrganization.name).to.equal(organizationInDB.name);
        expect(associatedOrganization.type).to.equal(organizationInDB.type);

        expect(firstMembership.organizationRole).to.equal(membershipInDB.organizationRole);
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

      beforeEach(async () => {
        userInDb = databaseBuilder.factory.buildUser(userToInsert);
        await databaseBuilder.commit();
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should return user informations for the given SAML ID', async () => {
        // when
        const user = await userRepository.getBySamlId('some-saml-id');

        // then
        expect(user).to.be.an.instanceof(User);
        expect(user.id).to.equal(userInDb.id);
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

      beforeEach(async () => {
        userInDb = databaseBuilder.factory.buildUser(userToInsert);
        await databaseBuilder.commit();
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should return the found user', async () => {
        // when
        const user = await userRepository.get(userInDb.id);

        // then
        expect(user).to.be.an.instanceOf(User);
        expect(user.id).to.equal(userInDb.id);
        expect(user.firstName).to.equal(userInDb.firstName);
        expect(user.lastName).to.equal(userInDb.lastName);
        expect(user.email).to.equal(userInDb.email);
        expect(user.cgu).to.be.true;
        expect(user.pixRoles).to.be.an('array');
      });

      it('should return a UserNotFoundError if no user is found', async () => {
        // given
        const nonExistentUserId = 678;

        // when
        const result = await catchErr(userRepository.get)(nonExistentUserId);

        // then
        expect(result).to.be.instanceOf(UserNotFoundError);
      });
    });

    describe('#getWithMemberships', () => {

      beforeEach(async () => {
        await _insertUserWithOrganizationsAndCertificationCenterAccesses();
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should return user for the given id', async () => {
        // given
        const expectedUser = new User(userInDB);

        // when
        const user = await userRepository.getWithMemberships(userInDB.id);

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
        const user = await userRepository.getWithMemberships(userInDB.id);

        // then
        expect(user.memberships).to.be.an('array');
        expect(user.memberships).to.have.lengthOf(1);

        const membership = user.memberships[0];
        expect(membership).to.be.an.instanceof(Membership);
        expect(membership.id).to.equal(membershipInDB.id);

        const associatedOrganization = membership.organization;
        expect(associatedOrganization).to.be.an.instanceof(Organization);
        expect(associatedOrganization.id).to.equal(organizationInDB.id);
        expect(associatedOrganization.code).to.equal(organizationInDB.code);
        expect(associatedOrganization.name).to.equal(organizationInDB.name);
        expect(associatedOrganization.type).to.equal(organizationInDB.type);

        expect(membership.organizationRole).to.equal(membershipInDB.organizationRole);
      });

      it('should reject with a UserNotFound error when no user was found with the given id', async () => {
        // given
        const unknownUserId = 666;

        // when
        const result = await catchErr(userRepository.getWithMemberships)(unknownUserId);

        // then
        expect(result).to.be.instanceOf(UserNotFoundError);
      });
    });

    describe('#getWithCertificationCenterMemberships', () => {

      beforeEach(async () => {
        await _insertUserWithOrganizationsAndCertificationCenterAccesses();
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should return user for the given id', async () => {
        // given
        const expectedUser = new User(userInDB);

        // when
        const user = await userRepository.getWithCertificationCenterMemberships(userInDB.id);

        // then
        expect(user).to.be.an.instanceof(User);
        expect(user.id).to.equal(expectedUser.id);
        expect(user.firstName).to.equal(expectedUser.firstName);
        expect(user.lastName).to.equal(expectedUser.lastName);
        expect(user.email).to.equal(expectedUser.email);
        expect(user.password).to.equal(expectedUser.password);
        expect(user.cgu).to.equal(expectedUser.cgu);
      });

      it('should return certification center membership associated to the user', async () => {
        // when
        const user = await userRepository.getWithCertificationCenterMemberships(userInDB.id);

        // then
        expect(user.certificationCenterMemberships).to.be.an('array');

        const certificationCenterMembership = user.certificationCenterMemberships[0];
        expect(certificationCenterMembership).to.be.an.instanceof(CertificationCenterMembership);
        expect(certificationCenterMembership.id).to.equal(certificationCenterMembershipInDB.id);

        const associatedCertificationCenter = certificationCenterMembership.certificationCenter;
        expect(associatedCertificationCenter).to.be.an.instanceof(CertificationCenter);
        expect(associatedCertificationCenter.id).to.equal(certificationCenterInDB.id);
        expect(associatedCertificationCenter.name).to.equal(certificationCenterInDB.name);
      });

      it('should reject with a UserNotFound error when no user was found with the given id', async () => {
        // given
        const unknownUserId = 666;

        // when
        const result = await catchErr(userRepository.getWithCertificationCenterMemberships)(unknownUserId);

        // then
        expect(result).to.be.instanceOf(UserNotFoundError);
      });
    });
  });

  describe('#create', () => {

    afterEach(async () => {
      await knex('users').delete();
    });

    it('should save the user', async () => {
      // given
      const email = 'my-email-to-save@example.net';
      const user = domainBuilder.buildUser({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: email,
        password: 'Pix1024#',
        cgu: true,
      });
      user.id = undefined;

      // when
      await userRepository.create(user);

      // then
      const usersSaved = await knex('users').select();
      expect(usersSaved).to.have.lengthOf(1);
    });

    it('should return a Domain User object', async () => {
      // given
      const email = 'my-email-to-save@example.net';
      const user = domainBuilder.buildUser({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: email,
        password: 'Pix1024#',
        cgu: true,
      });
      user.id = undefined;

      // when
      const userSaved = await userRepository.create(user);

      // then
      expect(userSaved).to.be.an.instanceOf(User);
      expect(userSaved.firstName).to.equal(user.firstName);
      expect(userSaved.lastName).to.equal(user.lastName);
      expect(userSaved.email).to.equal(user.email);
      expect(userSaved.cgu).to.equal(user.cgu);
    });
  });

  describe('#isEmailAvailable', () => {

    let userInDb;

    beforeEach(async () => {
      userInDb = databaseBuilder.factory.buildUser(userToInsert);
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return the email when the email is not registered', async () => {
      // when
      const email = await userRepository.isEmailAvailable('email@example.net');

      // then
      expect(email).to.equal('email@example.net');
    });

    it('should reject an AlreadyRegisteredEmailError when it already exists', async () => {
      // when
      const result = await catchErr(userRepository.isEmailAvailable)(userInDb.email);

      // then
      expect(result).to.be.instanceOf(AlreadyRegisteredEmailError);
    });
  });

  describe('#updatePassword', () => {

    let userInDb;

    beforeEach(async () => {
      userInDb = databaseBuilder.factory.buildUser(userToInsert);
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should save the user', async () => {
      // given
      const newPassword = '1235Pix!';

      // when
      const updatedUser = await userRepository.updatePassword(userInDb.id, newPassword);

      // then
      expect(updatedUser).to.be.an.instanceOf(User);
      expect(updatedUser.password).to.equal(newPassword);
    });
  });

  describe('#updateUser', () => {

    let userToUpdate;

    beforeEach(async () => {
      userToUpdate = databaseBuilder.factory.buildUser({
        pixOrgaTermsOfServiceAccepted: false,
        pixCertifTermsOfServiceAccepted: false
      });

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should update pixOrgaTermsOfServiceAccepted field', async () => {
      // given
      userToUpdate.pixOrgaTermsOfServiceAccepted = true;

      // when
      const user = await userRepository.updateUser(userToUpdate);

      // then
      expect(user).be.instanceOf(User);
      expect(user.pixOrgaTermsOfServiceAccepted).to.be.true;

      const usersSaved = await userRepository.get(userToUpdate.id);
      expect(usersSaved.pixOrgaTermsOfServiceAccepted).to.be.true;
    });

    it('should update pixCertifTermsOfServiceAccepted field', async () => {
      // given
      userToUpdate.pixCertifTermsOfServiceAccepted = true;

      // when
      const user = await userRepository.updateUser(userToUpdate);

      // then
      expect(user).be.instanceOf(User);
      expect(user.pixCertifTermsOfServiceAccepted).to.be.true;

      const usersSaved = await userRepository.get(userToUpdate.id);
      expect(usersSaved.pixCertifTermsOfServiceAccepted).to.be.true;
    });
  });

  describe('#isUserExistingByEmail', () => {
    const email = 'shi@fu.fr';
    beforeEach(async () => {
      databaseBuilder.factory.buildUser({ email });
      databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return true when the user exists by email', async () => {
      const userExists = await userRepository.isUserExistingByEmail(email);
      expect(userExists).to.be.true;
    });

    it('should throw an error when the user does not exist by email', async () => {
      const err = await catchErr(userRepository.isUserExistingByEmail)('none');
      expect(err).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#find', () => {

    context('when there are users in the database', () => {

      beforeEach(async () => {
        _.times(3, databaseBuilder.factory.buildUser);

        await databaseBuilder.commit();
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should return an Array of Users', async () => {
        // given
        const filters = {};
        const requestedPagination = { page: 1, pageSize: 10 };
        const expectedPagination = { ...requestedPagination, pageCount: 1, rowCount: 3 };

        // when
        const { models: matchingUsers, pagination } = await userRepository.find(filters, requestedPagination);

        // then
        expect(matchingUsers).to.exist;
        expect(matchingUsers).to.have.lengthOf(3);
        expect(matchingUsers[0]).to.be.an.instanceOf(User);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are lots of users (> 10) in the database', () => {

      beforeEach(async () => {
        _.times(12, databaseBuilder.factory.buildUser);

        await databaseBuilder.commit();
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should return paginated matching users', async () => {
        // given
        const filters = {};
        const requestedPagination = { page: 1, pageSize: 3 };
        const expectedPagination = { ...requestedPagination, pageCount: 4, rowCount: 12 };

        // when
        const { models: matchingUsers, pagination } = await userRepository.find(filters, requestedPagination);

        // then
        expect(matchingUsers).to.have.lengthOf(3);
        expect(pagination).to.deep.equal(expectedPagination);
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
        const requestedPagination = { page: 1, pageSize: 10 };
        const expectedPagination = { ...requestedPagination, pageCount: 1, rowCount: 3 };

        // when
        const { models: matchingUsers, pagination } = await userRepository.find(filters, requestedPagination);

        // then
        expect(_.map(matchingUsers, 'firstName')).to.have.members(['Son Gohan', 'Son Goku', 'Son Goten']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are multiple users matching the same "last name" search pattern', () => {

      beforeEach(async () => {
        _.each([
          { firstName: 'Anakin', lastName: 'Skywalker' },
          { firstName: 'Luke', lastName: 'Skywalker' },
          { firstName: 'Leia', lastName: 'Skywalker' },
          { firstName: 'Han', lastName: 'Solo' },
          { firstName: 'Ben', lastName: 'Solo' },
        ], (user) => {
          databaseBuilder.factory.buildUser(user);
        });

        await databaseBuilder.commit();
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should return only users matching "last name" if given in filters', async () => {
        // given
        const filters = { lastName: 'walk' };
        const requestedPagination = { page: 1, pageSize: 10 };
        const expectedPagination = { ...requestedPagination, pageCount: 1, rowCount: 3 };

        // when
        const { models: matchingUsers, pagination } = await userRepository.find(filters, requestedPagination);

        // then
        expect(_.map(matchingUsers, 'firstName')).to.have.members(['Anakin', 'Luke', 'Leia']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are multiple users matching the same "email" search pattern', () => {

      beforeEach(async () => {
        _.each([
          { email: 'playpus@pix.fr' },
          { email: 'panda@pix.fr' },
          { email: 'otter@pix.fr' },
          { email: 'playpus@example.net' },
          { email: 'panda@example.net' },
        ], (user) => {
          databaseBuilder.factory.buildUser(user);
        });

        await databaseBuilder.commit();
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should return only users matching "email" if given in filters', async () => {
        // given
        const filters = { email: 'pix.fr' };
        const requestedPagination = { page: 1, pageSize: 10 };
        const expectedPagination = { ...requestedPagination, pageCount: 1, rowCount: 3 };

        // when
        const { models: matchingUsers, pagination } = await userRepository.find(filters, requestedPagination);

        // then
        expect(_.map(matchingUsers, 'email')).to.have.members(['playpus@pix.fr', 'panda@pix.fr', 'otter@pix.fr']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are multiple users matching the fields "first name", "last name" and "email" search pattern', () => {

      beforeEach(async () => {
        _.each([
          // Matching users
          { firstName: 'fn_ok_1', lastName: 'ln_ok_1', email: 'email_ok_1@mail.com' },
          { firstName: 'fn_ok_2', lastName: 'ln_ok_2', email: 'email_ok_2@mail.com' },
          { firstName: 'fn_ok_3', lastName: 'ln_ok_3', email: 'email_ok_3@mail.com' },

          // Unmatching users
          { firstName: 'fn_ko_4', lastName: 'ln_ok_4', email: 'email_ok_4@mail.com' },
          { firstName: 'fn_ok_5', lastName: 'ln_ko_5', email: 'email_ok_5@mail.com' },
          { firstName: 'fn_ok_6', lastName: 'ln_ok_6', email: 'email_ko_6@mail.com' },
        ], (user) => {
          databaseBuilder.factory.buildUser(user);
        });

        await databaseBuilder.commit();
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should return only users matching "first name" AND "last name" AND "email" if given in filters', async () => {
        // given
        const filters = { firstName: 'fn_ok', lastName: 'ln_ok', email: 'email_ok' };
        const requestedPagination = { page: 1, pageSize: 10 };
        const expectedPagination = { ...requestedPagination, pageCount: 1, rowCount: 3 };

        // when
        const { models: matchingUsers, pagination } = await userRepository.find(filters, requestedPagination);

        // then
        expect(_.map(matchingUsers, 'firstName')).to.have.members(['fn_ok_1', 'fn_ok_2', 'fn_ok_3']);
        expect(_.map(matchingUsers, 'lastName')).to.have.members(['ln_ok_1', 'ln_ok_2', 'ln_ok_3']);
        expect(_.map(matchingUsers, 'email')).to.have.members(['email_ok_1@mail.com', 'email_ok_2@mail.com', 'email_ok_3@mail.com']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are filters that should be ignored', () => {

      let firstUserId;
      let secondUserId;

      beforeEach(async () => {
        firstUserId = databaseBuilder.factory.buildUser().id;
        secondUserId = databaseBuilder.factory.buildUser().id;

        await databaseBuilder.commit();
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should ignore the filters and retrieve all users', async () => {
        // given
        const filters = { id: firstUserId };
        const requestedPagination = { page: 1, pageSize: 10 };
        const expectedPagination = { ...requestedPagination, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingUsers, pagination } = await userRepository.find(filters, requestedPagination);

        // then
        expect(_.map(matchingUsers, 'id')).to.have.members([firstUserId, secondUserId]);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

  });

});
