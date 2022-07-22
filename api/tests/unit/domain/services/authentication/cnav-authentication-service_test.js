const { expect, sinon } = require('../../../../test-helper');
const jsonwebtoken = require('jsonwebtoken');
const cnavAuthenticationService = require('../../../../../lib/domain/services/authentication/cnav-authentication-service');
const UserToCreate = require('../../../../../lib/domain/models/UserToCreate');
const AuthenticationMethod = require('../../../../../lib/domain/models/AuthenticationMethod');
const DomainTransaction = require('../../../../../lib/infrastructure/DomainTransaction');

describe('Unit | Domain | Services | cnav-authentication-service', function () {
  let userToCreateRepository, authenticationMethodRepository;
  let domainTransaction;

  beforeEach(function () {
    domainTransaction = Symbol();
    DomainTransaction.execute = (lambda) => {
      return lambda(domainTransaction);
    };

    userToCreateRepository = {
      create: sinon.stub(),
    };
    authenticationMethodRepository = {
      create: sinon.stub(),
    };
  });

  describe('#getUserInfo', function () {
    it('should return firstName, lastName, nonce and external identity id', async function () {
      // given
      function generateIdToken(payload) {
        return jsonwebtoken.sign(
          {
            ...payload,
          },
          'secret'
        );
      }

      const given_name = 'givenName';
      const family_name = 'familyName';
      const nonce = 'bb041272-d6e6-457c-99fb-ff1aa02217fd';
      const sub = '094b83ac-2e20-4aa8-b438-0bc91748e4a6';

      const idToken = generateIdToken({
        given_name,
        family_name,
        nonce,
        sub,
      });

      // when
      const result = await cnavAuthenticationService.getUserInfo({ idToken });

      // then
      expect(result).to.deep.equal({
        firstName: given_name,
        lastName: family_name,
        nonce,
        externalIdentityId: sub,
      });
    });
  });

  describe('#createUserAccount', function () {
    it('should return user id', async function () {
      // given
      const externalIdentityId = '1233BBBC';
      const user = new UserToCreate({
        firstName: 'Adam',
        lastName: 'Troisjours',
      });
      const userId = 1;
      userToCreateRepository.create.withArgs({ user, domainTransaction }).resolves({ id: userId });

      const expectedAuthenticationMethod = new AuthenticationMethod({
        identityProvider: AuthenticationMethod.identityProviders.CNAV,
        externalIdentifier: externalIdentityId,
        userId,
      });

      // when
      const result = await cnavAuthenticationService.createUserAccount({
        user,
        externalIdentityId,
        userToCreateRepository,
        authenticationMethodRepository,
      });

      // then
      expect(authenticationMethodRepository.create).to.have.been.calledWith({
        authenticationMethod: expectedAuthenticationMethod,
        domainTransaction,
      });
      expect(result).to.be.deep.equal({ userId });
    });
  });
});
