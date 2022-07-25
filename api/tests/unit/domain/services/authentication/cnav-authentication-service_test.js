const { expect, sinon } = require('../../../../test-helper');
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
