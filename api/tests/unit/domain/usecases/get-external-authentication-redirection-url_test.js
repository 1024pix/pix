const { expect, sinon, domainBuilder } = require('../../../test-helper');
const User = require('../../../../lib/domain/models/User');
const getExternalAuthenticationRedirectionUrl = require('../../../../lib/domain/usecases/get-external-authentication-redirection-url');

describe('Unit | UseCase | get-external-authentication-redirection-url', function () {
  let userRepository;
  let tokenService;

  beforeEach(function () {
    userRepository = {
      getBySamlId: sinon.stub(),
      updateLastLoggedAt: sinon.stub(),
    };

    tokenService = {
      createIdTokenForUserReconciliation: sinon.stub(),
      createAccessTokenForSaml: sinon.stub(),
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
      const settings = {
        saml: {
          attributeMapping: {
            samlId: 'IDO',
            firstName: 'PRE',
            lastName: 'NOM',
          },
        },
      };

      tokenService.createIdTokenForUserReconciliation.returns('external-user-token');
      userRepository.getBySamlId.resolves(null);

      // when
      const result = await getExternalAuthenticationRedirectionUrl({
        userAttributes,
        userRepository,
        tokenService,
        settings,
      });

      // then
      expect(result).to.deep.equal('/campagnes?externalUser=external-user-token');
    });
  });

  context('when user already exists in database', function () {
    it('should return access token url', async function () {
      // given
      const userAttributes = {
        IDO: 'saml-id-for-adele',
        NOM: 'Lopez',
        PRE: 'Adèle',
      };
      const settings = {
        saml: {
          attributeMapping: {
            samlId: 'IDO',
            firstName: 'PRE',
            lastName: 'NOM',
          },
        },
      };
      const expectedUser = new User({
        id: 1,
        firstName: 'Adèle',
        lastName: 'Lopez',
        samlId: 'saml-id-for-adele',
      });

      userRepository.getBySamlId.withArgs('saml-id-for-adele').resolves(expectedUser);
      tokenService.createAccessTokenForSaml.returns('access-token');

      // when
      const result = await getExternalAuthenticationRedirectionUrl({
        userAttributes,
        userRepository,
        tokenService,
        settings,
      });

      // then
      const expectedUrl = '/?token=access-token&user-id=1';
      expect(result).to.deep.equal(expectedUrl);
    });

    it('should save the last login date', async function () {
      // given
      const userAttributes = {
        IDO: 'saml-id-for-adele',
        NOM: 'Lopez',
        PRE: 'Adèle',
      };
      const settings = {
        saml: {
          attributeMapping: {
            samlId: 'IDO',
            firstName: 'PRE',
            lastName: 'NOM',
          },
        },
      };
      const user = domainBuilder.buildUser({ id: 777 });

      userRepository.getBySamlId.resolves(user);
      tokenService.createIdTokenForUserReconciliation.returns('external-user-token');

      // when
      await getExternalAuthenticationRedirectionUrl({ userAttributes, userRepository, tokenService, settings });

      // then
      expect(userRepository.updateLastLoggedAt).to.have.been.calledWith({ userId: 777 });
    });
  });
});
