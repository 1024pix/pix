import { expect, sinon, domainBuilder, catchErr } from '../../../test-helper';
import obfuscationService from '../../../../lib/domain/services/obfuscation-service';
import authenticationMethodRepository from '../../../../lib/infrastructure/repositories/authentication-method-repository';
import User from '../../../../lib/domain/models/User';
import AuthenticationMethod from '../../../../lib/domain/models/AuthenticationMethod';
import { NotFoundError } from '../../../../lib/domain/errors';

describe('Unit | Service | user-authentication-method-obfuscation-service', function () {
  beforeEach(function () {
    sinon.stub(authenticationMethodRepository, 'findOneByUserIdAndIdentityProvider');
  });

  afterEach(function () {
    authenticationMethodRepository.findOneByUserIdAndIdentityProvider.restore();
  });

  describe('#emailObfuscation', function () {
    it('should return obfuscated email', function () {
      // given
      const email = 'johnHarry@example.net';

      // when
      const value = obfuscationService.emailObfuscation(email);

      // then
      expect(value).to.be.equal('j***@example.net');
    });
  });

  describe('#usernameObfuscation', function () {
    it('should return obfuscated username', function () {
      // given
      const username = 'john.harry0702';

      // when
      const value = obfuscationService.usernameObfuscation(username);

      // then
      expect(value).to.be.equal('j***.h***2');
    });
  });

  describe('#getUserAuthenticationMethodWithObfuscation', function () {
    it('should return authenticated with samlId when user is authenticated with samlId only', async function () {
      // given
      const user = domainBuilder.buildUser();
      const authenticationMethod = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
        userId: user.id,
      });
      authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(authenticationMethod);

      // when
      const value = await obfuscationService.getUserAuthenticationMethodWithObfuscation(user);

      // then
      const expectedResult = {
        authenticatedBy: 'samlId',
        value: null,
      };
      expect(value).to.be.deep.equal(expectedResult);
    });

    it('should return authenticated with samlId when user is authenticated with samlId and username', async function () {
      // given
      const username = 'john.harry.0702';
      const user = new User({ username });
      const authenticationMethod = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
        userId: user.id,
        identityProvider: AuthenticationMethod.identityProviders.GAR,
      });
      authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(authenticationMethod);

      // when
      const value = await obfuscationService.getUserAuthenticationMethodWithObfuscation(user);

      // then
      const expectedResult = {
        authenticatedBy: 'samlId',
        value: null,
      };
      expect(value).to.be.deep.equal(expectedResult);
    });

    it('should return authenticated with samlId when user is authenticated with samlId, username and email', async function () {
      // given
      const username = 'john.harry.0702';
      const email = 'john.harry@example.net';
      const user = new User({ username, email });
      const authenticationMethod = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
        userId: user.id,
      });
      authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(authenticationMethod);

      // when
      const value = await obfuscationService.getUserAuthenticationMethodWithObfuscation(user);

      // then
      const expectedResult = {
        authenticatedBy: 'samlId',
        value: null,
      };
      expect(value).to.be.deep.equal(expectedResult);
    });

    it('should return authenticated with username when user is authenticated with username only', async function () {
      // given
      const username = 'john.harry0702';
      const user = new User({ username });

      // when
      const value = await obfuscationService.getUserAuthenticationMethodWithObfuscation(user);
      // then
      const expectedResult = {
        authenticatedBy: 'username',
        value: 'j***.h***2',
      };
      expect(value).to.be.deep.equal(expectedResult);
    });

    it('should return authenticated with username when user is authenticated with username and email', async function () {
      // given
      const username = 'john.harry0702';
      const email = 'john.harry@example.net';
      const user = new User({ username, email });

      // when
      const value = await obfuscationService.getUserAuthenticationMethodWithObfuscation(user);

      // then
      const expectedResult = {
        authenticatedBy: 'username',
        value: 'j***.h***2',
      };
      expect(value).to.be.deep.equal(expectedResult);
    });

    it('should return authenticated with username when user is authenticated with email only', async function () {
      // given
      const email = 'john.harry@example.net';
      const user = new User({ email });

      // when
      const value = await obfuscationService.getUserAuthenticationMethodWithObfuscation(user);

      // then
      const expectedResult = {
        authenticatedBy: 'email',
        value: 'j***@example.net',
      };
      expect(value).to.be.deep.equal(expectedResult);
    });

    it('should throw NotFoundError when user authentication is neither username, email nor samlId', async function () {
      // given
      const user = domainBuilder.buildUser({ username: null, email: null, authenticationMethods: [] });

      // when
      const error = await catchErr(obfuscationService.getUserAuthenticationMethodWithObfuscation)(user);

      // then
      expect(error).to.be.instanceof(NotFoundError);
      expect(error.message).to.equal(
        "Aucune méthode d'authentification trouvée dont le fournisseur d'identité est GAR ou PIX."
      );
    });
  });
});
