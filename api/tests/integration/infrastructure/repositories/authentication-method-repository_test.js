const { expect, databaseBuilder, knex, catchErr, domainBuilder } = require('../../../test-helper');
const authenticationMethodRepository = require('../../../../lib/infrastructure/repositories/authentication-method-repository');
const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');
const { AlreadyExistingEntity } = require('../../../../lib/domain/errors');

describe('Integration | Repository | AuthenticationMethod', () => {

  describe('#create', () => {

    afterEach(() => {
      return knex('authentication-methods').delete();
    });

    context('When creating a AuthenticationMethod containing an authentication complement', () => {

      it('should return an AuthenticationMethod', async () => {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();
        const authenticationMethod = domainBuilder.buildAuthenticationMethod.buildPasswordAuthenticationMethod({
          password: 'Password123',
          shouldChangePassword: false,
          userId,
        });

        // when
        const savedAuthenticationMethod = await authenticationMethodRepository.create({ authenticationMethod });

        expect(savedAuthenticationMethod).to.be.instanceOf(AuthenticationMethod);
      });
    });

    context('When creating a AuthenticationMethod containing an external identifier', () => {

      it('should return an AuthenticationMethod', async () => {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();

        const authenticationMethod = domainBuilder.buildAuthenticationMethod({
          identityProvider: AuthenticationMethod.identityProviders.GAR,
          externalIdentifier: 'externalIdentifier',
          userId,
        });

        // when
        const savedAuthenticationMethod = await authenticationMethodRepository.create({ authenticationMethod });

        // then
        expect(savedAuthenticationMethod).to.be.instanceOf(AuthenticationMethod);
      });
    });

    context('When an AuthenticationMethod already exist for an identityProvider and an externalIdentifier', () => {

      it('should throw an AlreadyExistingEntity', async () => {
        // given
        const identityProvider = AuthenticationMethod.identityProviders.GAR;
        const externalIdentifier = 'alreadyExistingExternalIdentifier';
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildAuthenticationMethod({
          identityProvider,
          externalIdentifier,
          userId: databaseBuilder.factory.buildUser().id,
        });
        await databaseBuilder.commit();

        const authenticationMethod = domainBuilder.buildAuthenticationMethod({ identityProvider, externalIdentifier, userId });

        // when
        const error = await catchErr(authenticationMethodRepository.create)({ authenticationMethod });

        // then
        expect(error).to.be.instanceOf(AlreadyExistingEntity);
      });
    });

    context('When an AuthenticationMethod already exist for an identityProvider and a userId', () => {

      it('should throw an AlreadyExistingEntity', async () => {
        // given
        const identityProvider = AuthenticationMethod.identityProviders.GAR;
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildAuthenticationMethod({ identityProvider, externalIdentifier: 'externalIdentifier1', userId });
        await databaseBuilder.commit();

        const authenticationMethod = domainBuilder.buildAuthenticationMethod({ identityProvider, externalIdentifier: 'externalIdentifier2', userId });

        // when
        const error = await catchErr(authenticationMethodRepository.create)({ authenticationMethod });

        // then
        expect(error).to.be.instanceOf(AlreadyExistingEntity);
      });
    });
  });
});
