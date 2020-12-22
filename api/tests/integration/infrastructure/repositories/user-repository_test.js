/* eslint-disable no-sync */
const faker = require('faker');

const each = require('lodash/each');
const map = require('lodash/map');
const times = require('lodash/times');

const { expect, knex, databaseBuilder, domainBuilder, catchErr } = require('../../../test-helper');

const {
  AlreadyRegisteredEmailError,
  AlreadyRegisteredUsernameError,
  NotFoundError,
  UserNotFoundError,
} = require('../../../../lib/domain/errors');

const User = require('../../../../lib/domain/models/User');
const UserDetailsForAdmin = require('../../../../lib/domain/models/UserDetailsForAdmin');
const Membership = require('../../../../lib/domain/models/Membership');
const CertificationCenter = require('../../../../lib/domain/models/CertificationCenter');
const CertificationCenterMembership = require('../../../../lib/domain/models/CertificationCenterMembership');
const Organization = require('../../../../lib/domain/models/Organization');
const SchoolingRegistrationForAdmin = require('../../../../lib/domain/read-models/SchoolingRegistrationForAdmin');
const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');

const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

describe('Integration | Infrastructure | Repository | UserRepository', () => {

  const userToInsert = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.exampleEmail().toLowerCase(),
    cgu: true,
  };

  let userInDB;
  let passwordAuthenticationMethodInDB;
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
    passwordAuthenticationMethodInDB = databaseBuilder.factory.buildAuthenticationMethod.buildWithHashedPassword({
      userId: userInDB.id,
      hashedPassword: 'ABCDEF1234',
      shouldChangePassword: false,
    });

    organizationRoleInDB = Membership.roles.ADMIN;

    membershipInDB = databaseBuilder.factory.buildMembership({
      userId: userInDB.id,
      organizationRole: organizationRoleInDB,
      organizationId: organizationInDB.id,
    });

    certificationCenterInDB = databaseBuilder.factory.buildCertificationCenter();

    certificationCenterMembershipInDB = databaseBuilder.factory.buildCertificationCenterMembership({
      userId: userInDB.id,
      certificationCenterId: certificationCenterInDB.id,
    });

    return databaseBuilder.commit();
  }

  describe('find user', () => {

    describe('#getByEmail', () => {

      let userInDb;

      beforeEach(async () => {
        userInDb = databaseBuilder.factory.buildUser(userToInsert);
        await databaseBuilder.commit();
      });

      it('should be a function', () => {
        // then
        expect(userRepository.getByEmail).to.be.a('function');
      });

      it('should handle a rejection, when user id is not found', async () => {
        // given
        const emailThatDoesNotExist = '10093';

        // when
        const result = await catchErr(userRepository.getByEmail)(emailThatDoesNotExist);

        // then
        expect(result).to.be.instanceOf(NotFoundError);
      });

      it('should return a domain user when found', async () => {
        // when
        const user = await userRepository.getByEmail(userInDb.email);

        // then
        expect(user.email).to.equal(userInDb.email);
      });

      it('should return a domain user when email case insensitive found', async () => {
        // given
        const uppercaseEmailAlreadyInDb = userInDb.email.toUpperCase();

        // when
        const user = await userRepository.getByEmail(uppercaseEmailAlreadyInDb);

        // then
        expect(user.email).to.equal(userInDb.email);
      });
    });

    describe('#getBySamlId', () => {

      let userInDb;

      beforeEach(async () => {
        userInDb = databaseBuilder.factory.buildUser(userToInsert);
        databaseBuilder.factory.buildAuthenticationMethod({
          externalIdentifier: 'some-saml-id',
          identityProvider: AuthenticationMethod.identityProviders.GAR,
          userId: userInDb.id,
        });
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

    describe('#findByPoleEmploiExternalIdentifier', () => {

      const externalIdentityId = 'external-identity-id';

      let userInDb;

      beforeEach(async () => {
        userInDb = databaseBuilder.factory.buildUser();
        databaseBuilder.factory.buildAuthenticationMethod.buildPoleEmploiAuthenticationMethod({
          externalIdentifier: externalIdentityId,
          userId: userInDb.id,
        });
        await databaseBuilder.commit();
      });

      it('should return user informations for the given external identity id', async () => {
        // when
        const foundUser = await userRepository.findByPoleEmploiExternalIdentifier(externalIdentityId);

        // then
        expect(foundUser).to.be.an.instanceof(User);
        expect(foundUser.id).to.equal(userInDb.id);
      });

      it('should return undefined when no user was found with this external identity id', async () => {
        // given
        const badId = 'not-exist-external-identity-id';

        // when
        const foundUser = await userRepository.findByPoleEmploiExternalIdentifier(badId);

        // then
        return expect(foundUser).to.be.null;
      });
    });
  });

  describe('#getForObfuscation', () => {

    let userInDb;

    beforeEach(async () => {
      userInDb = databaseBuilder.factory.buildUser(userToInsert);
      await databaseBuilder.commit();
    });

    it('should return a domain user with authentication methods only when found', async () => {
      // when
      const user = await userRepository.getForObfuscation(userInDb.id);

      // then
      expect(user.username).to.equal(userInDb.username);
      expect(user.email).to.equal(userInDb.email);
    });

    it('should throw an error when user not found', async () => {
      // given
      const userIdThatDoesNotExist = '99999';

      // when
      const result = await catchErr(userRepository.getForObfuscation)(userIdThatDoesNotExist);

      // then
      expect(result).to.be.instanceOf(UserNotFoundError);
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

    describe('#getByUsernameOrEmailWithRolesAndPassword', () => {

      beforeEach(async () => {
        await _insertUserWithOrganizationsAndCertificationCenterAccesses();
      });

      it('should return user informations for the given email', async () => {
        // given
        const expectedUser = new User(userInDB);

        // when
        const foundUser = await userRepository.getByUsernameOrEmailWithRolesAndPassword(userInDB.email);

        // then
        expect(foundUser).to.be.an.instanceof(User);
        expect(foundUser.id).to.equal(expectedUser.id);
        expect(foundUser.firstName).to.equal(expectedUser.firstName);
        expect(foundUser.lastName).to.equal(expectedUser.lastName);
        expect(foundUser.username).to.equal(expectedUser.username);
        expect(foundUser.email).to.equal(expectedUser.email);
        expect(foundUser.cgu).to.equal(expectedUser.cgu);
      });

      it('should return user informations for the given email (case insensitive)', async () => {
        // given
        const expectedUser = new User(userInDB);
        const uppercaseEmailAlreadyInDb = userInDB.email.toUpperCase();

        // when
        const foundUser = await userRepository.getByUsernameOrEmailWithRolesAndPassword(uppercaseEmailAlreadyInDb);

        // then
        expect(foundUser).to.be.an.instanceof(User);
        expect(foundUser.id).to.equal(expectedUser.id);
        expect(foundUser.email).to.equal(expectedUser.email);
      });

      it('should return user informations for the given username', async () => {
        // given
        const expectedUser = new User(userInDB);

        // when
        const foundUser = await userRepository.getByUsernameOrEmailWithRolesAndPassword(userInDB.username);

        // then
        expect(foundUser).to.be.an.instanceof(User);
        expect(foundUser.id).to.equal(expectedUser.id);
        expect(foundUser.firstName).to.equal(expectedUser.firstName);
        expect(foundUser.lastName).to.equal(expectedUser.lastName);
        expect(foundUser.username).to.equal(expectedUser.username);
        expect(foundUser.email).to.equal(expectedUser.email);
        expect(foundUser.cgu).to.equal(expectedUser.cgu);
      });

      it('should return authenticationMethods associated to the user', async () => {
        // when
        const foundUser = await userRepository.getByUsernameOrEmailWithRolesAndPassword(userInDB.email);

        // then
        expect(foundUser.authenticationMethods).to.be.an('array');
        expect(foundUser.authenticationMethods).to.have.lengthOf(1);

        const firstAuthenticationMethod = foundUser.authenticationMethods[0];
        expect(firstAuthenticationMethod.identityProvider).to.equal(passwordAuthenticationMethodInDB.identityProvider);
        expect(firstAuthenticationMethod.userId).to.equal(passwordAuthenticationMethodInDB.userId);
        expect(firstAuthenticationMethod.externalIdentifier).to.equal(passwordAuthenticationMethodInDB.externalIdentifier);
        expect(firstAuthenticationMethod.authenticationComplement).to.deep.equal(passwordAuthenticationMethodInDB.authenticationComplement);
      });

      it('should return membership associated to the user', async () => {
        // when
        const user = await userRepository.getByUsernameOrEmailWithRolesAndPassword(userInDB.email);

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

      context('when the membership associated to the user has been disabled', () => {

        it('should not return the membership', async () => {
          // given
          const userInDB = databaseBuilder.factory.buildUser();
          const organizationId = databaseBuilder.factory.buildOrganization().id;
          databaseBuilder.factory.buildMembership({
            userId: userInDB.id,
            organizationId,
            disabledAt: new Date(),
          });
          await databaseBuilder.commit();

          // when
          const user = await userRepository.getByUsernameOrEmailWithRolesAndPassword(userInDB.email);

          // then
          expect(user.memberships).to.be.an('array');
          expect(user.memberships).to.be.empty;
        });
      });

      it('should return certification center membership associated to the user', async () => {
        // when
        const user = await userRepository.getByUsernameOrEmailWithRolesAndPassword(userInDB.email);

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
        const result = await catchErr(userRepository.getByUsernameOrEmailWithRolesAndPassword)(unusedEmail);

        // then
        expect(result).to.be.instanceOf(UserNotFoundError);
      });

      it('should reject with a UserNotFound error when no user was found with this username', async () => {
        // given
        const unusedUsername = 'john.doe0909';

        // when
        const result = await catchErr(userRepository.getByUsernameOrEmailWithRolesAndPassword)(unusedUsername);

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

      context('when the membership associated to the user has been disabled', () => {

        it('should not return the membership', async () => {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          const organizationId = databaseBuilder.factory.buildOrganization().id;
          databaseBuilder.factory.buildMembership({
            userId,
            organizationId,
            disabledAt: new Date(),
          });
          await databaseBuilder.commit();

          // when
          const user = await userRepository.getWithMemberships(userId);

          // then
          expect(user.memberships).to.be.an('array');
          expect(user.memberships).to.be.empty;
        });
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

  });

  describe('#getUserDetailsForAdmin', () => {

    it('should return the found user', async () => {
      // given
      const userInDB = databaseBuilder.factory.buildUser(userToInsert);
      await databaseBuilder.commit();

      // when
      const userDetailsForAdmin = await userRepository.getUserDetailsForAdmin(userInDB.id);

      // then
      expect(userDetailsForAdmin).to.be.an.instanceOf(UserDetailsForAdmin);
      expect(userDetailsForAdmin.id).to.equal(userInDB.id);
      expect(userDetailsForAdmin.firstName).to.equal(userInDB.firstName);
      expect(userDetailsForAdmin.lastName).to.equal(userInDB.lastName);
      expect(userDetailsForAdmin.email).to.equal(userInDB.email);
      expect(userDetailsForAdmin.cgu).to.be.true;
    });

    it('should return a UserNotFoundError if no user is found', async () => {
      // given
      const nonExistentUserId = 678;

      // when
      const result = await catchErr(userRepository.getUserDetailsForAdmin)(nonExistentUserId);

      // then
      expect(result).to.be.instanceOf(UserNotFoundError);
    });

    context('when user is authenticated from GAR', () => {

      it('should return the "isAuthenticatedFromGAR" property to true', async () => {
        // given
        const userInDB = databaseBuilder.factory.buildUser(userToInsert);
        await databaseBuilder.commit();

        // when
        const userDetailsForAdmin = await userRepository.getUserDetailsForAdmin(userInDB.id);

        // then
        expect(userDetailsForAdmin).to.be.an.instanceOf(UserDetailsForAdmin);
        expect(userDetailsForAdmin.cgu).to.be.true;
      });
    });

    context('when user is not authenticated from GAR', () => {

      it('should return the "isAuthenticatedFromGAR" property to false', async () => {
        // given
        const userInDB = databaseBuilder.factory.buildUser({ ...userToInsert });
        await databaseBuilder.commit();

        // when
        const userDetailsForAdmin = await userRepository.getUserDetailsForAdmin(userInDB.id);

        // then
        expect(userDetailsForAdmin).to.be.an.instanceOf(UserDetailsForAdmin);
        expect(userDetailsForAdmin.isAuthenticatedFromGAR).to.be.false;
      });

    });

    context('when user has schoolingRegistrations from SCO organization', () => {

      it('should return the user with his schoolingRegistrations', async () => {
        // given
        const userInDB = databaseBuilder.factory.buildUser(userToInsert);
        const firstOrganizationInDB = databaseBuilder.factory.buildOrganization({ type: 'SCO' });
        const firstSchoolingRegistrationInDB = databaseBuilder.factory.buildSchoolingRegistration({ id: 1, userId: userInDB.id, organizationId: firstOrganizationInDB.id });
        const secondOrganizationInDB = databaseBuilder.factory.buildOrganization({ type: 'SCO' });
        const secondSchoolingRegistrationInDB = databaseBuilder.factory.buildSchoolingRegistration({ id: 2, userId: userInDB.id, organizationId: secondOrganizationInDB.id });
        await databaseBuilder.commit();

        // when
        const userDetailsForAdmin = await userRepository.getUserDetailsForAdmin(userInDB.id);

        // then
        expect(userDetailsForAdmin.schoolingRegistrations.length).to.equal(2);

        const firstSchoolingRegistration = userDetailsForAdmin.schoolingRegistrations[0];
        expect(firstSchoolingRegistration).to.be.instanceOf(SchoolingRegistrationForAdmin);
        expect(firstSchoolingRegistration.firstName).to.equal(firstSchoolingRegistrationInDB.firstName);
        expect(firstSchoolingRegistration.lastName).to.equal(firstSchoolingRegistrationInDB.lastName);
        expect(firstSchoolingRegistration.birthdate).to.equal(firstSchoolingRegistrationInDB.birthdate);
        expect(firstSchoolingRegistration.division).to.equal(firstSchoolingRegistrationInDB.division);
        expect(firstSchoolingRegistration.organizationId).to.equal(firstOrganizationInDB.id);
        expect(firstSchoolingRegistration.organizationExternalId).to.equal(firstOrganizationInDB.externalId);
        expect(firstSchoolingRegistration.organizationName).to.equal(firstOrganizationInDB.name);
        expect(firstSchoolingRegistration.createdAt).to.deep.equal(firstSchoolingRegistrationInDB.createdAt);
        expect(firstSchoolingRegistration.updatedAt).to.deep.equal(firstSchoolingRegistrationInDB.updatedAt);

        const secondSchoolingRegistration = userDetailsForAdmin.schoolingRegistrations[1];
        expect(secondSchoolingRegistration).to.be.instanceOf(SchoolingRegistrationForAdmin);
        expect(secondSchoolingRegistration.firstName).to.equal(secondSchoolingRegistrationInDB.firstName);
        expect(secondSchoolingRegistration.lastName).to.equal(secondSchoolingRegistrationInDB.lastName);
        expect(secondSchoolingRegistration.birthdate).to.equal(secondSchoolingRegistrationInDB.birthdate);
        expect(secondSchoolingRegistration.division).to.equal(secondSchoolingRegistrationInDB.division);
        expect(secondSchoolingRegistration.organizationId).to.equal(secondOrganizationInDB.id);
        expect(secondSchoolingRegistration.organizationExternalId).to.equal(secondOrganizationInDB.externalId);
        expect(secondSchoolingRegistration.organizationName).to.equal(secondOrganizationInDB.name);
        expect(secondSchoolingRegistration.createdAt).to.deep.equal(secondSchoolingRegistrationInDB.createdAt);
        expect(secondSchoolingRegistration.updatedAt).to.deep.equal(secondSchoolingRegistrationInDB.updatedAt);
      });
    });

    context('when user has schoolingRegistrations from non-SCO organization', () => {

      it('should return the user with empty schoolingRegistrations', async () => {
        // given
        const userInDB = databaseBuilder.factory.buildUser(userToInsert);
        const firstOrganizationInDB = databaseBuilder.factory.buildOrganization({ type: 'SUP' });
        databaseBuilder.factory.buildSchoolingRegistration({ id: 1, userId: userInDB.id, organizationId: firstOrganizationInDB.id });
        const secondOrganizationInDB = databaseBuilder.factory.buildOrganization({ type: 'SUP' });
        databaseBuilder.factory.buildSchoolingRegistration({ id: 2, userId: userInDB.id, organizationId: secondOrganizationInDB.id });
        await databaseBuilder.commit();

        // when
        const userDetailsForAdmin = await userRepository.getUserDetailsForAdmin(userInDB.id);

        // then
        expect(userDetailsForAdmin.schoolingRegistrations.length).to.equal(0);
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
        cgu: true,
      });

      // when
      await userRepository.create({ user });

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
        cgu: true,
      });

      // when
      const userSaved = await userRepository.create({ user });

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

  describe('#isEmailAllowedToUseForCurrentUser', () => {

    let firstUser;
    let secondUser;

    const secondUserToInsert = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: 'alreadyexist@example.net',
      cgu: true,
      shouldChangePassword: false,
    };

    beforeEach(async () => {
      firstUser = databaseBuilder.factory.buildUser(userToInsert);
      secondUser = databaseBuilder.factory.buildUser(secondUserToInsert);
      await databaseBuilder.commit();
    });

    it('should return true when the email is not registered', async () => {
      // when
      const email = await userRepository.isEmailAllowedToUseForCurrentUser(firstUser.id, firstUser.email);

      // then
      expect(email).to.equal(true);
    });

    it('should reject an AlreadyRegisteredEmailError when it already exists for another user', async () => {
      // when
      const result = await catchErr(userRepository.isEmailAllowedToUseForCurrentUser)(firstUser.id, secondUser.email);

      // then
      expect(result).to.be.instanceOf(AlreadyRegisteredEmailError);
    });

    it('should reject an AlreadyRegisteredEmailError when email case insensitive already exists', async () => {
      // given
      const uppercaseEmailAlreadyInDb = secondUserToInsert.email.toUpperCase();

      // when
      const result = await catchErr(userRepository.isEmailAllowedToUseForCurrentUser)(firstUser.id, uppercaseEmailAlreadyInDb);

      // then
      expect(result).to.be.instanceOf(AlreadyRegisteredEmailError);
    });
  });

  describe('#updateEmail', () => {

    let userInDb;

    beforeEach(async () => {
      userInDb = databaseBuilder.factory.buildUser({ ...userToInsert, email: 'old_email@example.net' });
      await databaseBuilder.commit();
    });

    it('should update the user email', async () => {
      // given
      const newEmail = 'new_email@example.net';

      // when
      const updatedUser = await userRepository.updateEmail({ id: userInDb.id, email: newEmail });

      // then
      expect(updatedUser).to.be.an.instanceOf(User);
      expect(updatedUser.email).to.equal(newEmail);
    });

  });

  describe('#updateUserAttributes', () => {

    let userInDb;

    beforeEach(async () => {
      userInDb = databaseBuilder.factory.buildUser(userToInsert);
      await databaseBuilder.commit();
    });

    it('should update lang of the user', async () => {
      // given
      const userAttributes = {
        lang: 'en',
      };

      // when
      const updatedUser = await userRepository.updateUserAttributes(userInDb.id, userAttributes);

      // then
      expect(updatedUser).to.be.an.instanceOf(User);
      expect(updatedUser.lang).to.equal(userAttributes.lang);
    });

    it('should throw UserNotFoundError when user id not found', async () => {
      // given
      const wrongUserId = 0;

      // when
      const error = await catchErr(userRepository.updateUserAttributes)(wrongUserId, { lang: 'en' });

      // then
      expect(error).to.be.instanceOf(UserNotFoundError);
    });

  });

  describe('#updateUserDetailsForAdministration', () => {

    let userInDb;

    beforeEach(async () => {
      userInDb = databaseBuilder.factory.buildUser(userToInsert);
      databaseBuilder.factory.buildAuthenticationMethod({ identityProvider: AuthenticationMethod.identityProviders.GAR, externalIdentifier: 'samlId', userId: userInDb.id });
      await databaseBuilder.commit();
    });

    it('should update firstName,lastName,email of the user', async () => {
      // given
      const patchUserFirstNameLastNameEmail = {
        id: userInDb.id,
        firstName: 'firstname',
        lastName: 'lastname',
        email: 'firstname.lastname@example.net',
      };

      // when
      const updatedUser = await userRepository.updateUserDetailsForAdministration(userInDb.id, patchUserFirstNameLastNameEmail);

      // then
      expect(updatedUser).to.be.an.instanceOf(UserDetailsForAdmin);
      expect(updatedUser.firstName).to.equal(patchUserFirstNameLastNameEmail.firstName);
      expect(updatedUser.lastName).to.equal(patchUserFirstNameLastNameEmail.lastName);
      expect(updatedUser.email).to.equal(patchUserFirstNameLastNameEmail.email);
    });

    it('should update email of the user', async () => {
      // given
      const patchUserFirstNameLastNameEmail = {
        id: userInDb.id,
        email: 'partielupdate@hotmail.com',
      };

      // when
      const updatedUser = await userRepository.updateUserDetailsForAdministration(userInDb.id, patchUserFirstNameLastNameEmail);

      // then
      expect(updatedUser).to.be.an.instanceOf(UserDetailsForAdmin);
      expect(updatedUser.email).to.equal(patchUserFirstNameLastNameEmail.email);
    });

    it('should throw UserNotFoundError when user id not found', async () => {
      // given
      const wrongUserId = 0;
      const patchUserFirstNameLastNameEmail = {
        email: 'partielupdate@hotmail.com',
      };

      // when
      const error = await catchErr(userRepository.updateUserDetailsForAdministration)(wrongUserId, patchUserFirstNameLastNameEmail);

      // then
      expect(error).to.be.instanceOf(UserNotFoundError);
    });

  });

  describe('#updateUsername', () => {

    let userId;

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser(userToInsert).id;
      await databaseBuilder.commit();
    });

    it('should update the username', async () => {
      // given
      const username = 'blue.carter0701';

      // when
      const updatedUser = await userRepository.updateUsername({
        id: userId,
        username,
      });

      // then
      expect(updatedUser).to.be.an.instanceOf(User);
      expect(updatedUser.username).to.equal(username);
    });

    it('should throw UserNotFoundError when user id not found', async () => {
      // given
      const wrongUserId = 0;
      const username = 'blue.carter0701';

      // when
      const error = await catchErr(userRepository.updateUsername)({
        id: wrongUserId,
        username,
      });

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
        times(3, databaseBuilder.factory.buildUser);

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
        times(12, databaseBuilder.factory.buildUser);

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
        expect(map(matchingUsers, 'firstName')).to.have.members(['Son Gohan', 'Son Goku', 'Son Goten']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are multiple users matching the same "last name" search pattern', () => {

      beforeEach(async () => {
        each([
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
        expect(map(matchingUsers, 'firstName')).to.have.members(['Anakin', 'Luke', 'Leia']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are multiple users matching the same "email" search pattern', () => {

      beforeEach(async () => {
        each([
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
        expect(map(matchingUsers, 'email')).to.have.members(['playpus@pix.fr', 'panda@pix.fr', 'otter@pix.fr']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are multiple users matching the fields "first name", "last name" and "email" search pattern', () => {

      beforeEach(async () => {
        each([
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
        expect(map(matchingUsers, 'firstName')).to.have.members(['fn_ok_1', 'fn_ok_2', 'fn_ok_3']);
        expect(map(matchingUsers, 'lastName')).to.have.members(['ln_ok_1', 'ln_ok_2', 'ln_ok_3']);
        expect(map(matchingUsers, 'email')).to.have.members(['email_ok_1@mail.com', 'email_ok_2@mail.com', 'email_ok_3@mail.com']);
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
        expect(map(matchingUsers, 'id')).to.have.members([firstUserId, secondUserId]);
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

  describe('#updateHasSeenNewLevelInfoToTrue', () => {
    let userId;

    beforeEach(() => {
      userId = databaseBuilder.factory.buildUser({ hasSeenNewLevelInfo: false }).id;
      return databaseBuilder.commit();
    });

    it('should return the model with hasSeenNewLevelInfo flag updated to true', async () => {
      // when
      const actualUser = await userRepository.updateHasSeenNewLevelInfoToTrue(userId);

      // then
      expect(actualUser.hasSeenNewLevelInfo).to.be.true;
    });
  });

  describe('#acceptPixLastTermsOfService', () => {
    let userId;

    beforeEach(() => {
      userId = databaseBuilder.factory.buildUser({ mustValidateTermsOfService: true, lastTermsOfServiceValidatedAt: null }).id;
      return databaseBuilder.commit();
    });

    it('should validate the last terms of service and save the date of acceptance ', async () => {
      // when
      const actualUser = await userRepository.acceptPixLastTermsOfService(userId);

      // then
      expect(actualUser.lastTermsOfServiceValidatedAt).to.be.exist;
      expect(actualUser.lastTermsOfServiceValidatedAt).to.be.a('Date');
      expect(actualUser.mustValidateTermsOfService).to.be.false;

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
        username,
      });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(userRepository.isUsernameAvailable)(username);

      // then
      expect(error).to.be.instanceOf(AlreadyRegisteredUsernameError);
    });
  });

});
