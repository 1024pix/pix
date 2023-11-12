import { catchErr, databaseBuilder, domainBuilder, expect, knex, sinon } from '../../../test-helper.js';
import { AlreadyExistingEntityError, AuthenticationMethodNotFoundError } from '../../../../lib/domain/errors.js';
import { AuthenticationMethod } from '../../../../lib/domain/models/AuthenticationMethod.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../lib/domain/constants/identity-providers.js';
import * as OidcIdentityProviders from '../../../../lib/domain/constants/oidc-identity-providers.js';
import * as authenticationMethodRepository from '../../../../lib/infrastructure/repositories/authentication-method-repository.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';

describe('Integration | Repository | AuthenticationMethod', function () {
  const hashedPassword = 'ABCDEF1234';
  const newHashedPassword = '1234ABCDEF';

  describe('#create', function () {
    context('when creating a AuthenticationMethod containing an external identifier', function () {
      it('should return an AuthenticationMethod', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();

        const authenticationMethod = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
          externalIdentifier: 'externalIdentifier',
          userId,
        });
        delete authenticationMethod.id;

        // when
        const savedAuthenticationMethod = await authenticationMethodRepository.create({ authenticationMethod });

        // then
        expect(savedAuthenticationMethod).to.deepEqualInstanceOmitting(authenticationMethod, [
          'id',
          'createdAt',
          'updatedAt',
        ]);
      });

      it('should save an AuthenticationMethod in database', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();

        const authenticationMethod = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
          externalIdentifier: 'externalIdentifier',
          userId,
        });
        delete authenticationMethod.id;

        // when
        const savedAuthenticationMethod = await authenticationMethodRepository.create({ authenticationMethod });

        // then
        const [authenticationMethodId] = await knex('authentication-methods')
          .pluck('id')
          .where({ externalIdentifier: 'externalIdentifier' });
        expect(authenticationMethodId).to.equal(savedAuthenticationMethod.id);
      });
    });

    context(
      'when an AuthenticationMethod already exists for an identity provider and an external identifier',
      function () {
        it('should throw an AlreadyExistingEntityError', async function () {
          // given
          const userIdA = databaseBuilder.factory.buildUser().id;
          const userIdB = databaseBuilder.factory.buildUser().id;
          const authenticationMethodA = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
            externalIdentifier: 'alreadyExistingExternalIdentifier',
            userId: userIdA,
          });
          delete authenticationMethodA.id;
          databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider(authenticationMethodA);
          await databaseBuilder.commit();
          const authenticationMethodB = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
            externalIdentifier: 'alreadyExistingExternalIdentifier',
            userId: userIdB,
          });
          delete authenticationMethodB.id;

          // when
          const error = await catchErr(authenticationMethodRepository.create)({
            authenticationMethod: authenticationMethodB,
          });

          // then
          expect(error).to.be.instanceOf(AlreadyExistingEntityError);
        });
      },
    );

    context('when an AuthenticationMethod already exists for an identity provider and a userId', function () {
      it('should throw an AlreadyExistingEntityError', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const authenticationMethodA = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
          externalIdentifier: 'someIdentifierA',
          userId,
        });
        delete authenticationMethodA.id;
        databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider(authenticationMethodA);
        await databaseBuilder.commit();
        const authenticationMethodB = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
          externalIdentifier: 'someIdentifierB',
          userId,
        });
        delete authenticationMethodB.id;

        // when
        const error = await catchErr(authenticationMethodRepository.create)({
          authenticationMethod: authenticationMethodB,
        });

        // then
        expect(error).to.be.instanceOf(AlreadyExistingEntityError);
      });
    });

    it('should be DomainTransaction compliant', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
      const authenticationMethod = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
        externalIdentifier: 'externalIdentifier',
        userId,
      });
      delete authenticationMethod.id;

      // when
      await catchErr(async function () {
        await DomainTransaction.execute(async (domainTransaction) => {
          await authenticationMethodRepository.create({ authenticationMethod, domainTransaction });
          throw new Error('Error occurs in transaction');
        });
      })();

      // then
      const results = await knex('authentication-methods').where({ externalIdentifier: 'externalIdentifier' });
      expect(results).to.be.empty;
    });
  });

  describe('#updateChangedPassword', function () {
    let userId;
    let clock;

    beforeEach(async function () {
      clock = sinon.useFakeTimers({ now: new Date('2020-01-02'), toFake: ['Date'] });
      userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
    });

    afterEach(function () {
      clock.restore();
    });

    it('should update the password in database', async function () {
      // given
      const authenticationMethodId =
        databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
          userId,
          hashedPassword,
        }).id;
      await databaseBuilder.commit();

      // when
      await authenticationMethodRepository.updateChangedPassword({
        userId,
        hashedPassword: newHashedPassword,
      });

      // then
      const [authenticationComplement] = await knex('authentication-methods')
        .pluck('authenticationComplement')
        .where({ id: authenticationMethodId });
      expect(authenticationComplement.password).to.equal(newHashedPassword);
    });

    it('should return the updated AuthenticationMethod', async function () {
      // given
      const originalAuthenticationMethod =
        domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
          id: 123,
          userId,
          hashedPassword,
        });
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword(
        originalAuthenticationMethod,
      );
      await databaseBuilder.commit();

      // when
      const updatedAuthenticationMethod = await authenticationMethodRepository.updateChangedPassword({
        userId,
        hashedPassword: newHashedPassword,
      });

      // then
      const expectedAuthenticationMethod =
        domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
          id: 123,
          userId,
          hashedPassword: newHashedPassword,
          updatedAt: new Date(),
        });
      expect(updatedAuthenticationMethod).to.deepEqualInstance(expectedAuthenticationMethod);
    });

    it('should disable changing password', async function () {
      // given
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
        userId,
        hashedPassword,
        shouldChangePassword: true,
      });
      await databaseBuilder.commit();

      // when
      const updatedAuthenticationMethod = await authenticationMethodRepository.updateChangedPassword({
        userId,
        hashedPassword: newHashedPassword,
      });

      // then
      expect(updatedAuthenticationMethod.authenticationComplement.shouldChangePassword).to.be.false;
    });

    it('should throw AuthenticationMethodNotFoundError when user id not found', async function () {
      // given
      const wrongUserId = 0;

      // when
      const error = await catchErr(authenticationMethodRepository.updateChangedPassword)({
        userId: wrongUserId,
        hashedPassword,
      });

      // then
      expect(error).to.be.instanceOf(AuthenticationMethodNotFoundError);
    });

    it('should be DomainTransaction compliant', async function () {
      // given
      const authenticationMethod =
        databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
          userId,
          hashedPassword,
        });
      await databaseBuilder.commit();

      // when
      await catchErr(async function () {
        await DomainTransaction.execute(async (domainTransaction) => {
          await authenticationMethodRepository.updateChangedPassword(
            { userId, hashedPassword: 'coucou' },
            domainTransaction,
          );
          throw new Error('Error occurs in transaction');
        });
      })();

      // then
      const [authenticationComplement] = await knex('authentication-methods')
        .pluck('authenticationComplement')
        .where({ id: authenticationMethod.id });
      expect(authenticationComplement.password).to.be.equal(hashedPassword);
    });
  });

  describe('#findOneByUserIdAndIdentityProvider', function () {
    it('should return the AuthenticationMethod associated to a user for a given identity provider', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
        userId,
      });
      const garAuthenticationMethod = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
        id: 123,
        userId,
      });
      databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider(garAuthenticationMethod);
      await databaseBuilder.commit();

      // when
      const authenticationMethodsByUserIdAndIdentityProvider =
        await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
          userId,
          identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
        });

      // then
      expect(authenticationMethodsByUserIdAndIdentityProvider).to.deepEqualInstance(garAuthenticationMethod);
    });

    it('should return null if there is no AuthenticationMethod for the given user and identity provider', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({ userId });
      await databaseBuilder.commit();

      // when
      const authenticationMethodsByUserIdAndIdentityProvider =
        await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
          userId,
          identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
        });

      // then
      expect(authenticationMethodsByUserIdAndIdentityProvider).to.be.null;
    });

    describe('when Pix is the authentication provider', function () {
      it('brings along a Pix authentication complement', async function () {
        // given
        const user = databaseBuilder.factory.buildUser();
        databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
          userId: user.id,
          hashedPassword: 'H4SHED',
          shouldChangePassword: false,
        });
        await databaseBuilder.commit();

        // when
        const pixAuthenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
          userId: user.id,
          identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
        });

        // then
        expect(pixAuthenticationMethod.authenticationComplement).to.deep.equal(
          new AuthenticationMethod.PixAuthenticationComplement({
            password: 'H4SHED',
            shouldChangePassword: false,
          }),
        );
      });
    });

    describe('when Pole Emploi is the authentication provider', function () {
      it('brings along a Pole Emploi authentication complement', async function () {
        // given
        const user = databaseBuilder.factory.buildUser();
        databaseBuilder.factory.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({
          userId: user.id,
          accessToken: 'AGENCENATIONALEPOURLEMPLOI',
          refreshToken: 'FRANCETRAVAIL',
          expiredDate: new Date('2021-01-01'),
        });
        await databaseBuilder.commit();

        // when
        const pixAuthenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
          userId: user.id,
          identityProvider: OidcIdentityProviders.POLE_EMPLOI.code,
        });

        // then
        expect(pixAuthenticationMethod.authenticationComplement).to.deep.equal(
          new AuthenticationMethod.OidcAuthenticationComplement({
            accessToken: 'AGENCENATIONALEPOURLEMPLOI',
            refreshToken: 'FRANCETRAVAIL',
            expiredDate: '2021-01-01T00:00:00.000Z',
          }),
        );
      });
    });

    describe('when GAR is the authentication provider', function () {
      it('brings along a GAR authentication complement', async function () {
        // given
        const user = databaseBuilder.factory.buildUser();
        databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
          userId: user.id,
          userFirstName: 'Katie',
          userLastName: 'McGuffin',
        });
        await databaseBuilder.commit();

        // when
        const garAuthenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
          userId: user.id,
          identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
        });

        // then
        expect(garAuthenticationMethod.authenticationComplement).to.deep.equal(
          new AuthenticationMethod.GARAuthenticationComplement({
            firstName: 'Katie',
            lastName: 'McGuffin',
          }),
        );
      });
    });
  });

  describe('#findOneByExternalIdentifierAndIdentityProvider', function () {
    it('should return the AuthenticationMethod for a given external identifier and identity provider', async function () {
      // given
      const externalIdentifier = 'samlId';
      const userId = databaseBuilder.factory.buildUser().id;
      const authenticationMethod = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
        id: 123,
        externalIdentifier,
        userId,
      });
      databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider(authenticationMethod);
      databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
        externalIdentifier: 'another_sub',
      });
      await databaseBuilder.commit();

      // when
      const authenticationMethodsByTypeAndValue =
        await authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider({
          externalIdentifier,
          identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
        });

      // then
      expect(authenticationMethodsByTypeAndValue).to.deepEqualInstance(authenticationMethod);
    });

    it('should return null if there is no AuthenticationMethods for the given external identifier and identity provider', async function () {
      // given & when
      const authenticationMethodsByTypeAndValue =
        await authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider({
          externalIdentifier: 'samlId',
          identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
        });

      // then
      expect(authenticationMethodsByTypeAndValue).to.be.null;
    });
  });

  describe('#updateExternalIdentifierByUserIdAndIdentityProvider', function () {
    context('When authentication method exists', function () {
      let clock;

      beforeEach(async function () {
        clock = sinon.useFakeTimers({ now: new Date('2020-01-02'), toFake: ['Date'] });
      });

      afterEach(function () {
        clock.restore();
      });

      it('should update external identifier by userId and identity provider', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const authenticationMethod = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
          externalIdentifier: 'old_value',
          userId,
        });
        databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider(authenticationMethod);
        await databaseBuilder.commit();

        // when
        await authenticationMethodRepository.updateExternalIdentifierByUserIdAndIdentityProvider({
          userId,
          identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
          externalIdentifier: 'new_value',
        });

        // then
        const [externalIdentifier] = await knex('authentication-methods')
          .pluck('externalIdentifier')
          .where({ id: authenticationMethod.id });
        expect(externalIdentifier).to.equal('new_value');
      });

      it('should return the updated AuthenticationMethod', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const authenticationMethod = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
          externalIdentifier: 'old_value',
          userId,
        });
        databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider(authenticationMethod);
        await databaseBuilder.commit();

        // when
        const updatedAuthenticationMethod =
          await authenticationMethodRepository.updateExternalIdentifierByUserIdAndIdentityProvider({
            userId,
            identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
            externalIdentifier: 'new_value',
          });

        // then
        authenticationMethod.externalIdentifier = 'new_value';
        authenticationMethod.updatedAt = new Date();
        expect(updatedAuthenticationMethod).to.deepEqualInstance(authenticationMethod);
      });
    });

    context('When authentication method does not exist', function () {
      it('should throw an AuthenticationMethodNotFoundError', async function () {
        // given
        const userId = 12345;
        const identityProvider = NON_OIDC_IDENTITY_PROVIDERS.GAR.code;
        const externalIdentifier = 'new_saml_id';

        // when
        const error = await catchErr(
          authenticationMethodRepository.updateExternalIdentifierByUserIdAndIdentityProvider,
        )({ externalIdentifier, userId, identityProvider });

        // then
        expect(error).to.be.instanceOf(AuthenticationMethodNotFoundError);
      });
    });
  });

  describe('#updatePasswordThatShouldBeChanged', function () {
    let userId;
    let clock;

    beforeEach(async function () {
      clock = sinon.useFakeTimers({ now: new Date('2020-01-02'), toFake: ['Date'] });
      userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
    });

    afterEach(function () {
      clock.restore();
    });

    it('should update password in database and set shouldChangePassword to true', async function () {
      // given
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
        id: 123,
        userId,
        hashedPassword,
        shouldChangePassword: false,
      });
      await databaseBuilder.commit();

      // when
      await authenticationMethodRepository.updatePasswordThatShouldBeChanged({
        userId,
        hashedPassword: newHashedPassword,
      });

      // then
      const [authenticationComplement] = await knex('authentication-methods')
        .pluck('authenticationComplement')
        .where({ id: 123 });
      expect(authenticationComplement.password).to.equal(newHashedPassword);
      expect(authenticationComplement.shouldChangePassword).to.be.true;
    });

    it('should return an updated AuthenticationMethod', async function () {
      // given
      const originalAuthenticationMethod =
        domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
          id: 123,
          userId,
          hashedPassword,
          shouldChangePassword: false,
        });
      databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider(originalAuthenticationMethod);
      await databaseBuilder.commit();

      // when
      const updatedAuthenticationMethod = await authenticationMethodRepository.updatePasswordThatShouldBeChanged({
        userId,
        hashedPassword: newHashedPassword,
      });

      // then
      const expectedAuthenticationMethod =
        domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
          id: 123,
          userId,
          hashedPassword: newHashedPassword,
          shouldChangePassword: true,
          updatedAt: new Date(),
        });
      expect(updatedAuthenticationMethod).to.deepEqualInstance(expectedAuthenticationMethod);
    });

    it('should throw AuthenticationMethodNotFoundError when user id not found', async function () {
      // given
      const wrongUserId = 0;

      // when
      const error = await catchErr(authenticationMethodRepository.updatePasswordThatShouldBeChanged)({
        userId: wrongUserId,
        hashedPassword,
      });

      // then
      expect(error).to.be.instanceOf(AuthenticationMethodNotFoundError);
    });

    it('should be DomainTransaction compliant', async function () {
      // given
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
        id: 123,
        userId,
        hashedPassword,
        shouldChangePassword: false,
      });
      await databaseBuilder.commit();

      // when
      await catchErr(async function () {
        await DomainTransaction.execute(async (domainTransaction) => {
          await authenticationMethodRepository.updatePasswordThatShouldBeChanged({
            userId,
            hashedPassword: newHashedPassword,
            domainTransaction,
          });
          throw new Error('Error occurs in transaction');
        });
      })();

      // then
      const [authenticationComplement] = await knex('authentication-methods')
        .pluck('authenticationComplement')
        .where({ id: 123 });
      expect(authenticationComplement.password).to.equal(hashedPassword);
      expect(authenticationComplement.shouldChangePassword).to.be.false;
    });
  });

  describe('#createPasswordThatShouldBeChanged', function () {
    let userId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
    });

    it('should create and return a Pix authentication method with given password in database and set shouldChangePassword to true', async function () {
      // when
      const createdAuthenticationMethod = await authenticationMethodRepository.createPasswordThatShouldBeChanged({
        userId,
        hashedPassword: newHashedPassword,
      });

      // then
      const expectedAuthenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
        userId,
        identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
      });
      expect(createdAuthenticationMethod).to.deepEqualInstance(expectedAuthenticationMethod);
    });

    it('should not replace an existing authenticationMethod with a different identity provider', async function () {
      // given
      databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({ userId });
      await databaseBuilder.commit();
      await authenticationMethodRepository.createPasswordThatShouldBeChanged({
        userId,
        hashedPassword: newHashedPassword,
      });

      // when
      const foundAuthenticationMethodPIX = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
        userId,
        identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
      });
      const foundAuthenticationMethodGAR = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
        userId,
        identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
      });

      // then
      expect(foundAuthenticationMethodPIX).to.exist;
      expect(foundAuthenticationMethodGAR).to.exist;
    });

    it('should throw an AlreadyExistingEntityError when authentication method with PIX identity provider already exists for user', async function () {
      // given
      await authenticationMethodRepository.createPasswordThatShouldBeChanged({
        userId,
        hashedPassword: newHashedPassword,
      });

      // when
      const error = await catchErr(authenticationMethodRepository.createPasswordThatShouldBeChanged)({
        userId,
        hashedPassword: newHashedPassword,
      });

      // then
      expect(error).to.be.instanceOf(AlreadyExistingEntityError);
    });

    it('should be DomainTransaction compliant', async function () {
      // when
      await catchErr(async function () {
        await DomainTransaction.execute(async (domainTransaction) => {
          await authenticationMethodRepository.createPasswordThatShouldBeChanged({
            userId,
            hashedPassword: newHashedPassword,
            domainTransaction,
          });
          throw new Error('Error occurs in transaction');
        });
      })();

      // then
      const nonExistingAuthenticationMethod = await knex('authentication-methods').where({ userId }).first();
      expect(nonExistingAuthenticationMethod).to.not.exist;
    });
  });

  describe('#updateExpiredPassword', function () {
    let userId;
    let clock;

    beforeEach(async function () {
      clock = sinon.useFakeTimers({ now: new Date('2020-01-02'), toFake: ['Date'] });
      userId = databaseBuilder.factory.buildUser({ shouldChangePassword: true }).id;
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
        id: 123,
        userId,
        hashedPassword,
        shouldChangePassword: true,
      });
      await databaseBuilder.commit();
    });

    afterEach(function () {
      clock.restore();
    });

    it('should update the password in database and set shouldChangePassword to false', async function () {
      // when
      await authenticationMethodRepository.updateExpiredPassword({
        userId,
        hashedPassword: newHashedPassword,
      });

      // then
      const [authenticationComplement] = await knex('authentication-methods')
        .pluck('authenticationComplement')
        .where({ id: 123 });
      expect(authenticationComplement.password).to.equal(newHashedPassword);
      expect(authenticationComplement.shouldChangePassword).to.be.false;
    });

    it('should return the updated AuthenticationMethod', async function () {
      // given
      const expectedAuthenticationMethod =
        domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
          id: 123,
          userId,
          hashedPassword: newHashedPassword,
          shouldChangePassword: false,
          updatedAt: new Date(),
        });

      // when
      const updatedAuthenticationMethod = await authenticationMethodRepository.updateExpiredPassword({
        userId,
        hashedPassword: newHashedPassword,
      });

      // then
      expect(updatedAuthenticationMethod).to.deepEqualInstance(expectedAuthenticationMethod);
    });

    it('should throw AuthenticationMethodNotFoundError when user id is not found', async function () {
      // given
      const wrongUserId = 0;

      // when
      const error = await catchErr(authenticationMethodRepository.updateExpiredPassword)({
        userId: wrongUserId,
        hashedPassword,
      });

      // then
      expect(error).to.be.instanceOf(AuthenticationMethodNotFoundError);
    });
  });

  describe('#updateAuthenticationComplementByUserIdAndIdentityProvider', function () {
    context('When authentication method exists', function () {
      let authenticationMethod;
      let clock;

      beforeEach(function () {
        clock = sinon.useFakeTimers({ now: new Date('2020-01-02'), toFake: ['Date'] });
        const userId = databaseBuilder.factory.buildUser().id;
        authenticationMethod = databaseBuilder.factory.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({
          id: 123,
          externalIdentifier: 'identifier',
          accessToken: 'to_be_updated',
          refreshToken: 'to_be_updated',
          expiredDate: Date.now(),
          userId,
        });
        return databaseBuilder.commit();
      });

      afterEach(function () {
        clock.restore();
      });

      it('should update the authentication complement in database', async function () {
        // given
        const userId = authenticationMethod.userId;
        const expiredDate = Date.now();
        const authenticationComplement = new AuthenticationMethod.OidcAuthenticationComplement({
          accessToken: 'new_access_token',
          refreshToken: 'new_refresh_token',
          expiredDate,
        });

        // when
        await authenticationMethodRepository.updateAuthenticationComplementByUserIdAndIdentityProvider({
          authenticationComplement,
          userId,
          identityProvider: OidcIdentityProviders.POLE_EMPLOI.code,
        });

        // then
        const [updatedAuthenticationComplement] = await knex('authentication-methods')
          .pluck('authenticationComplement')
          .where({ id: 123 });
        expect(updatedAuthenticationComplement.accessToken).to.equal('new_access_token');
        expect(updatedAuthenticationComplement.refreshToken).to.equal('new_refresh_token');
        expect(updatedAuthenticationComplement.expiredDate).to.deep.equal(expiredDate);
      });

      it('should return the updated AuthenticationMethod', async function () {
        // given
        const userId = authenticationMethod.userId;
        const expiredDate = Date.now();
        const authenticationComplement = new AuthenticationMethod.OidcAuthenticationComplement({
          accessToken: 'new_access_token',
          refreshToken: 'new_refresh_token',
          expiredDate,
        });

        // when
        const updatedAuthenticationMethod =
          await authenticationMethodRepository.updateAuthenticationComplementByUserIdAndIdentityProvider({
            authenticationComplement,
            userId,
            identityProvider: OidcIdentityProviders.POLE_EMPLOI.code,
          });

        // then
        const expectedAuthenticationMethod = domainBuilder.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({
          id: 123,
          externalIdentifier: 'identifier',
          accessToken: 'new_access_token',
          refreshToken: 'new_refresh_token',
          expiredDate,
          userId,
          updatedAt: new Date(),
        });
        expect(updatedAuthenticationMethod).to.deepEqualInstance(expectedAuthenticationMethod);
      });
    });

    context('When authentication method does not exist', function () {
      it('should throw a AuthenticationMethodNotFoundError', async function () {
        // given
        const userId = 12345;
        const authenticationComplement = {};

        // when
        const error = await catchErr(
          authenticationMethodRepository.updateAuthenticationComplementByUserIdAndIdentityProvider,
        )({
          authenticationComplement,
          userId,
          identityProvider: OidcIdentityProviders.POLE_EMPLOI.code,
        });

        // then
        expect(error).to.be.instanceOf(AuthenticationMethodNotFoundError);
      });
    });
  });

  describe('#hasIdentityProviderPIX', function () {
    it('should return true if user have an authenticationMethod with an IdentityProvider PIX ', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
        userId,
      });
      await databaseBuilder.commit();

      // when
      const result = await authenticationMethodRepository.hasIdentityProviderPIX({
        userId,
      });

      // then
      expect(result).to.be.true;
    });

    it('should return false if user have no authenticationMethod with an IdentityProvider PIX ', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({ userId });
      await databaseBuilder.commit();

      // when
      const result = await authenticationMethodRepository.hasIdentityProviderPIX({
        userId,
      });

      // then
      expect(result).to.be.false;
    });
  });

  describe('#removeByUserIdAndIdentityProvider', function () {
    it('should delete from database the authentication method by userId and identityProvider', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
        externalIdentifier: 'externalIdentifier',
        userId,
      });
      await databaseBuilder.commit();

      // when
      await authenticationMethodRepository.removeByUserIdAndIdentityProvider({
        userId,
        identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
      });

      // then
      const result = await knex('authentication-methods').where({ id: userId }).first();
      expect(result).to.be.undefined;
    });
  });

  describe('#removeAllAuthenticationMethodsByUserId', function () {
    it('should delete from database all the authentication methods by userId', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
        externalIdentifier: 'externalIdentifier',
        userId,
      });
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndPassword({
        userId,
      });
      await databaseBuilder.commit();

      // when
      await authenticationMethodRepository.removeAllAuthenticationMethodsByUserId({
        userId,
      });

      // then
      const result = await knex('authentication-methods');
      expect(result).to.be.empty;
    });
  });

  describe('#findByUserId', function () {
    it("should return the user's authentication methods", async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const secondAuthenticationMethod = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
        id: 456,
        externalIdentifier: 'externalIdentifier',
        userId,
      });
      databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider(secondAuthenticationMethod);
      const firstAuthenticationMethod =
        domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
          id: 123,
          userId,
          hashedPassword: 'Hello',
        });
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
        ...firstAuthenticationMethod,
        hashedPassword: 'Hello',
      });
      await databaseBuilder.commit();

      // when
      const authenticationMethods = await authenticationMethodRepository.findByUserId({ userId });

      // then
      expect(authenticationMethods).to.deepEqualArray([firstAuthenticationMethod, secondAuthenticationMethod]);
    });

    it('should return an empty array if user has no authentication methods', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const authenticationMethods = await authenticationMethodRepository.findByUserId({ userId });

      // then
      expect(authenticationMethods).to.be.empty;
    });
  });

  describe('#getByIdAndUserId', function () {
    it("should return the user's authentication method", async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const otherUserId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
        userId: otherUserId,
        externalIdentifier: 'abcde123',
      });
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
        userId,
      });
      const garAuthenticationMethodId = databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
        userId,
        externalIdentifier: 'fghij456',
      }).id;
      await databaseBuilder.commit();

      // when
      const result = await authenticationMethodRepository.getByIdAndUserId({
        id: garAuthenticationMethodId,
        userId,
      });

      // then
      expect(result).to.be.instanceOf(AuthenticationMethod);
      expect(result.id).to.be.equal(garAuthenticationMethodId);
      expect(result.userId).to.be.equal(userId);
      expect(result.identityProvider).to.be.equal(NON_OIDC_IDENTITY_PROVIDERS.GAR.code);
    });

    describe('when authentication method belongs to another user', function () {
      it('should throw an AuthenticationMethodNotFoundError', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const otherUserId = databaseBuilder.factory.buildUser().id;
        domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
          externalIdentifier: 'alreadyExistingExternalIdentifier',
          userId,
        });
        const wrongAuthenticationMethodId = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
          externalIdentifier: 'alreadyExistingExternalIdentifier',
          userId: otherUserId,
        }).id;
        await databaseBuilder.commit();

        // when
        const error = await catchErr(authenticationMethodRepository.getByIdAndUserId)({
          id: wrongAuthenticationMethodId,
          userId,
        });

        // then
        expect(error).to.be.instanceOf(AuthenticationMethodNotFoundError);
      });
    });

    describe('when authentication method id does not exist', function () {
      it('should throw an AuthenticationMethodNotFoundError', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const authenticationMethodId = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({ userId }).id;
        const wrongAuthenticationMethodId = authenticationMethodId + 1;
        await databaseBuilder.commit();

        // when
        const error = await catchErr(authenticationMethodRepository.getByIdAndUserId)({
          id: wrongAuthenticationMethodId,
          userId,
        });

        // then
        expect(error).to.be.instanceOf(AuthenticationMethodNotFoundError);
      });
    });

    describe('when user id does not exist', function () {
      it('should throw an AuthenticationMethodNotFoundError', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const wrongUserId = userId + 1;
        const authenticationMethodId = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
          userId,
        }).id;
        await databaseBuilder.commit();

        // when
        const error = await catchErr(authenticationMethodRepository.getByIdAndUserId)({
          id: authenticationMethodId,
          userId: wrongUserId,
        });

        // then
        expect(error).to.be.instanceOf(AuthenticationMethodNotFoundError);
      });
    });
  });

  describe('#updateAuthenticationMethodUserId', function () {
    let clock;
    const now = new Date('2022-02-16');

    beforeEach(async function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(async function () {
      clock.restore();
    });

    it('should update authentication method user id', async function () {
      // given
      const originUserId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({ userId: originUserId });

      const targetUserId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      await authenticationMethodRepository.updateAuthenticationMethodUserId({
        originUserId,
        identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
        targetUserId,
      });

      // then
      const authenticationMethodUpdated = await knex('authentication-methods').select();
      expect(authenticationMethodUpdated[0].userId).to.equal(targetUserId);
      expect(authenticationMethodUpdated[0].updatedAt).to.deep.equal(now);
    });
  });

  describe('#update', function () {
    let clock;

    afterEach(async function () {
      clock.restore();
    });

    it('should update authentication method complement', async function () {
      // given
      const now = new Date('2022-03-15');
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });

      const userId = databaseBuilder.factory.buildUser().id;
      const authenticationMethod = databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
        userId,
        updatedAt: new Date('2018-01-01'),
      });
      const otherAuthenticationMethod =
        databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndPassword({
          userId,
          updatedAt: new Date('2018-01-01'),
        });
      await databaseBuilder.commit();

      authenticationMethod.authenticationComplement = new AuthenticationMethod.GARAuthenticationComplement({
        firstName: 'Saml',
        lastName: 'Jackson',
      });

      // when
      await authenticationMethodRepository.update(authenticationMethod);

      // then
      const updatedAuthenticationMethod = await knex('authentication-methods')
        .select()
        .where({ id: authenticationMethod.id })
        .first();
      expect(updatedAuthenticationMethod.authenticationComplement.firstName).to.equal('Saml');
      expect(updatedAuthenticationMethod.authenticationComplement.lastName).to.equal('Jackson');
      expect(updatedAuthenticationMethod.updatedAt).to.deep.equal(new Date('2022-03-15'));
      const untouchedAuthenticationMethod = await knex('authentication-methods')
        .select()
        .where({ id: otherAuthenticationMethod.id })
        .first();
      expect(untouchedAuthenticationMethod.updatedAt).to.deep.equal(new Date('2018-01-01'));
    });
  });

  describe('#batchUpdatePasswordThatShouldBeChanged', function () {
    it('updates password for provided users list', async function () {
      // given
      const pierre = databaseBuilder.factory.buildUser.withRawPassword({ firstName: 'Pierre' });
      const pierreNewHashedPassword = 'PierrePasswordHashed';
      const paul = databaseBuilder.factory.buildUser.withRawPassword({ firstName: 'Paul' });
      const paulNewHashedPassword = 'PaulPasswordHashed';
      const usersToUpdateWithNewPassword = [
        { userId: pierre.id, hashedPassword: pierreNewHashedPassword },
        { userId: paul.id, hashedPassword: paulNewHashedPassword },
      ];

      await databaseBuilder.commit();

      // when
      await authenticationMethodRepository.batchUpdatePasswordThatShouldBeChanged({ usersToUpdateWithNewPassword });

      // then
      const authenticationMethods = await knex('authentication-methods')
        .pluck('authenticationComplement')
        .whereIn('userId', [pierre.id, paul.id]);
      const expectedAuthenticationMethods = [
        { password: pierreNewHashedPassword, shouldChangePassword: true },
        { password: paulNewHashedPassword, shouldChangePassword: true },
      ];

      expect(authenticationMethods).to.have.deep.members(expectedAuthenticationMethods);
    });

    describe('when database transaction fails', function () {
      it('does not alter users authentication methods', async function () {
        // given
        const miles = databaseBuilder.factory.buildUser({ firstName: 'Miles' });
        const milesNewHashedPassword = 'PierrePasswordHashed';
        databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
          id: 123,
          userId: miles.id,
          hashedPassword,
          shouldChangePassword: false,
        });
        await databaseBuilder.commit();

        const usersToUpdateWithNewPassword = [{ userId: miles.id, hashedPassword: milesNewHashedPassword }];

        // when
        await catchErr(async function () {
          await DomainTransaction.execute(async (domainTransaction) => {
            await authenticationMethodRepository.batchUpdatePasswordThatShouldBeChanged({
              usersToUpdateWithNewPassword,
              domainTransaction,
            });
            throw new Error('Error occurs in transaction');
          });
        })();

        // then
        const [authenticationComplement] = await knex('authentication-methods')
          .pluck('authenticationComplement')
          .where({ id: 123 });
        expect(authenticationComplement.password).to.equal(hashedPassword);
        expect(authenticationComplement.shouldChangePassword).to.be.false;
      });
    });
  });
});
