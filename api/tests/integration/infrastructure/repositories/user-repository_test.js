const { expect, knex, databaseBuilder, domainBuilder, catchErr } = require('../../../test-helper');
const faker = require('faker');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const {
  AlreadyRegisteredEmailError, AlreadyRegisteredUsernameError, SchoolingRegistrationAlreadyLinkedToUserError,
  NotFoundError, UserNotFoundError
} = require('../../../../lib/domain/errors');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const User = require('../../../../lib/domain/models/User');
const UserDetailForAdmin = require('../../../../lib/domain/read-models/UserDetailForAdmin');
const Membership = require('../../../../lib/domain/models/Membership');
const UserOrgaSettings = require('../../../../lib/domain/models/UserOrgaSettings');
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
    shouldChangePassword: false,
  };

  let userInDB;
  let organizationInDB, organizationRoleInDB;
  let membershipInDB;
  let userOrgaSettingsInDB;
  let certificationCenterInDB, certificationCenterMembershipInDB;

  function _insertUserWithOrganizationsAndCertificationCenterAccesses() {
    organizationInDB = databaseBuilder.factory.buildOrganization({
      type: 'PRO',
      name: 'Mon Entreprise',
      code: 'ABCD12',
    });

    userInDB = databaseBuilder.factory.buildUser(userToInsert);
    organizationRoleInDB = Membership.roles.ADMIN;

    membershipInDB = databaseBuilder.factory.buildMembership({
      userId: userInDB.id,
      organizationRole: organizationRoleInDB,
      organizationId: organizationInDB.id
    });

    userOrgaSettingsInDB = databaseBuilder.factory.buildUserOrgaSettings({
      userId: userInDB.id,
      currentOrganizationId: organizationInDB.id
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

      it('should be a function', () => {
        // then
        expect(userRepository.findByEmail).to.be.a('function');
      });

      it('should handle a rejection, when user id is not found', async () => {
        // given
        const emailThatDoesNotExist = '10093';

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

      it('should return a domain user when email case insensitive found', async () => {
        // given
        const uppercaseEmailAlreadyInDb = userInDb.email.toUpperCase();

        // when
        const user = await userRepository.findByEmail(uppercaseEmailAlreadyInDb);

        // then
        expect(user.email).to.equal(userInDb.email);
      });
    });

    describe('#getBySamlId', () => {

      let userInDb;

      beforeEach(async () => {
        userInDb = databaseBuilder.factory.buildUser(userToInsert);
        await databaseBuilder.commit();
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

    describe('#getByUsernameWithRoles', () => {

      beforeEach(() => {
        return _insertUserWithOrganizationsAndCertificationCenterAccesses();
      });

      it('should return user informations for the given email', async () => {
        // given
        const expectedUser = new User(userInDB);

        // when
        const user = await userRepository.getByUsernameOrEmailWithRoles(userInDB.email);

        // then
        expect(user).to.be.an.instanceof(User);
        expect(user.id).to.equal(expectedUser.id);
        expect(user.firstName).to.equal(expectedUser.firstName);
        expect(user.lastName).to.equal(expectedUser.lastName);
        expect(user.username).to.equal(expectedUser.username);
        expect(user.email).to.equal(expectedUser.email);
        expect(user.password).to.equal(expectedUser.password);
        expect(user.cgu).to.equal(expectedUser.cgu);
      });

      it('should return user informations for the given email (case insensitive)', async () => {
        // given
        const expectedUser = new User(userInDB);
        const uppercaseEmailAlreadyInDb = userInDB.email.toUpperCase();

        // when
        const user = await userRepository.getByUsernameOrEmailWithRoles(uppercaseEmailAlreadyInDb);

        // then
        expect(user).to.be.an.instanceof(User);
        expect(user.id).to.equal(expectedUser.id);
        expect(user.email).to.equal(expectedUser.email);
      });

      it('should return user informations for the given username', async () => {
        // given
        const expectedUser = new User(userInDB);

        // when
        const user = await userRepository.getByUsernameOrEmailWithRoles(userInDB.username);

        // then
        expect(user).to.be.an.instanceof(User);
        expect(user.id).to.equal(expectedUser.id);
        expect(user.firstName).to.equal(expectedUser.firstName);
        expect(user.lastName).to.equal(expectedUser.lastName);
        expect(user.username).to.equal(expectedUser.username);
        expect(user.email).to.equal(expectedUser.email);
        expect(user.password).to.equal(expectedUser.password);
        expect(user.cgu).to.equal(expectedUser.cgu);
      });

      it('should return membership associated to the user', async () => {
        // when
        const user = await userRepository.getByUsernameOrEmailWithRoles(userInDB.email);

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
        const user = await userRepository.getByUsernameOrEmailWithRoles(userInDB.email);

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
        const result = await catchErr(userRepository.getByUsernameOrEmailWithRoles)(unusedEmail);

        // then
        expect(result).to.be.instanceOf(UserNotFoundError);
      });

      it('should reject with a UserNotFound error when no user was found with this username', async () => {
        // given
        const unusedUsername = 'john.doe0909';

        // when
        const result = await catchErr(userRepository.getByUsernameOrEmailWithRoles)(unusedUsername);

        // then
        expect(result).to.be.instanceOf(UserNotFoundError);
      });
    });

    describe('#getWithMemberships', () => {

      beforeEach(async () => {
        await _insertUserWithOrganizationsAndCertificationCenterAccesses();
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

    describe('#getWithOrgaSettings', () => {

      beforeEach(async () => {
        await _insertUserWithOrganizationsAndCertificationCenterAccesses();
      });

      it('should return user for the given id', async () => {
        // given
        const expectedUser = new User(userInDB);

        // when
        const user = await userRepository.getWithOrgaSettings(userInDB.id);

        // then
        expect(user).to.be.an.instanceof(User);
        expect(user.id).to.equal(expectedUser.id);
        expect(user.firstName).to.equal(expectedUser.firstName);
        expect(user.lastName).to.equal(expectedUser.lastName);
        expect(user.email).to.equal(expectedUser.email);
        expect(user.password).to.equal(expectedUser.password);
        expect(user.cgu).to.equal(expectedUser.cgu);
      });

      it('should return user-orga-settings associated to the user', async () => {
        // when
        const user = await userRepository.getWithOrgaSettings(userInDB.id);

        // then
        expect(user.userOrgaSettings).to.be.an('Object');

        const userOrgaSettings = user.userOrgaSettings;
        expect(userOrgaSettings).to.be.an.instanceof(UserOrgaSettings);
        expect(userOrgaSettings.id).to.equal(userOrgaSettingsInDB.id);

        const associatedOrganization = userOrgaSettings.currentOrganization;
        expect(associatedOrganization).to.be.an.instanceof(Organization);
        expect(associatedOrganization.id).to.equal(organizationInDB.id);
        expect(associatedOrganization.code).to.equal(organizationInDB.code);
        expect(associatedOrganization.name).to.equal(organizationInDB.name);
        expect(associatedOrganization.type).to.equal(organizationInDB.type);

        expect(userOrgaSettings.organizationRole).to.equal(userOrgaSettings.organizationRole);
      });

      it('should reject with a UserNotFound error when no user was found with the given id', async () => {
        // given
        const unknownUserId = 666;

        // when
        const result = await catchErr(userRepository.getWithOrgaSettings)(unknownUserId);

        // then
        expect(result).to.be.instanceOf(UserNotFoundError);
      });
    });
  });

  describe('get user detail for administration usage', () => {

    describe('#getUserDetailForAdmin', () => {

      let userInDb;

      beforeEach(async () => {
        userInDb = databaseBuilder.factory.buildUser(userToInsert);
        await databaseBuilder.commit();
      });

      it('should return the found user', async () => {
        // when
        const userDetailForAdmin = await userRepository.getUserDetailForAdmin(userInDb.id);

        // then
        expect(userDetailForAdmin).to.be.an.instanceOf(UserDetailForAdmin);
        expect(userDetailForAdmin.id).to.equal(userInDb.id);
        expect(userDetailForAdmin.firstName).to.equal(userInDb.firstName);
        expect(userDetailForAdmin.lastName).to.equal(userInDb.lastName);
        expect(userDetailForAdmin.email).to.equal(userInDb.email);
        expect(userDetailForAdmin.cgu).to.be.true;
      });

      it('should return a UserNotFoundError if no user is found', async () => {
        // given
        const nonExistentUserId = 678;

        // when
        const result = await catchErr(userRepository.getUserDetailForAdmin)(nonExistentUserId);

        // then
        expect(result).to.be.instanceOf(UserNotFoundError);
      });
    });

    context('when user is authenticated from GAR', () => {

      let userInDb;

      beforeEach(() => {
        userInDb = databaseBuilder.factory.buildUser(userToInsert);
        return databaseBuilder.commit();
      });

      it('should return the "isAuthenticatedFromGAR" property to true', async () => {
        // when
        const userDetailForAdmin = await userRepository.getUserDetailForAdmin(userInDb.id);

        // then
        expect(userDetailForAdmin).to.be.an.instanceOf(UserDetailForAdmin);
        expect(userDetailForAdmin.cgu).to.be.true;
      });

    });

    context('when user is not authenticated from GAR', () => {

      let userInDb;
      const userNotAuthenticatedFromGAR = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.exampleEmail().toLowerCase(),
        password: bcrypt.hashSync('A124B2C3#!', 1),
        cgu: true,
        samlId: null,
      };

      beforeEach(() => {
        userInDb = databaseBuilder.factory.buildUser(userNotAuthenticatedFromGAR);
        return databaseBuilder.commit();
      });

      it('should return the "isAuthenticatedFromGAR" property to false', async () => {
        // when
        const userDetailForAdmin = await userRepository.getUserDetailForAdmin(userInDb.id);

        // then
        expect(userDetailForAdmin).to.be.an.instanceOf(UserDetailForAdmin);
        expect(userDetailForAdmin.isAuthenticatedFromGAR).to.be.false;
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

    it('should reject an AlreadyRegisteredEmailError when email case insensitive already exists', async () => {
      // given
      const uppercaseEmailAlreadyInDb = userInDb.email.toUpperCase();

      // when
      const result = await catchErr(userRepository.isEmailAvailable)(uppercaseEmailAlreadyInDb);

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

    it('should save the user', async () => {
      // given
      const newPassword = '1235Pix!';

      // when
      const updatedUser = await userRepository.updatePassword(userInDb.id, newPassword);

      // then
      expect(updatedUser).to.be.an.instanceOf(User);
      expect(updatedUser.password).to.equal(newPassword);
    });

    it('should throw UserNotFoundError when user id not found', async () => {
      // given
      const wrongUserId = 0;
      const newPassword = '1235Pix!';

      // when
      const error = await catchErr(userRepository.updatePassword)(wrongUserId, newPassword);

      // then
      expect(error).to.be.instanceOf(UserNotFoundError);
    });
  });

  describe('#updateTemporaryPassword', () => {

    let userInDb;

    beforeEach(async () => {
      userInDb = databaseBuilder.factory.buildUser(userToInsert);
      await databaseBuilder.commit();
    });

    it('should save the user', async () => {
      // given
      const generatedPassword = '1235Pix!';

      // when
      const updatedUser = await userRepository.updatePasswordThatShouldBeChanged(userInDb.id, generatedPassword);

      // then
      expect(updatedUser).to.be.an.instanceOf(User);
      expect(updatedUser.password).to.equal(generatedPassword);
      expect(updatedUser.shouldChangePassword).to.be.true;
    });

    it('should throw UserNotFoundError when user id not found', async () => {
      // given
      const wrongUserId = 0;
      const generatedPassword = '1235Pix!';

      // when
      const error = await catchErr(userRepository.updatePasswordThatShouldBeChanged)(wrongUserId, generatedPassword);

      // then
      expect(error).to.be.instanceOf(UserNotFoundError);
    });
  });

  describe('#isUserExistingByEmail', () => {
    const email = 'shi@fu.fr';

    beforeEach(() => {
      databaseBuilder.factory.buildUser({ email });
      databaseBuilder.factory.buildUser();
      return databaseBuilder.commit();
    });

    it('should return true when the user exists by email', async () => {
      const userExists = await userRepository.isUserExistingByEmail(email);
      expect(userExists).to.be.true;
    });

    it('should return true when the user exists by email (case insensitive)', async () => {
      // given
      const uppercaseEmailAlreadyInDb = email.toUpperCase();

      // when
      const userExists = await userRepository.isUserExistingByEmail(uppercaseEmailAlreadyInDb);

      // then
      expect(userExists).to.be.true;
    });

    it('should throw an error when the user does not exist by email', async () => {
      const err = await catchErr(userRepository.isUserExistingByEmail)('none');
      expect(err).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#findPaginatedFiltered', () => {

    context('when there are users in the database', () => {

      beforeEach(() => {
        _.times(3, databaseBuilder.factory.buildUser);

        return databaseBuilder.commit();
      });

      it('should return an Array of Users', async () => {
        // given
        const filter = {};
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 3 };

        // when
        const { models: matchingUsers, pagination } = await userRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(matchingUsers).to.exist;
        expect(matchingUsers).to.have.lengthOf(3);
        expect(matchingUsers[0]).to.be.an.instanceOf(User);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are lots of users (> 10) in the database', () => {

      beforeEach(() => {
        _.times(12, databaseBuilder.factory.buildUser);

        return databaseBuilder.commit();
      });

      it('should return paginated matching users', async () => {
        // given
        const filter = {};
        const page = { number: 1, size: 3 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 4, rowCount: 12 };

        // when
        const { models: matchingUsers, pagination } = await userRepository.findPaginatedFiltered({ filter, page });

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

      it('should return only users matching "first name" if given in filter', async () => {
        // given
        const filter = { firstName: 'Go' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 3 };

        // when
        const { models: matchingUsers, pagination } = await userRepository.findPaginatedFiltered({ filter, page });

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

      it('should return only users matching "last name" if given in filter', async () => {
        // given
        const filter = { lastName: 'walk' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 3 };

        // when
        const { models: matchingUsers, pagination } = await userRepository.findPaginatedFiltered({ filter, page });

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

      it('should return only users matching "email" if given in filter', async () => {
        // given
        const filter = { email: 'pix.fr' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 3 };

        // when
        const { models: matchingUsers, pagination } = await userRepository.findPaginatedFiltered({ filter, page });

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

      it('should return only users matching "first name" AND "last name" AND "email" if given in filter', async () => {
        // given
        const filter = { firstName: 'fn_ok', lastName: 'ln_ok', email: 'email_ok' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 3 };

        // when
        const { models: matchingUsers, pagination } = await userRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(_.map(matchingUsers, 'firstName')).to.have.members(['fn_ok_1', 'fn_ok_2', 'fn_ok_3']);
        expect(_.map(matchingUsers, 'lastName')).to.have.members(['ln_ok_1', 'ln_ok_2', 'ln_ok_3']);
        expect(_.map(matchingUsers, 'email')).to.have.members(['email_ok_1@mail.com', 'email_ok_2@mail.com', 'email_ok_3@mail.com']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are filter that should be ignored', () => {

      let firstUserId;
      let secondUserId;

      beforeEach(async () => {
        firstUserId = databaseBuilder.factory.buildUser().id;
        secondUserId = databaseBuilder.factory.buildUser().id;

        await databaseBuilder.commit();
      });

      it('should ignore the filter and retrieve all users', async () => {
        // given
        const filter = { id: firstUserId };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingUsers, pagination } = await userRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(_.map(matchingUsers, 'id')).to.have.members([firstUserId, secondUserId]);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

  });

  describe('#isPixMaster', () => {
    let userId;

    context('when user is pix master', () => {
      beforeEach(() => {
        userId = databaseBuilder.factory.buildUser.withPixRolePixMaster().id;
        return databaseBuilder.commit();
      });

      it('should return true', async () => {
        // when
        const isPixMaster = await userRepository.isPixMaster(userId);

        // then
        expect(isPixMaster).to.be.true;
      });

    });

    context('when user is not pix master', () => {
      beforeEach(() => {
        userId = databaseBuilder.factory.buildUser().id;
        return databaseBuilder.commit();
      });

      it('should return false', async () => {
        // when
        const isPixMaster = await userRepository.isPixMaster(userId);

        // then
        expect(isPixMaster).to.be.false;
      });
    });

  });

  describe('#updateHasSeenAssessmentInstructionsToTrue', () => {
    let userId;

    beforeEach(() => {
      userId = databaseBuilder.factory.buildUser({ hasSeenAssessmentInstructions: false }).id;
      return databaseBuilder.commit();
    });

    it('should return the model with hasSeenAssessmentInstructions flag updated to true', async () => {
      // when
      const actualUser = await userRepository.updateHasSeenAssessmentInstructionsToTrue(userId);

      // then
      expect(actualUser.hasSeenAssessmentInstructions).to.be.true;
    });

  });

  describe('#updatePixOrgaTermsOfServiceAcceptedToTrue', () => {
    let userId;

    beforeEach(() => {
      userId = databaseBuilder.factory.buildUser({ pixOrgaTermsOfServiceAccepted: false }).id;
      return databaseBuilder.commit();
    });

    it('should return the model with pixOrgaTermsOfServiceAccepted flag updated to true', async () => {
      // when
      const actualUser = await userRepository.updatePixOrgaTermsOfServiceAcceptedToTrue(userId);

      // then
      expect(actualUser.pixOrgaTermsOfServiceAccepted).to.be.true;
    });

  });

  describe('#updatePixCertifTermsOfServiceAcceptedToTrue', () => {
    let userId;

    beforeEach(() => {
      userId = databaseBuilder.factory.buildUser({ pixCertifTermsOfServiceAccepted: false }).id;
      return databaseBuilder.commit();
    });

    it('should return the model with pixCertifTermsOfServiceAccepted flag updated to true', async () => {
      // when
      const actualUser = await userRepository.updatePixCertifTermsOfServiceAcceptedToTrue(userId);

      // then
      expect(actualUser.pixCertifTermsOfServiceAccepted).to.be.true;
    });

  });

  describe('#createAndAssociateUserToSchoolingRegistration', () => {
    const email = 'jojo.lapointe@example.net';
    let schoolingRegistrationId;
    let organizationId;
    let domainUser;

    beforeEach(() => {
      // given
      organizationId = databaseBuilder.factory.buildOrganization().id;
      schoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({ userId: null, organizationId }).id;
      domainUser = domainBuilder.buildUser({ email });

      return databaseBuilder.commit();
    });

    afterEach(async () => {
      await knex('schooling-registrations').delete();
      await knex('users').delete();
    });

    context('when all goes well', function() {

      it('should create user', async () => {
        // when
        const result = await userRepository.createAndAssociateUserToSchoolingRegistration({ domainUser, schoolingRegistrationId });

        // then
        const foundUser = await knex('users').where({ email });
        expect(foundUser).to.have.lengthOf(1);
        expect(result).to.equal(foundUser[0].id);
      });

      it('should associate user to student', async () => {
        // when
        await userRepository.createAndAssociateUserToSchoolingRegistration({ domainUser, schoolingRegistrationId });

        // then
        const foundSchoolingRegistrations = await knex('schooling-registrations').where('id', schoolingRegistrationId);
        expect(foundSchoolingRegistrations[0].userId).to.not.be.undefined;
      });
    });

    context('when creation succeeds and association fails', () => {

      it('should rollback after association fails', async () => {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        schoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({ userId, organizationId }).id;
        await databaseBuilder.commit();

        // when
        const error = await catchErr(userRepository.createAndAssociateUserToSchoolingRegistration)({ domainUser, schoolingRegistrationId });

        // then
        expect(error).to.be.instanceOf(SchoolingRegistrationAlreadyLinkedToUserError);
        const foundSchoolingRegistrations = await knex('schooling-registrations').where('id', schoolingRegistrationId);
        expect(foundSchoolingRegistrations[0].userId).to.equal(userId);
        const foundUser = await knex('users').where({ email });
        expect(foundUser).to.have.lengthOf(0);
      });
    });
  });

  describe('#isUsernameAvailable', () => {

    const username = 'abc.def0101';

    it('should return username when it doesn\'t exist', async () => {
      // when
      const result = await userRepository.isUsernameAvailable(username);

      // then
      expect(result).to.equal(username);
    });

    it('should throw AlreadyRegisteredUsernameError when username already exist', async () => {
      // given
      databaseBuilder.factory.buildUser({
        username
      });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(userRepository.isUsernameAvailable)(username);

      // then
      expect(error).to.be.instanceOf(AlreadyRegisteredUsernameError);
    });
  });

  describe('#updateExpiredPassword', () => {

    let userId;

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser({ shouldChangePassword: true }).id;
      await databaseBuilder.commit();
    });

    it('should update the user\'s password and shouldChangePassword', async () => {
      // given
      const hashedNewPassword = '1235Pix!';

      // when
      const updatedUser = await userRepository.updateExpiredPassword({ userId, hashedNewPassword });

      // then
      expect(updatedUser).to.be.an.instanceOf(User);
      expect(updatedUser.password).to.equal(hashedNewPassword);
      expect(updatedUser.shouldChangePassword).to.false;
    });

    it('should throw UserNotFoundError when user id is not found', async () => {
      // given
      const wrongUserId = 0;
      const hashedNewPassword = '1235Pix!';

      // when
      const error = await catchErr(userRepository.updateExpiredPassword)({ userId: wrongUserId, hashedNewPassword });

      // then
      expect(error).to.be.instanceOf(UserNotFoundError);
    });
  });

});
