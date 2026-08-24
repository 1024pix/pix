import sinon from 'sinon';

import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../src/identity-access-management/domain/constants/identity-providers.js';
import { User } from '../../../../../src/identity-access-management/domain/models/User.js';
import { getObfuscatedAuthenticationMethod } from '../../../../../src/identity-access-management/domain/services/obfuscation-service.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Identity Access Management | Unit | Service | user-authentication-method-obfuscation-service', function () {
  let userRepository;
  let authenticationMethodRepository;

  beforeEach(function () {
    userRepository = {
      get: sinon.stub(),
    };
    authenticationMethodRepository = {
      findOneByUserIdAndIdentityProvider: sinon.stub(),
    };
  });

  describe('#getUserAuthenticationMethodWithObfuscation', function () {
    it('should return authenticated with samlId when user is authenticated with samlId only', async function () {
      // given
      const user = domainBuilder.buildUser();
      const authenticationMethod = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
        userId: user.id,
      });
      userRepository.get.resolves(user);
      authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(authenticationMethod);

      // when
      const value = await getObfuscatedAuthenticationMethod(user.id, {
        userRepository,
        authenticationMethodRepository,
      });

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
        identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
      });
      userRepository.get.resolves(user);
      authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(authenticationMethod);

      // when
      const value = await getObfuscatedAuthenticationMethod(user.id, {
        userRepository,
        authenticationMethodRepository,
      });

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
      userRepository.get.resolves(user);
      authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(authenticationMethod);

      // when
      const value = await getObfuscatedAuthenticationMethod(user.id, {
        userRepository,
        authenticationMethodRepository,
      });

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
      userRepository.get.resolves(user);

      // when
      const value = await getObfuscatedAuthenticationMethod(user.id, {
        userRepository,
        authenticationMethodRepository,
      });
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
      userRepository.get.resolves(user);

      // when
      const value = await getObfuscatedAuthenticationMethod(user.id, {
        userRepository,
        authenticationMethodRepository,
      });

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
      userRepository.get.resolves(user);

      // when
      const value = await getObfuscatedAuthenticationMethod(user.id, {
        userRepository,
        authenticationMethodRepository,
      });

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
      userRepository.get.resolves(user);

      // when
      const error = await catchErr(getObfuscatedAuthenticationMethod)(user.id, {
        userRepository,
        authenticationMethodRepository,
      });

      // then
      expect(error).to.be.instanceof(NotFoundError);
      expect(error.message).to.equal(
        "Aucune méthode d'authentification trouvée dont le fournisseur d'identité est GAR ou PIX.",
      );
    });
  });
});
