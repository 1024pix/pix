import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../src/identity-access-management/domain/constants/identity-providers.js';
import { AuthenticationMethod } from '../../../../../src/identity-access-management/domain/models/AuthenticationMethod.js';
import { getSamlAuthenticationRedirectionUrl } from '../../../../../src/identity-access-management/domain/usecases/get-saml-authentication-redirection-url.js';
import { User } from '../../../../../src/shared/domain/models/User.js';
import { domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | UseCase | get-external-authentication-redirection-url', function () {
  let userRepository;
  let userLoginRepository;
  let authenticationMethodRepository;
  let tokenService;
  let samlSettings;

  beforeEach(function () {
    userRepository = {
      getBySamlId: sinon.stub(),
    };

    userLoginRepository = {
      updateLastLoggedAt: sinon.stub(),
    };

    authenticationMethodRepository = {
      findOneByUserIdAndIdentityProvider: sinon.stub(),
      update: sinon.stub(),
    };

    tokenService = {
      createIdTokenForUserReconciliation: sinon.stub(),
      createAccessTokenForSaml: sinon.stub(),
    };

    samlSettings = {
      saml: {
        attributeMapping: {
          samlId: 'IDO',
          firstName: 'PRE',
          lastName: 'NOM',
        },
      },
    };
  });

  context('when user does not exist in database yet', function () {
    it('should return campaign url with external user token', async function () {
      // given
      const userAttributes = {
        IDO: 'saml-id-for-adele',
        NOM: 'Lopez',
        PRE: 'Adèle',
      };

      tokenService.createIdTokenForUserReconciliation.returns('external-user-token');
      userRepository.getBySamlId.resolves(null);

      // when
      const result = await getSamlAuthenticationRedirectionUrl({
        userAttributes,
        userRepository,
        userLoginRepository,
        tokenService,
        config: samlSettings,
      });

      // then
      expect(result).to.deep.equal('/campagnes?externalUser=external-user-token');
    });
  });

  context('when user already exists in database', function () {
    let clock;
    const now = new Date('2022-03-13');

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('should return access token url', async function () {
      // given
      const userAttributes = {
        IDO: 'saml-id-for-adele',
        NOM: 'Lopez',
        PRE: 'Adèle',
      };
      const expectedUser = new User({
        id: 1,
        firstName: 'Adèle',
        lastName: 'Lopez',
        samlId: 'saml-id-for-adele',
      });

      userRepository.getBySamlId.withArgs('saml-id-for-adele').resolves(expectedUser);
      authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(
        domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider(),
      );
      tokenService.createAccessTokenForSaml.returns('access-token');

      // when
      const result = await getSamlAuthenticationRedirectionUrl({
        userAttributes,
        userRepository,
        userLoginRepository,
        authenticationMethodRepository,
        tokenService,
        config: samlSettings,
      });

      // then
      const expectedUrl = '/connexion/gar#access-token';
      expect(result).to.deep.equal(expectedUrl);
    });

    it('should save the last login date', async function () {
      // given
      const userAttributes = {
        IDO: 'saml-id-for-adele',
        NOM: 'Lopez',
        PRE: 'Adèle',
      };
      const user = domainBuilder.buildUser({ id: 777 });

      userRepository.getBySamlId.resolves(user);
      authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(
        domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider(),
      );
      tokenService.createIdTokenForUserReconciliation.returns('external-user-token');

      // when
      await getSamlAuthenticationRedirectionUrl({
        userAttributes,
        userRepository,
        userLoginRepository,
        authenticationMethodRepository,
        tokenService,
        config: samlSettings,
      });

      // then
      expect(userLoginRepository.updateLastLoggedAt).to.have.been.calledWithExactly({ userId: 777 });
    });

    context("when user's authentication method does not contain first and last name", function () {
      it('should save first and last name as the authentication complement and the authentication method modification date', async function () {
        // given
        const user = domainBuilder.buildUser();
        const authenticationMethodWithoutFirstAndLastName = new AuthenticationMethod({
          id: 1234,
          userId: user.id,
          identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
          authenticationComplement: null,
          externalIdentifier: 'saml-id',
          createdAt: new Date('2020-01-01'),
          updatedAt: new Date('2020-02-01'),
        });
        userRepository.getBySamlId.withArgs('saml-id').resolves(user);
        authenticationMethodRepository.findOneByUserIdAndIdentityProvider
          .withArgs({ userId: user.id, identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code })
          .resolves(authenticationMethodWithoutFirstAndLastName);

        // when
        await getSamlAuthenticationRedirectionUrl({
          userAttributes: { IDO: 'saml-id', NOM: 'Lisitsa', PRE: 'Vassili' },
          userRepository,
          userLoginRepository,
          authenticationMethodRepository,
          tokenService,
          config: samlSettings,
        });

        // then
        const expectedAuthenticationMethod = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
          id: authenticationMethodWithoutFirstAndLastName.id,
          userId: user.id,
          identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
          userFirstName: 'Vassili',
          userLastName: 'Lisitsa',
          externalIdentifier: 'saml-id',
        });
        expect(authenticationMethodRepository.update).to.have.been.calledWithExactly(expectedAuthenticationMethod);
      });
    });

    context("when user's authentication method contains a different first name", function () {
      it('should update first and last name in the authentication complement and the authentication method modification date', async function () {
        // given
        const { user, authenticationMethod } = _buildUserWithAuthenticationMethod({
          firstName: 'Vassili',
          lastName: 'Lisitsa',
          externalIdentifier: 'saml-id',
        });
        userRepository.getBySamlId.withArgs('saml-id').resolves(user);
        authenticationMethodRepository.findOneByUserIdAndIdentityProvider
          .withArgs({ userId: user.id, identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code })
          .resolves(authenticationMethod);

        // when
        await getSamlAuthenticationRedirectionUrl({
          userAttributes: { IDO: 'saml-id', NOM: 'Lisitsa', PRE: 'Valentina' },
          userRepository,
          userLoginRepository,
          authenticationMethodRepository,
          tokenService,
          config: samlSettings,
        });

        // then
        const expectedAuthenticationMethod = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
          id: authenticationMethod.id,
          userId: user.id,
          identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
          userFirstName: 'Valentina',
          userLastName: 'Lisitsa',
          externalIdentifier: 'saml-id',
        });
        expect(authenticationMethodRepository.update).to.have.been.calledWithExactly(expectedAuthenticationMethod);
      });
    });

    context("when user's authentication method contains a different last name", function () {
      it('should update first and last name in the authentication complement and the authentication method modification date', async function () {
        // given
        const { user, authenticationMethod } = _buildUserWithAuthenticationMethod({
          firstName: 'Valentina',
          lastName: 'Lisitsa',
          externalIdentifier: 'saml-id',
        });
        userRepository.getBySamlId.withArgs('saml-id').resolves(user);
        authenticationMethodRepository.findOneByUserIdAndIdentityProvider
          .withArgs({ userId: user.id, identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code })
          .resolves(authenticationMethod);

        // when
        await getSamlAuthenticationRedirectionUrl({
          userAttributes: { IDO: 'saml-id', NOM: 'Volk', PRE: 'Valentina' },
          userRepository,
          userLoginRepository,
          authenticationMethodRepository,
          tokenService,
          config: samlSettings,
        });

        // then
        const expectedAuthenticationMethod = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
          id: authenticationMethod.id,
          userId: user.id,
          identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
          userFirstName: 'Valentina',
          userLastName: 'Volk',
          externalIdentifier: 'saml-id',
        });
        expect(authenticationMethodRepository.update).to.have.been.calledWithExactly(expectedAuthenticationMethod);
      });
    });

    context("when user's authentication method contains the same first and last name", function () {
      it('should not update first and last name in the authentication complement', async function () {
        // given
        const { user, authenticationMethod } = _buildUserWithAuthenticationMethod({
          firstName: 'Valentina',
          lastName: 'Volk',
          externalIdentifier: 'saml-id',
        });
        userRepository.getBySamlId.withArgs('saml-id').resolves(user);
        authenticationMethodRepository.findOneByUserIdAndIdentityProvider
          .withArgs({ userId: user.id, identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code })
          .resolves(authenticationMethod);

        // when
        await getSamlAuthenticationRedirectionUrl({
          userAttributes: { IDO: 'saml-id', NOM: 'Volk', PRE: 'Valentina' },
          userRepository,
          userLoginRepository,
          authenticationMethodRepository,
          tokenService,
          config: samlSettings,
        });

        // then
        expect(authenticationMethodRepository.update).to.not.have.been.called;
      });
    });
  });
});

function _buildUserWithAuthenticationMethod({ firstName, lastName, externalIdentifier }) {
  const user = domainBuilder.buildUser();
  const authenticationMethod = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
    userId: user.id,
    userFirstName: firstName,
    userLastName: lastName,
    externalIdentifier: externalIdentifier,
  });
  return { user, authenticationMethod };
}
