const { expect, sinon } = require('../../../test-helper');
const User = require('../../../../lib/domain/models/User');
const getExternalAuthenticationRedirectionUrl = require('../../../../lib/domain/usecases/get-external-authentication-redirection-url');

describe('Unit | UseCase | get-external-authentication-redirection-url', function() {

  const userAttributes = {
    'IDO': 'saml-id-for-adele',
    'NOM': 'Lopez',
    'PRE': 'Adèle',
  };

  let userRepository;
  let tokenService;

  beforeEach(function() {
    userRepository = {
      create: () => {},
      getBySamlId: () => {},
    };

    tokenService = {
      createIdTokenForUserReconciliation: () => { return 'external-user-token'; },
      createAccessTokenFromUser: () => { return 'access-token'; },
    };
  });

  const expectedUser = new User({
    id: 1,
    firstName: 'Adèle',
    lastName: 'Lopez',
    samlId: 'saml-id-for-adele',
  });

  const settings = {
    saml: {
      attributeMapping: {
        samlId: 'IDO',
        firstName: 'PRE',
        lastName: 'NOM',
      },
    },
  };

  context('when user does not exist in database yet', function() {

    beforeEach(function() {
      sinon.stub(userRepository, 'getBySamlId').resolves(null);
      sinon.stub(userRepository, 'create').callsFake((user) => Promise.resolve(user));
    });

    it('should return campaign url with external user token', async function() {
      // given
      const expectedUrl = '/campagnes?externalUser=external-user-token';

      // when
      const result = await getExternalAuthenticationRedirectionUrl({ userAttributes, userRepository, tokenService, settings });

      // then
      expect(result).to.deep.equal(expectedUrl);
    });
  });

  context('when user already exists in database', function() {

    beforeEach(function() {
      sinon.stub(userRepository, 'getBySamlId')
        .withArgs('saml-id-for-adele')
        .resolves(expectedUser);
    });

    it('should return access token url', async function() {
      // given
      const expectedUrl = '/?token=access-token&user-id=1';

      // when
      const result = await getExternalAuthenticationRedirectionUrl({ userAttributes, userRepository, tokenService, settings });

      // then
      expect(result).to.deep.equal(expectedUrl);
    });
  });
});
