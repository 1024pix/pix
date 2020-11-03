const { expect, sinon, domainBuilder } = require('../../../test-helper');
const obfuscationService = require('../../../../lib/domain/services/obfuscation-service');
const authenticationMethodRepository = require('../../../../lib/infrastructure/repositories/authentication-method-repository');
const User = require('../../../../lib/domain/models/User');
const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');

describe('Unit | Service | user-authentication-method-obfuscation-service', () => {

  beforeEach(() => {
    authenticationMethodRepository.findOneByUserIdAndIdentityProvider = sinon.stub().resolves();
  });

  describe('#emailObfuscation', () => {

    it('should return obfuscated email',() => {
      // Given
      const email = 'johnHarry@example.net';
      // When
      const value = obfuscationService.emailObfuscation(email);
      //Then
      expect(value).to.be.equal('j***@example.net');
    });

  });

  describe('#usernameObfuscation', () => {

    it('should return obfuscated username',() => {
      // Given
      const username = 'john.harry0702';
      // When
      const value = obfuscationService.usernameObfuscation(username);
      //Then
      expect(value).to.be.equal('j***.h***2');
    });

  });

  describe('#getUserAuthenticationMethodWithObfuscation', () => {

    it('should return authenticated with samlId when user is authenticated with samlId only', async () => {
      // Given
      const user = domainBuilder.buildUser();
      const authenticationMethod = domainBuilder.buildAuthenticationMethod({ userId: user.id, identityProvider: AuthenticationMethod.identityProviders.GAR });
      authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(authenticationMethod);

      // When
      const value = await obfuscationService.getUserAuthenticationMethodWithObfuscation(user);

      //Then
      const expectedResult = {
        authenticatedBy : 'samlId',
        value: null,
      };
      expect(value).to.be.deep.equal(expectedResult);
    });

    it('should return authenticated with samlId when user is authenticated with samlId and username', async () => {
      // Given
      const username = 'john.harry.0702';
      const user = new User({ username });
      const authenticationMethod = domainBuilder.buildAuthenticationMethod({ userId: user.id, identityProvider: AuthenticationMethod.identityProviders.GAR });
      authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(authenticationMethod);

      // When
      const value = await obfuscationService.getUserAuthenticationMethodWithObfuscation(user);

      //Then
      const expectedResult = {
        authenticatedBy : 'samlId',
        value: null,
      };
      expect(value).to.be.deep.equal(expectedResult);
    });

    it('should return authenticated with samlId when user is authenticated with samlId, username and email', async () => {
      // Given
      const username = 'john.harry.0702';
      const email = 'john.harry@example.net';
      const user = new User({ username, email });
      const authenticationMethod = domainBuilder.buildAuthenticationMethod({ userId: user.id, identityProvider: AuthenticationMethod.identityProviders.GAR });
      authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(authenticationMethod);

      // When
      const value = await obfuscationService.getUserAuthenticationMethodWithObfuscation(user);

      //Then
      const expectedResult = {
        authenticatedBy : 'samlId',
        value: null,
      };
      expect(value).to.be.deep.equal(expectedResult);
    });

    it('should return authenticated with username when user is authenticated with username only', async () => {
      // Given
      const username = 'john.harry0702';
      const user = new User({ username });

      // When
      const value = await obfuscationService.getUserAuthenticationMethodWithObfuscation(user);
      //Then
      const expectedResult = {
        authenticatedBy : 'username',
        value: 'j***.h***2',
      };
      expect(value).to.be.deep.equal(expectedResult);
    });

    it('should return authenticated with username when user is authenticated with username and email', async () => {
      // Given
      const username = 'john.harry0702';
      const email = 'john.harry@example.net';
      const user = new User({ username, email });

      // When
      const value = await obfuscationService.getUserAuthenticationMethodWithObfuscation(user);

      //Then
      const expectedResult = {
        authenticatedBy : 'username',
        value: 'j***.h***2',
      };
      expect(value).to.be.deep.equal(expectedResult);
    });

    it('should return authenticated with username when user is authenticated with email only', async () => {
      // Given
      const email = 'john.harry@example.net';
      const user = new User({ email });

      // When
      const value = await obfuscationService.getUserAuthenticationMethodWithObfuscation(user);

      //Then
      const expectedResult = {
        authenticatedBy : 'email',
        value: 'j***@example.net',
      };
      expect(value).to.be.deep.equal(expectedResult);
    });
  });
});
