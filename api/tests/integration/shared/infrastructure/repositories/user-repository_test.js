import lodash from 'lodash';
const { each, map, times, pick } = lodash;
import { expect, knex, databaseBuilder, catchErr, sinon } from '../../../../test-helper.js';

import {
  AlreadyExistingEntityError,
  AlreadyRegisteredEmailError,
  AlreadyRegisteredUsernameError,
  NotFoundError,
  UserNotFoundError,
} from '../../../../../lib/domain/errors.js';

import { User } from '../../../../../lib/domain/models/User.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../lib/domain/constants/identity-providers.js';
import { UserDetailsForAdmin } from '../../../../../lib/domain/models/UserDetailsForAdmin.js';
import { Membership } from '../../../../../lib/domain/models/Membership.js';
import { CertificationCenter } from '../../../../../lib/domain/models/CertificationCenter.js';
import { CertificationCenterMembership } from '../../../../../lib/domain/models/CertificationCenterMembership.js';
import { Organization } from '../../../../../lib/domain/models/Organization.js';
import { OrganizationLearnerForAdmin } from '../../../../../lib/domain/read-models/OrganizationLearnerForAdmin.js';
import * as OidcIdentityProviders from '../../../../../lib/domain/constants/oidc-identity-providers.js';
import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import * as userRepository from '../../../../../src/shared/infrastructure/repositories/user-repository.js';

const expectedUserDetailsForAdminAttributes = [
  'id',
  'firstName',
  'lastName',
  'birthdate',
  'division',
  'group',
  'organizationId',
  'organizationName',
  'createdAt',
  'updatedAt',
  'isDisabled',
  'canBeDissociated',
];

describe('Integration | Infrastructure | Repository | UserRepository', function () {
  const userToInsert = {
    firstName: 'Jojo',
    lastName: 'LaFripouille',
    email: 'jojo@example.net',
    cgu: true,
    locale: 'fr-FR',
  };

  let userInDB;
  let passwordAuthenticationMethodInDB;
  let organizationInDB, organizationRoleInDB;
  let membershipInDB;
  let certificationCenterInDB;

  function _insertUserWithOrganizationsAndCertificationCenterAccesses() {
    organizationInDB = databaseBuilder.factory.buildOrganization({
      type: 'PRO',
      name: 'Mon Entreprise',
      code: 'ABCD12',
    });

    userInDB = databaseBuilder.factory.buildUser(userToInsert);
    passwordAuthenticationMethodInDB =
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
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

    databaseBuilder.factory.buildCertificationCenterMembership({
      userId: userInDB.id,
      certificationCenterId: certificationCenterInDB.id,
    });

    return databaseBuilder.commit();
  }

  describe('find user', function () {
    describe('#findByExternalIdentifier', function () {
      it('should return user informations for the given external identity id and identity provider', async function () {
        // given
        const externalIdentityId = 'external-identity-id';
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({
          externalIdentifier: externalIdentityId,
          userId,
        });
        await databaseBuilder.commit();

        // when
        const foundUser = await userRepository.findByExternalIdentifier({
          externalIdentityId,
          identityProvider: OidcIdentityProviders.POLE_EMPLOI.code,
        });

        // then
        expect(foundUser).to.be.an.instanceof(User);
        expect(foundUser.id).to.equal(userId);
      });

      it('should return undefined when no user was found with this external identity id', async function () {
        // given
        const badId = 'not-exist-external-identity-id';

        // when
        const foundUser = await userRepository.findByExternalIdentifier({
          externalIdentityId: badId,
          identityProvider: OidcIdentityProviders.POLE_EMPLOI.code,
        });

        // then
        return expect(foundUser).to.be.null;
      });

      it('should return null when the identity provider provided is PIX', async function () {
        // given
        const externalIdentityId = 'external-identity-id';
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
          userId,
        });
        await databaseBuilder.commit();

        // when
        const foundUser = await userRepository.findByExternalIdentifier({
          externalIdentityId,
          identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
        });

        // then
        expect(foundUser).to.be.null;
      });
    });

    describe('#findPaginatedFiltered', function () {
      context('when there are users in the database', function () {
        it('should return an array of users', async function () {
          // given
          const filter = {};
          const page = { number: 1, size: 10 };
          const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 3 };
          times(3, databaseBuilder.factory.buildUser);
          await databaseBuilder.commit();

          // when
          const { models: matchingUsers, pagination } = await userRepository.findPaginatedFiltered({ filter, page });

          // then
          expect(matchingUsers).to.exist;
          expect(matchingUsers).to.have.lengthOf(3);
          expect(matchingUsers[0]).to.be.an.instanceOf(User);
          expect(pagination).to.deep.equal(expectedPagination);
        });

        it('returns an array of users sorted by first name, last name and id', async function () {
          // Given
          const filter = {};
          const page = { number: 1, size: 10 };

          const alexTerieur = databaseBuilder.factory.buildUser({ firstName: 'Alex', lastName: 'Térieur' });
          const alainTerieur2 = databaseBuilder.factory.buildUser({
            id: 300302,
            firstName: 'Alain',
            lastName: 'Térieur',
          });
          const alainTerieur1 = databaseBuilder.factory.buildUser({
            id: 300301,
            firstName: 'Alain',
            lastName: 'Térieur',
          });
          const justinPtipeu = databaseBuilder.factory.buildUser({ firstName: 'Justin', lastName: 'Ptipeu' });
          await databaseBuilder.commit();

          // when
          const { models: matchingUsers, pagination } = await userRepository.findPaginatedFiltered({ filter, page });

          // then
          const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 4 };

          expect(matchingUsers).to.exist;
          expect(matchingUsers).to.have.lengthOf(4);
          expect(matchingUsers[0].id).to.equal(alainTerieur1.id);
          expect(`${matchingUsers[0].firstName} ${matchingUsers[0].lastName}`).to.equal(
            `${alainTerieur1.firstName} ${alainTerieur1.lastName}`,
          );
          expect(matchingUsers[1].id).to.equal(alainTerieur2.id);
          expect(`${matchingUsers[1].firstName} ${matchingUsers[1].lastName}`).to.equal(
            `${alainTerieur2.firstName} ${alainTerieur2.lastName}`,
          );
          expect(`${matchingUsers[2].firstName} ${matchingUsers[2].lastName}`).to.equal(
            `${alexTerieur.firstName} ${alexTerieur.lastName}`,
          );
          expect(`${matchingUsers[3].firstName} ${matchingUsers[3].lastName}`).to.equal(
            `${justinPtipeu.firstName} ${justinPtipeu.lastName}`,
          );
          expect(pagination).to.deep.equal(expectedPagination);
        });
      });

      it('returns only the user matching "id" if given in filter', async function () {
        // given
        const filter = { id: '123456' };
        const page = { number: 1, size: 10 };

        const nanaOsaki = databaseBuilder.factory.buildUser({
          id: 123456,
          firstName: 'Nana',
          lastName: 'Osaki',
        });
        databaseBuilder.factory.buildUser({
          id: 987654,
          firstName: 'Hachi',
          lastName: 'Komatsu',
        });
        databaseBuilder.factory.buildUser({
          id: 789123,
          firstName: 'Reira',
          lastName: 'Serizawa',
        });

        await databaseBuilder.commit();

        // when
        const { models: matchingUsers, pagination } = await userRepository.findPaginatedFiltered({ filter, page });

        // then
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 1 };

        expect(matchingUsers).to.have.lengthOf(1);
        expect(matchingUsers[0].id).to.equal(nanaOsaki.id);
        expect(pagination).to.deep.equal(expectedPagination);
      });

      context('when there are lots of users (> 10) in the database', function () {
        it('should return paginated matching users', async function () {
          // given
          const filter = {};
          const page = { number: 1, size: 3 };
          const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 4, rowCount: 12 };
          times(12, databaseBuilder.factory.buildUser);
          await databaseBuilder.commit();

          // when
          const { models: matchingUsers, pagination } = await userRepository.findPaginatedFiltered({ filter, page });

          // then
          expect(matchingUsers).to.have.lengthOf(3);
          expect(pagination).to.deep.equal(expectedPagination);
        });
      });

      context('when there are multiple users matching the same "first name" search pattern', function () {
        beforeEach(function () {
          databaseBuilder.factory.buildUser({ firstName: 'Son Gohan' });
          databaseBuilder.factory.buildUser({ firstName: 'Son Goku' });
          databaseBuilder.factory.buildUser({ firstName: 'Son Goten' });
          databaseBuilder.factory.buildUser({ firstName: 'Vegeta' });
          databaseBuilder.factory.buildUser({ firstName: 'Piccolo' });
          return databaseBuilder.commit();
        });

        it('should return only users matching "first name" if given in filter', async function () {
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

      context('when there are multiple users matching the same "last name" search pattern', function () {
        beforeEach(async function () {
          each(
            [
              { firstName: 'Anakin', lastName: 'Skywalker' },
              { firstName: 'Luke', lastName: 'Skywalker' },
              { firstName: 'Leia', lastName: 'Skywalker' },
              { firstName: 'Han', lastName: 'Solo' },
              { firstName: 'Ben', lastName: 'Solo' },
            ],
            (user) => {
              databaseBuilder.factory.buildUser(user);
            },
          );

          await databaseBuilder.commit();
        });

        it('should return only users matching "last name" if given in filter', async function () {
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

      context('when there are multiple users matching the same "email" search pattern', function () {
        beforeEach(async function () {
          each(
            [
              { email: 'playpus@pix.fr' },
              { email: 'panda@pix.fr' },
              { email: 'otter@pix.fr' },
              { email: 'playpus@example.net' },
              { email: 'panda@example.net' },
              { email: 'PANDA@example.net' },
              { email: 'PANDA@PIX.be' },
            ],
            (user) => {
              databaseBuilder.factory.buildUser(user);
            },
          );

          await databaseBuilder.commit();
        });

        it('should return only users matching "email" if given in filter even if it is in uppercase in database', async function () {
          // given
          const filter = { email: 'panda' };
          const page = { number: 1, size: 10 };
          const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 4 };

          // when
          const { models: matchingUsers, pagination } = await userRepository.findPaginatedFiltered({ filter, page });

          // then
          expect(map(matchingUsers, 'email')).to.have.members([
            'panda@pix.fr',
            'panda@example.net',
            'panda@example.net',
            'panda@pix.be',
          ]);
          expect(pagination).to.deep.equal(expectedPagination);
        });

        it('should return only users matching "email" if given in filter', async function () {
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

      context('when there are multiple users matching the same "username" search pattern', function () {
        it('should return only users matching "username" if given in filter', async function () {
          // given
          each(
            [
              { username: 'alex.ception1011' },
              { username: 'alex.terieur1011' },
              { username: 'ella.danloss0101' },
              { username: 'ella.bienhu1011' },
              { username: 'ella.bienhu2312' },
            ],
            (user) => {
              databaseBuilder.factory.buildUser(user);
            },
          );
          await databaseBuilder.commit();
          const filter = { username: '1011' };
          const page = { number: 1, size: 10 };

          // when
          const { models: matchingUsers } = await userRepository.findPaginatedFiltered({ filter, page });

          // then
          expect(map(matchingUsers, 'username')).to.have.members([
            'alex.ception1011',
            'alex.terieur1011',
            'ella.bienhu1011',
          ]);
        });
      });

      context(
        'when there are multiple users matching the fields "first name", "last name" and "email" search pattern',
        function () {
          beforeEach(async function () {
            each(
              [
                // Matching users
                {
                  firstName: 'fn_ok_1',
                  lastName: 'ln_ok_1',
                  email: 'email_ok_1@mail.com',
                  username: 'username_ok0210',
                },
                {
                  firstName: 'fn_ok_2',
                  lastName: 'ln_ok_2',
                  email: 'email_ok_2@mail.com',
                  username: 'username_ok1214',
                },
                {
                  firstName: 'fn_ok_3',
                  lastName: 'ln_ok_3',
                  email: 'email_ok_3@mail.com',
                  username: 'username_ok1010',
                },

                // Unmatching users
                {
                  firstName: 'fn_ko_4',
                  lastName: 'ln_ok_4',
                  email: 'email_ok_4@mail.com',
                  username: 'username_ko1309',
                },
                {
                  firstName: 'fn_ok_5',
                  lastName: 'ln_ko_5',
                  email: 'email_ok_5@mail.com',
                  username: 'username_ok1911',
                },
                {
                  firstName: 'fn_ok_6',
                  lastName: 'ln_ok_6',
                  email: 'email_ko_6@mail.com',
                  username: 'username_ok2010',
                },
              ],
              (user) => {
                databaseBuilder.factory.buildUser(user);
              },
            );

            await databaseBuilder.commit();
          });

          it('should return only users matching "first name" AND "last name" AND "email" AND "username" if given in filter', async function () {
            // given
            const filter = { firstName: 'fn_ok', lastName: 'ln_ok', email: 'email_ok', username: 'username_ok' };
            const page = { number: 1, size: 10 };
            const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 3 };

            // when
            const { models: matchingUsers, pagination } = await userRepository.findPaginatedFiltered({ filter, page });

            // then
            expect(map(matchingUsers, 'firstName')).to.have.members(['fn_ok_1', 'fn_ok_2', 'fn_ok_3']);
            expect(map(matchingUsers, 'lastName')).to.have.members(['ln_ok_1', 'ln_ok_2', 'ln_ok_3']);
            expect(map(matchingUsers, 'email')).to.have.members([
              'email_ok_1@mail.com',
              'email_ok_2@mail.com',
              'email_ok_3@mail.com',
            ]);
            expect(map(matchingUsers, 'username')).to.have.members([
              'username_ok0210',
              'username_ok1214',
              'username_ok1010',
            ]);
            expect(pagination).to.deep.equal(expectedPagination);
          });
        },
      );
    });

    describe('#findAnotherUserByEmail', function () {
      it('should return a list of a single user if email already used', async function () {
        // given
        const currentUser = databaseBuilder.factory.buildUser({
          email: 'current.user@example.net',
        });
        const anotherUser = databaseBuilder.factory.buildUser({
          email: 'another.user@example.net',
        });
        await databaseBuilder.commit();

        // when
        const foundUsers = await userRepository.findAnotherUserByEmail(currentUser.id, anotherUser.email);

        // then
        expect(foundUsers).to.be.an('array').that.have.lengthOf(1);
        expect(foundUsers[0]).to.be.an.instanceof(User);
        expect(foundUsers[0].email).to.equal(anotherUser.email);
      });

      it('should return a list of a single user if email case insensitive already used', async function () {
        // given
        const currentUser = databaseBuilder.factory.buildUser({
          email: 'current.user@example.net',
        });
        const anotherUser = databaseBuilder.factory.buildUser({
          email: 'another.user@example.net',
        });
        await databaseBuilder.commit();

        // when
        const foundUsers = await userRepository.findAnotherUserByEmail(currentUser.id, anotherUser.email.toUpperCase());

        // then
        expect(foundUsers).to.be.an('array').that.have.lengthOf(1);
        expect(foundUsers[0]).to.be.an.instanceof(User);
        expect(foundUsers[0].email).to.equal(anotherUser.email);
      });

      it('should return an empty list if email is not used', async function () {
        // given
        const currentUser = databaseBuilder.factory.buildUser({
          email: 'current.user@example.net',
        });
        const email = 'not.used@example.net';

        // when
        const foundUsers = await userRepository.findAnotherUserByEmail(currentUser.id, email);

        // then
        expect(foundUsers).to.be.an('array').that.is.empty;
      });
    });

    describe('#findAnotherUserByUsername', function () {
      it('should return a list of a single user if username already used', async function () {
        // given
        const currentUser = databaseBuilder.factory.buildUser({
          username: 'current.user.name',
        });
        const anotherUser = databaseBuilder.factory.buildUser({
          username: 'another.user.name',
        });
        await databaseBuilder.commit();

        // when
        const foundUsers = await userRepository.findAnotherUserByUsername(currentUser.id, anotherUser.username);

        // then
        expect(foundUsers).to.be.an('array').that.have.lengthOf(1);
        expect(foundUsers[0]).to.be.an.instanceof(User);
        expect(foundUsers[0].username).to.equal(anotherUser.username);
      });

      it('should return an empty list if username is not used', async function () {
        // given
        const currentUser = databaseBuilder.factory.buildUser({
          username: 'current.user.name',
        });
        const username = 'not.user.name';

        // when
        const foundUsers = await userRepository.findAnotherUserByUsername(currentUser.id, username);

        // then
        expect(foundUsers).to.be.an('array').that.is.empty;
      });
    });
  });

  describe('get user', function () {
    describe('#getByEmail', function () {
      it('should handle a rejection, when user id is not found', async function () {
        // given
        const emailThatDoesNotExist = '10093';

        // when
        const result = await catchErr(userRepository.getByEmail)(emailThatDoesNotExist);

        // then
        expect(result).to.be.instanceOf(NotFoundError);
      });

      it('should return the user with email case insensitive', async function () {
        // given
        const mixCaseEmail = 'USER@example.net';
        const userInDb = databaseBuilder.factory.buildUser({ email: mixCaseEmail });
        await databaseBuilder.commit();

        // when
        const user = await userRepository.getByEmail(mixCaseEmail);

        // then
        expect(user.id).to.equal(userInDb.id);
        expect(user.email).to.equal('user@example.net');
      });
    });

    describe('#getBySamlId', function () {
      let userInDb;

      beforeEach(async function () {
        userInDb = databaseBuilder.factory.buildUser(userToInsert);
        databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
          externalIdentifier: 'some-saml-id',
          userId: userInDb.id,
        });
        await databaseBuilder.commit();
      });

      it('should return user informations for the given SAML ID', async function () {
        // when
        const user = await userRepository.getBySamlId('some-saml-id');

        // then
        expect(user).to.be.an.instanceof(User);
        expect(user.id).to.equal(userInDb.id);
      });

      it('should return undefined when no user was found with this SAML ID', async function () {
        // given
        const badSamlId = 'bad-saml-id';

        // when
        const user = await userRepository.getBySamlId(badSamlId);

        // then
        return expect(user).to.be.null;
      });
    });

    describe('#get', function () {
      it('should return the found user', async function () {
        // given
        const userInDb = databaseBuilder.factory.buildUser(userToInsert);
        await databaseBuilder.commit();

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

      it('should return a UserNotFoundError if no user is found', async function () {
        // given
        const nonExistentUserId = 678;

        // when
        const result = await catchErr(userRepository.get)(nonExistentUserId);

        // then
        expect(result).to.be.instanceOf(UserNotFoundError);
      });
    });

    describe('#getById', function () {
      it('should return the found user', async function () {
        // given
        const user = databaseBuilder.factory.buildUser({
          id: 1092,
        });
        await databaseBuilder.commit();

        // when
        const result = await userRepository.getById(user.id);

        // then
        expect(result).to.be.an.instanceOf(User);
        expect(result.id).to.equal(1092);
      });

      it('should return a UserNotFoundError if no user is found', async function () {
        // given
        const nonExistentUserId = 678;

        // when
        const result = await catchErr(userRepository.getById)(nonExistentUserId);

        // then
        expect(result).to.be.instanceOf(UserNotFoundError);
      });
    });

    describe('#getByIds', function () {
      it('returns users from provided ids', async function () {
        // given
        const paul = databaseBuilder.factory.buildUser({
          firstname: 'paul',
        });
        const jacques = databaseBuilder.factory.buildUser({
          firstname: 'jacques',
        });

        await databaseBuilder.commit();

        const ids = [paul.id, jacques.id];

        // when
        const results = await userRepository.getByIds(ids);
        const resultsWithIdOnly = results.map((result) => result.id);

        // then
        expect(resultsWithIdOnly).to.have.members(ids);
      });
    });

    describe('#getByUsernameOrEmailWithRolesAndPassword', function () {
      beforeEach(async function () {
        await _insertUserWithOrganizationsAndCertificationCenterAccesses();
      });

      it('should return user informations for the given email', async function () {
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
        expect(foundUser.locale).to.equal(expectedUser.locale);
      });

      it('should return user informations for the given email (case insensitive)', async function () {
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

      it('should return user informations for the given username (case insensitive)', async function () {
        // given
        const savedUser = databaseBuilder.factory.buildUser({
          username: 'thomas123',
          firstName: 'Thomas',
          lastName: 'Dupont',
          cgu: true,
        });
        await databaseBuilder.commit();

        // when
        const foundUser = await userRepository.getByUsernameOrEmailWithRolesAndPassword('thOMas123');

        // then
        expect(foundUser).to.be.an.instanceof(User);
        expect(foundUser.id).to.equal(savedUser.id);
        expect(foundUser.firstName).to.equal(savedUser.firstName);
        expect(foundUser.lastName).to.equal(savedUser.lastName);
        expect(foundUser.username).to.equal(savedUser.username);
        expect(foundUser.email).to.equal(savedUser.email);
        expect(foundUser.cgu).to.equal(savedUser.cgu);
      });

      it('should return authenticationMethods associated to the user', async function () {
        // when
        const foundUser = await userRepository.getByUsernameOrEmailWithRolesAndPassword(userInDB.email);

        // then
        expect(foundUser.authenticationMethods).to.be.an('array');
        expect(foundUser.authenticationMethods).to.have.lengthOf(1);

        const firstAuthenticationMethod = foundUser.authenticationMethods[0];
        expect(firstAuthenticationMethod.identityProvider).to.equal(passwordAuthenticationMethodInDB.identityProvider);
        expect(firstAuthenticationMethod.userId).to.equal(passwordAuthenticationMethodInDB.userId);
        expect(firstAuthenticationMethod.externalIdentifier).to.be.null;
        expect(firstAuthenticationMethod.authenticationComplement).to.deep.equal(
          passwordAuthenticationMethodInDB.authenticationComplement,
        );
      });

      it('should only return actives certification center membership associated to the user', async function () {
        // given
        const now = new Date();
        const email = 'lilou@example.net';
        const user = databaseBuilder.factory.buildUser({ email });
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
        const otherCertificationCenter = databaseBuilder.factory.buildCertificationCenter();
        const activeCertificationCenterMembership = databaseBuilder.factory.buildCertificationCenterMembership({
          userId: user.id,
          certificationCenterId: certificationCenter.id,
        });
        databaseBuilder.factory.buildCertificationCenterMembership({
          userId: user.id,
          certificationCenterId: otherCertificationCenter.id,
          disabledAt: now,
        });
        await databaseBuilder.commit();

        // when
        const foundUser = await userRepository.getByUsernameOrEmailWithRolesAndPassword(email);

        // then
        const certificationCenterMembership = foundUser.certificationCenterMemberships[0];
        expect(foundUser.certificationCenterMemberships).to.have.lengthOf(1);
        expect(certificationCenterMembership.id).to.equal(activeCertificationCenterMembership.id);
      });

      it('should return membership associated to the user', async function () {
        // when
        const user = await userRepository.getByUsernameOrEmailWithRolesAndPassword(userInDB.email);

        // then
        expect(user.memberships).to.be.an('array');
        expect(user.memberships).to.have.lengthOf(1);

        const firstMembership = user.memberships[0];
        expect(firstMembership).to.be.an.instanceof(Membership);
        expect(firstMembership.id).to.equal(membershipInDB.id);
        expect(firstMembership.organizationRole).to.equal(membershipInDB.organizationRole);
      });

      context('when the membership associated to the user has been disabled', function () {
        it('should not return the membership', async function () {
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

      it('should return certification center membership associated to the user', async function () {
        // given
        const user = databaseBuilder.factory.buildUser({ email: 'super@example.net' });
        const certificationCenterMembershipId = databaseBuilder.factory.buildCertificationCenterMembership({
          userId: user.id,
          certificationCenterId: certificationCenterInDB.id,
        }).id;
        await databaseBuilder.commit();

        // when
        const foundUser = await userRepository.getByUsernameOrEmailWithRolesAndPassword(user.email);

        // then
        expect(foundUser.certificationCenterMemberships).to.be.an('array');

        const firstCertificationCenterMembership = foundUser.certificationCenterMemberships[0];
        expect(firstCertificationCenterMembership).to.be.an.instanceof(CertificationCenterMembership);
        expect(firstCertificationCenterMembership.id).to.equal(certificationCenterMembershipId);
      });

      it('should reject with a UserNotFound error when no user was found with this email', async function () {
        // given
        const unusedEmail = 'kikou@pix.fr';

        // when
        const result = await catchErr(userRepository.getByUsernameOrEmailWithRolesAndPassword)(unusedEmail);

        // then
        expect(result).to.be.instanceOf(UserNotFoundError);
      });

      it('should reject with a UserNotFound error when no user was found with this username', async function () {
        // given
        const unusedUsername = 'john.doe0909';

        // when
        const result = await catchErr(userRepository.getByUsernameOrEmailWithRolesAndPassword)(unusedUsername);

        // then
        expect(result).to.be.instanceOf(UserNotFoundError);
      });
    });

    describe('#getWithMemberships', function () {
      it('should return user with his/her membership(s) for the given id', async function () {
        // given
        const user = databaseBuilder.factory.buildUser.withRawPassword({
          firstName: 'Sarah',
          lastName: 'Pelle',
          email: 'sarahpelle@example.net',
          password: 'pix123',
          cgu: true,
        });
        const organizationId = databaseBuilder.factory.buildOrganization({ name: "Orga de l'année.", type: 'SUP' }).id;
        const membershipId = databaseBuilder.factory.buildMembership({
          userId: user.id,
          organizationRole: 'MEMBER',
          organizationId,
        }).id;
        await databaseBuilder.commit();

        // when
        const foundUser = await userRepository.getWithMemberships(user.id);

        // then
        expect(foundUser).to.be.an.instanceof(User);
        const expectedUserAttributes = ['id', 'firstName', 'lastName', 'email', 'password', 'cgu'];
        expect(pick(foundUser, expectedUserAttributes)).to.deep.equal({
          id: user.id,
          firstName: 'Sarah',
          lastName: 'Pelle',
          email: 'sarahpelle@example.net',
          cgu: true,
        });

        expect(foundUser.memberships).to.have.lengthOf(1);
        const membership = foundUser.memberships[0];
        expect(membership).to.be.an.instanceof(Membership);
        expect(pick(membership, ['id', 'organizationRole'])).to.deep.equal({
          id: membershipId,
          organizationRole: 'MEMBER',
        });

        const associatedOrganization = membership.organization;
        expect(associatedOrganization).to.be.an.instanceof(Organization);
        expect(pick(associatedOrganization, ['id', 'name', 'type'])).to.deep.equal({
          id: organizationId,
          name: "Orga de l'année.",
          type: 'SUP',
        });
      });

      context('when the membership associated to the user has been disabled', function () {
        it('should not return the membership', async function () {
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

      it('should reject with a UserNotFound error when no user was found with the given id', async function () {
        // given
        const unknownUserId = 666;

        // when
        const result = await catchErr(userRepository.getWithMemberships)(unknownUserId);

        // then
        expect(result).to.be.instanceOf(UserNotFoundError);
      });
    });

    describe('#getWithCertificationCenterMemberships', function () {
      it('should return user for the given id', async function () {
        // given
        await _insertUserWithOrganizationsAndCertificationCenterAccesses();
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

      it('should return actives certification center membership associated to the user', async function () {
        // when
        const userInDB = databaseBuilder.factory.buildUser(userToInsert);
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
        const otherCertificationCenter = databaseBuilder.factory.buildCertificationCenter();
        const certificationCenterMembership = databaseBuilder.factory.buildCertificationCenterMembership({
          userId: userInDB.id,
          certificationCenterId: certificationCenter.id,
        });
        databaseBuilder.factory.buildCertificationCenterMembership({
          userId: userInDB.id,
          certificationCenterId: otherCertificationCenter.id,
          disabledAt: new Date(),
        });

        await databaseBuilder.commit();

        // when
        const user = await userRepository.getWithCertificationCenterMemberships(userInDB.id);

        // then
        expect(user.certificationCenterMemberships.length).to.equal(1);

        const foundCertificationCenterMembership = user.certificationCenterMemberships[0];
        expect(foundCertificationCenterMembership).to.be.an.instanceof(CertificationCenterMembership);
        expect(foundCertificationCenterMembership.id).to.equal(certificationCenterMembership.id);

        const associatedCertificationCenter = foundCertificationCenterMembership.certificationCenter;
        expect(associatedCertificationCenter).to.be.an.instanceof(CertificationCenter);
        expect(associatedCertificationCenter.id).to.equal(certificationCenter.id);
        expect(associatedCertificationCenter.name).to.equal(certificationCenter.name);
      });

      it('should reject with a UserNotFound error when no user was found with the given id', async function () {
        // given
        await _insertUserWithOrganizationsAndCertificationCenterAccesses();
        const unknownUserId = 666;

        // when
        const result = await catchErr(userRepository.getWithCertificationCenterMemberships)(unknownUserId);

        // then
        expect(result).to.be.instanceOf(UserNotFoundError);
      });
    });

    describe('#getForObfuscation', function () {
      it('should return a domain user with authentication methods only when found', async function () {
        // given
        const userInDb = databaseBuilder.factory.buildUser(userToInsert);
        await databaseBuilder.commit();

        // when
        const user = await userRepository.getForObfuscation(userInDb.id);

        // then
        expect(user.username).to.equal(userInDb.username);
        expect(user.email).to.equal(userInDb.email);
      });

      it('should throw an error when user not found', async function () {
        // given
        const userIdThatDoesNotExist = '99999';

        // when
        const result = await catchErr(userRepository.getForObfuscation)(userIdThatDoesNotExist);

        // then
        expect(result).to.be.instanceOf(UserNotFoundError);
      });
    });

    describe('#getUserDetailsForAdmin', function () {
      it('should return the found user', async function () {
        // given
        const emailConfirmedAt = new Date('2022-01-01');
        const lastTermsOfServiceValidatedAt = new Date('2022-01-02');
        const lastPixOrgaTermsOfServiceValidatedAt = new Date('2022-01-03');
        const lastLoggedAt = new Date('2022-01-04');
        const now = new Date();
        const userInDB = databaseBuilder.factory.buildUser({
          firstName: 'Henri',
          lastName: 'Cochet',
          email: 'henri-cochet@example.net',
          cgu: true,
          lang: 'en',
          locale: 'en',
          createdAt: now,
          updatedAt: now,
          lastTermsOfServiceValidatedAt,
          lastPixOrgaTermsOfServiceValidatedAt,
          lastPixCertifTermsOfServiceValidatedAt: lastLoggedAt,
          emailConfirmedAt,
        });
        await databaseBuilder.factory.buildUserLogin({ userId: userInDB.id, lastLoggedAt });
        await databaseBuilder.commit();

        // when
        const userDetailsForAdmin = await userRepository.getUserDetailsForAdmin(userInDB.id);

        // then
        expect(userDetailsForAdmin).to.be.an.instanceOf(UserDetailsForAdmin);
        expect(userDetailsForAdmin.id).to.equal(userInDB.id);
        expect(userDetailsForAdmin.firstName).to.equal('Henri');
        expect(userDetailsForAdmin.lastName).to.equal('Cochet');
        expect(userDetailsForAdmin.email).to.equal('henri-cochet@example.net');
        expect(userDetailsForAdmin.cgu).to.be.true;
        expect(userDetailsForAdmin.createdAt).to.deep.equal(now);
        expect(userDetailsForAdmin.updatedAt).to.deep.equal(now);
        expect(userDetailsForAdmin.lang).to.equal('en');
        expect(userDetailsForAdmin.locale).to.equal('en');
        expect(userDetailsForAdmin.lastTermsOfServiceValidatedAt).to.deep.equal(lastTermsOfServiceValidatedAt);
        expect(userDetailsForAdmin.lastPixOrgaTermsOfServiceValidatedAt).to.deep.equal(
          lastPixOrgaTermsOfServiceValidatedAt,
        );
        expect(userDetailsForAdmin.lastPixCertifTermsOfServiceValidatedAt).to.deep.equal(lastLoggedAt);
        expect(userDetailsForAdmin.lastLoggedAt).to.deep.equal(lastLoggedAt);
        expect(userDetailsForAdmin.emailConfirmedAt).to.deep.equal(emailConfirmedAt);
        expect(userDetailsForAdmin.hasBeenAnonymised).to.be.false;
      });

      it('should return a UserNotFoundError if no user is found', async function () {
        // given
        const nonExistentUserId = 678;

        // when
        const result = await catchErr(userRepository.getUserDetailsForAdmin)(nonExistentUserId);

        // then
        expect(result).to.be.instanceOf(UserNotFoundError);
      });

      context('when user has organizationLearners', function () {
        it('should return the user with his organizationLearner', async function () {
          // given
          const randomUser = databaseBuilder.factory.buildUser();
          const userInDB = databaseBuilder.factory.buildUser(userToInsert);
          const firstOrganizationInDB = databaseBuilder.factory.buildOrganization();
          const firstOrganizationLearnerInDB = databaseBuilder.factory.buildOrganizationLearner({
            id: 1,
            userId: userInDB.id,
            organizationId: firstOrganizationInDB.id,
          });
          const secondOrganizationInDB = databaseBuilder.factory.buildOrganization();
          const secondOrganizationLearnerInDB = databaseBuilder.factory.buildOrganizationLearner({
            id: 2,
            userId: userInDB.id,
            organizationId: secondOrganizationInDB.id,
          });
          databaseBuilder.factory.buildOrganizationLearner({
            id: 3,
            userId: randomUser.id,
            organizationId: firstOrganizationInDB.id,
          });
          await databaseBuilder.commit();

          // when
          const userDetailsForAdmin = await userRepository.getUserDetailsForAdmin(userInDB.id);

          // then
          expect(userDetailsForAdmin.organizationLearners.length).to.equal(2);
          const organizationLearners = userDetailsForAdmin.organizationLearners;
          expect(organizationLearners[0]).to.be.instanceOf(OrganizationLearnerForAdmin);

          const expectedOrganizationLearners = [
            {
              ...firstOrganizationLearnerInDB,
              organizationName: firstOrganizationInDB.name,
              canBeDissociated: firstOrganizationInDB.isManagingStudents,
            },
            {
              ...secondOrganizationLearnerInDB,
              organizationName: secondOrganizationInDB.name,
              canBeDissociated: secondOrganizationInDB.isManagingStudents,
            },
          ].map((organizationLearner) => pick(organizationLearner, expectedUserDetailsForAdminAttributes));
          expect(organizationLearners).to.deep.equal(expectedOrganizationLearners);
        });
      });

      context("when user doesn't have organizationLearners", function () {
        it('should return the user with an empty array', async function () {
          // given
          const userInDB = databaseBuilder.factory.buildUser(userToInsert);
          await databaseBuilder.commit();

          // when
          const userDetailsForAdmin = await userRepository.getUserDetailsForAdmin(userInDB.id);

          // then
          expect(userDetailsForAdmin.organizationLearners.length).to.equal(0);
        });
      });

      context('when user has authentication methods (PIX + GAR)', function () {
        it('returns the user with his authentication methods', async function () {
          // given
          const userInDB = databaseBuilder.factory.buildUser(userToInsert);
          const expectedPixAuthenticationMethod =
            databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
              userId: userInDB.id,
            });
          databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({ userId: userInDB.id });
          await databaseBuilder.commit();

          // when
          const userDetailsForAdmin = await userRepository.getUserDetailsForAdmin(userInDB.id);

          // then
          const pixAuthenticationMethod = userDetailsForAdmin.authenticationMethods.find(
            ({ identityProvider }) => identityProvider === NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
          );
          expect(userDetailsForAdmin.authenticationMethods.length).to.equal(2);
          expect(pixAuthenticationMethod).to.deep.equal({
            authenticationComplement: {
              shouldChangePassword: false,
            },
            id: expectedPixAuthenticationMethod.id,
            identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
          });
        });
      });

      context('when user is anonymized', function () {
        it('should return an empty array of authenticationMethods', async function () {
          // given
          const userInDB = databaseBuilder.factory.buildUser({
            ...userToInsert,
            hasBeenAnonymised: true,
            hasBeenAnonymisedBy: 1,
          });
          await databaseBuilder.commit();

          // when
          const userDetailsForAdmin = await userRepository.getUserDetailsForAdmin(userInDB.id);

          // then
          expect(userDetailsForAdmin.authenticationMethods.length).to.equal(0);
          expect(userDetailsForAdmin.hasBeenAnonymised).to.be.true;

          const { hasBeenAnonymisedBy } = await knex('users').where({ id: userInDB.id }).first();
          expect(hasBeenAnonymisedBy).to.equal(1);
        });

        it("should return the anonymisedBy's first and last names", async function () {
          // given
          const adminWhoAnonymisedUser = databaseBuilder.factory.buildUser({
            id: 1,
            firstName: 'Laurent',
            lastName: 'Gina',
          });
          const userInDB = databaseBuilder.factory.buildUser({
            ...userToInsert,
            id: 2,
            hasBeenAnonymised: true,
            hasBeenAnonymisedBy: adminWhoAnonymisedUser.id,
          });
          await databaseBuilder.commit();

          // when
          const userDetailsForAdmin = await userRepository.getUserDetailsForAdmin(userInDB.id);

          // then
          expect(userDetailsForAdmin.anonymisedByFirstName).to.equal('Laurent');
          expect(userDetailsForAdmin.anonymisedByLastName).to.equal('Gina');
        });
      });

      context('when user has login details', function () {
        let clock;
        const now = new Date('2022-02-02');

        beforeEach(function () {
          clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
        });

        afterEach(function () {
          clock.restore();
        });

        it('should return the user with his login details', async function () {
          // given
          const userInDB = databaseBuilder.factory.buildUser(userToInsert);
          databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
            userId: userInDB.id,
          });
          databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({ userId: userInDB.id });
          databaseBuilder.factory.buildUserLogin({
            id: 12345,
            userId: userInDB.id,
            failureCount: 5,
          });
          await databaseBuilder.commit();

          // when
          const userDetailsForAdmin = await userRepository.getUserDetailsForAdmin(userInDB.id);

          // then
          expect(userDetailsForAdmin.userLogin).to.deep.include({
            id: 12345,
            blockedAt: null,
            temporaryBlockedUntil: null,
            failureCount: 5,
          });
        });
      });
    });
  });

  describe('update user', function () {
    describe('#update', function () {
      let clock;
      const now = new Date('2021-01-02');

      beforeEach(function () {
        clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
      });

      afterEach(function () {
        clock.restore();
      });

      it('updates the given properties', async function () {
        // given
        const user = databaseBuilder.factory.buildUser();
        await databaseBuilder.commit();

        // when
        await userRepository.update({ id: user.id, email: 'chronos@example.net', locale: 'fr-BE' });
        const fetchedUser = await knex.from('users').where({ id: user.id }).first();

        // then
        expect(fetchedUser.updatedAt).to.deep.equal(new Date('2021-01-02'));
        expect(fetchedUser.email).to.equal('chronos@example.net');
        expect(fetchedUser.locale).to.equal('fr-BE');
      });
    });

    describe('#updateEmail', function () {
      it('should update the user email', async function () {
        // given
        const newEmail = 'new_email@example.net';
        const userInDb = databaseBuilder.factory.buildUser({ ...userToInsert, email: 'old_email@example.net' });
        await databaseBuilder.commit();

        // when
        const updatedUser = await userRepository.updateEmail({ id: userInDb.id, email: newEmail });

        // then
        expect(updatedUser).to.be.an.instanceOf(User);
        expect(updatedUser.email).to.equal(newEmail);
      });
    });

    describe('#updateWithEmailConfirmed', function () {
      let userInDb;

      beforeEach(async function () {
        userInDb = databaseBuilder.factory.buildUser({ ...userToInsert, email: 'old_email@example.net', cgu: false });
        await databaseBuilder.commit();
      });

      it('should update the user email', async function () {
        // given
        const newEmail = 'new_email@example.net';
        const userAttributes = {
          cgu: true,
          email: newEmail,
          emailConfirmedAt: new Date('2020-12-15T00:00:00Z'),
        };

        // when
        await userRepository.updateWithEmailConfirmed({ id: userInDb.id, userAttributes });

        // then
        const [updatedUser] = await knex('users').where({ id: userInDb.id });
        expect(updatedUser.emailConfirmedAt.toString()).to.equal(userAttributes.emailConfirmedAt.toString());
        expect(updatedUser.email).to.equal(userAttributes.email);
        expect(updatedUser.cgu).to.equal(userAttributes.cgu);
      });

      it('should rollback the user email in case of error in transaction', async function () {
        // given
        const newEmail = 'new_email@example.net';
        const userAttributes = {
          cgu: true,
          email: newEmail,
          emailConfirmedAt: new Date('2020-12-15T00:00:00Z'),
        };

        // when
        await catchErr(async () => {
          await DomainTransaction.execute(async (domainTransaction) => {
            await userRepository.updateWithEmailConfirmed({ id: userInDb.id, userAttributes }, domainTransaction);
            throw new Error('Error occurs in transaction');
          });
        });

        // then
        const [updatedUser] = await knex('users').where({ id: userInDb.id });
        expect(updatedUser.emailConfirmedAt).to.be.null;
        expect(updatedUser.email).to.equal(userInDb.email);
        expect(updatedUser.cgu).to.be.false;
      });
    });

    describe('#updateUserDetailsForAdministration', function () {
      it('updates firstName, lastName, email, username and locale of the user', async function () {
        // given
        const userInDb = databaseBuilder.factory.buildUser(userToInsert);
        databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
          externalIdentifier: 'samlId',
          userId: userInDb.id,
        });
        await databaseBuilder.commit();

        // when
        const userPropertiesToUpdate = {
          firstName: 'prenom_123',
          lastName: 'nom_123',
          email: 'email_123@example.net',
          username: 'username_123',
          locale: 'fr-FR',
        };
        await userRepository.updateUserDetailsForAdministration({
          id: userInDb.id,
          userAttributes: userPropertiesToUpdate,
        });

        // then
        const updatedUser = await knex('users').where({ id: userInDb.id }).first();
        expect(updatedUser.firstName).to.equal('prenom_123');
        expect(updatedUser.lastName).to.equal('nom_123');
        expect(updatedUser.email).to.equal('email_123@example.net');
        expect(updatedUser.username).to.equal('username_123');
        expect(updatedUser.locale).to.equal('fr-FR');
      });

      it('should throw AlreadyExistingEntityError when username is already used', async function () {
        // given
        databaseBuilder.factory.buildUser({
          email: null,
          username: 'already.exist.username',
        });
        const userId = databaseBuilder.factory.buildUser({
          email: null,
          username: 'current.username',
        }).id;
        await databaseBuilder.commit();

        // when
        const userPropertiesToUpdate = {
          username: 'already.exist.username',
        };
        const error = await catchErr(userRepository.updateUserDetailsForAdministration)({
          id: userId,
          userAttributes: userPropertiesToUpdate,
        });

        // then
        expect(error).to.be.instanceOf(AlreadyExistingEntityError);
        expect(error.message).to.equal('Cette adresse e-mail ou cet identifiant est déjà utilisé(e).');
      });

      it('should throw UserNotFoundError when user id not found', async function () {
        // given
        const wrongUserId = 0;

        // when
        const userPropertiesToUpdate = {
          email: 'partielupdate@hotmail.com',
        };
        const error = await catchErr(userRepository.updateUserDetailsForAdministration)({
          id: wrongUserId,
          userAttributes: userPropertiesToUpdate,
        });

        // then
        expect(error).to.be.instanceOf(UserNotFoundError);
      });
    });

    describe('#updateUsername', function () {
      it('should update the username', async function () {
        // given
        const username = 'blue.carter0701';
        const userId = databaseBuilder.factory.buildUser(userToInsert).id;
        await databaseBuilder.commit();

        // when
        const updatedUser = await userRepository.updateUsername({
          id: userId,
          username,
        });

        // then
        expect(updatedUser).to.be.an.instanceOf(User);
        expect(updatedUser.username).to.equal(username);
      });

      it('should throw UserNotFoundError when user id not found', async function () {
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

    describe('#updatePixOrgaTermsOfServiceAcceptedToTrue', function () {
      let clock;
      const now = new Date('2021-01-02');

      beforeEach(function () {
        clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
      });

      afterEach(function () {
        clock.restore();
      });

      it('should return the model with pixOrgaTermsOfServiceAccepted flag updated to true', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser({ pixOrgaTermsOfServiceAccepted: false }).id;
        await databaseBuilder.commit();

        // when
        const result = await userRepository.updatePixOrgaTermsOfServiceAcceptedToTrue(userId);

        // then
        expect(result).to.be.an.instanceof(User);
        expect(result.pixOrgaTermsOfServiceAccepted).to.be.true;
      });

      it('should update the lastPixOrgaTermsOfServiceValidatedAt', async function () {
        // given
        const user = databaseBuilder.factory.buildUser({
          pixOrgaTermsOfServiceAccepted: true,
          lastPixOrgaTermsOfServiceValidatedAt: new Date('2020-01-01T00:00:00Z'),
        });
        await databaseBuilder.commit();

        // when
        const result = await userRepository.updatePixOrgaTermsOfServiceAcceptedToTrue(user.id);

        // then
        expect(result.lastPixOrgaTermsOfServiceValidatedAt).to.deep.equal(now);
      });
    });

    describe('#updatePixCertifTermsOfServiceAcceptedToTrue', function () {
      let clock;
      const now = new Date('2021-01-02');

      beforeEach(function () {
        clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
      });

      afterEach(function () {
        clock.restore();
      });

      it('should return the model with pixCertifTermsOfServiceAccepted flag updated to true', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser({ pixCertifTermsOfServiceAccepted: false }).id;
        await databaseBuilder.commit();

        // when
        const actualUser = await userRepository.updatePixCertifTermsOfServiceAcceptedToTrue(userId);

        // then
        expect(actualUser).to.be.an.instanceof(User);
        expect(actualUser.pixCertifTermsOfServiceAccepted).to.be.true;
      });

      it('should update the pixCertifTermsOfServiceValidatedAt', async function () {
        // given
        const user = databaseBuilder.factory.buildUser({
          pixCertifTermsOfServiceAccepted: true,
          lastPixCertifTermsOfServiceValidatedAt: new Date('2020-01-01T00:00:00Z'),
        });
        await databaseBuilder.commit();

        // when
        const actualUser = await userRepository.updatePixCertifTermsOfServiceAcceptedToTrue(user.id);

        // then
        expect(actualUser.lastPixCertifTermsOfServiceValidatedAt).to.deep.equal(now);
      });
    });

    describe('#updateHasSeenAssessmentInstructionsToTrue', function () {
      it('should return the model with hasSeenAssessmentInstructions flag updated to true', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser({ hasSeenAssessmentInstructions: false }).id;
        await databaseBuilder.commit();

        // when
        const actualUser = await userRepository.updateHasSeenAssessmentInstructionsToTrue(userId);

        // then
        expect(actualUser.hasSeenAssessmentInstructions).to.be.true;
      });
    });

    describe('#updateHasSeenNewDashboardInfoToTrue', function () {
      it('should return the model with hasSeenNewDashboardInfo flag updated to true', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser({ hasSeenNewDashboardInfo: false }).id;
        await databaseBuilder.commit();

        // when
        const actualUser = await userRepository.updateHasSeenNewDashboardInfoToTrue(userId);

        // then
        expect(actualUser.hasSeenNewDashboardInfo).to.be.true;
      });
    });

    describe('#updateHasSeenChallengeTooltip', function () {
      let userId;

      beforeEach(function () {
        userId = databaseBuilder.factory.buildUser({
          hasSeenFocusedChallengeTooltip: false,
          hasSeenOtherChallengesTooltip: false,
        }).id;
        return databaseBuilder.commit();
      });

      it('should return the model with hasSeenFocusedChallengeTooltip flag updated to true', async function () {
        // when
        const challengeType = 'focused';
        const actualUser = await userRepository.updateHasSeenChallengeTooltip({ userId, challengeType });

        // then
        expect(actualUser.hasSeenFocusedChallengeTooltip).to.be.true;
      });

      it('should return the model with hasSeenOtherChallengesTooltip flag updated to true', async function () {
        // when
        const challengeType = 'other';
        const actualUser = await userRepository.updateHasSeenChallengeTooltip({ userId, challengeType });

        // then
        expect(actualUser.hasSeenOtherChallengesTooltip).to.be.true;
      });
    });
  });

  describe('#checkIfEmailIsAvailable', function () {
    it('should return the email when the email is not registered', async function () {
      // when
      const email = await userRepository.checkIfEmailIsAvailable('email@example.net');

      // then
      expect(email).to.equal('email@example.net');
    });

    it('should reject an AlreadyRegisteredEmailError when it already exists', async function () {
      // given
      const userInDb = databaseBuilder.factory.buildUser(userToInsert);
      await databaseBuilder.commit();

      // when
      const result = await catchErr(userRepository.checkIfEmailIsAvailable)(userInDb.email);

      // then
      expect(result).to.be.instanceOf(AlreadyRegisteredEmailError);
    });

    it('should reject an AlreadyRegisteredEmailError when email case insensitive already exists', async function () {
      // given
      const upperCaseEmail = 'TEST@example.net';
      const lowerCaseEmail = 'test@example.net';
      databaseBuilder.factory.buildUser({ email: upperCaseEmail });
      await databaseBuilder.commit();

      // when
      const result = await catchErr(userRepository.checkIfEmailIsAvailable)(lowerCaseEmail);

      // then
      expect(result).to.be.instanceOf(AlreadyRegisteredEmailError);
    });
  });

  describe('#isUserExistingByEmail', function () {
    const email = 'shi@fu.fr';

    beforeEach(function () {
      databaseBuilder.factory.buildUser({ email });
      databaseBuilder.factory.buildUser();
      return databaseBuilder.commit();
    });

    it('should return true when the user exists by email', async function () {
      const userExists = await userRepository.isUserExistingByEmail(email);
      expect(userExists).to.be.true;
    });

    it('should return true when the user exists by email (case insensitive)', async function () {
      // given
      const uppercaseEmailAlreadyInDb = email.toUpperCase();

      // when
      const userExists = await userRepository.isUserExistingByEmail(uppercaseEmailAlreadyInDb);

      // then
      expect(userExists).to.be.true;
    });

    it('should throw an error when the user does not exist by email', async function () {
      const err = await catchErr(userRepository.isUserExistingByEmail)('none');
      expect(err).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#acceptPixLastTermsOfService', function () {
    it('should validate the last terms of service and save the date of acceptance ', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser({
        mustValidateTermsOfService: true,
        lastTermsOfServiceValidatedAt: null,
      }).id;
      await databaseBuilder.commit();

      // when
      const actualUser = await userRepository.acceptPixLastTermsOfService(userId);

      // then
      expect(actualUser.lastTermsOfServiceValidatedAt).to.be.exist;
      expect(actualUser.lastTermsOfServiceValidatedAt).to.be.a('Date');
      expect(actualUser.mustValidateTermsOfService).to.be.false;
    });
  });

  describe('#isUsernameAvailable', function () {
    const username = 'abc.def0101';

    it("should return username when it doesn't exist", async function () {
      // when
      const result = await userRepository.isUsernameAvailable(username);

      // then
      expect(result).to.equal(username);
    });

    it('should throw AlreadyRegisteredUsernameError when username already exist', async function () {
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

  describe('#updateLastDataProtectionPolicySeenAt', function () {
    let clock;
    const now = new Date('2022-12-24');

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('should update the last data protection policy to now', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      const userId = user.id;
      await databaseBuilder.commit();

      // when
      const result = await userRepository.updateLastDataProtectionPolicySeenAt({ userId });

      // then
      expect(result).to.be.an.instanceOf(User);
      expect(result.lastDataProtectionPolicySeenAt).to.deep.equal(now);
    });
  });
});
