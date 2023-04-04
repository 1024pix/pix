const { expect, sinon } = require('../../../../test-helper');
const UserToCreate = require('../../../../../lib/domain/models/UserToCreate');
const DomainTransaction = require('../../../../../lib/infrastructure/DomainTransaction');
const AuthenticationMethod = require('../../../../../lib/domain/models/AuthenticationMethod');
const OidcIdentityProviders = require('../../../../../lib/domain/constants/oidc-identity-providers');
const PoleEmploiOidcAuthenticationService = require('../../../../../lib/domain/services/authentication/pole-emploi-oidc-authentication-service');
const { temporaryStorage } = require('../../../../../lib/infrastructure/temporary-storage/index.js');
const logoutUrlTemporaryStorage = temporaryStorage.withPrefix('logout-url:');

describe('Unit | Domain | Services | pole-emploi-oidc-authentication-service', function () {
  describe('#createUserAccount', function () {
    let userToCreateRepository, authenticationMethodRepository;
    let domainTransaction;
    let clock;
    const now = new Date('2021-01-02');

    beforeEach(function () {
      domainTransaction = Symbol();
      DomainTransaction.execute = (lambda) => {
        return lambda(domainTransaction);
      };

      clock = sinon.useFakeTimers(now);

      userToCreateRepository = {
        create: sinon.stub(),
      };
      authenticationMethodRepository = {
        create: sinon.stub(),
      };
    });

    afterEach(function () {
      clock.restore();
    });

    it('should return id token and user id', async function () {
      // given
      const externalIdentityId = '1233BBBC';
      const sessionContent = {
        accessToken: 'accessToken',
        idToken: 'idToken',
        expiresIn: 10,
        refreshToken: 'refreshToken',
      };
      const user = new UserToCreate({
        firstName: 'Adam',
        lastName: 'Troisjours',
      });
      const userId = 1;
      userToCreateRepository.create.withArgs({ user, domainTransaction }).resolves({ id: userId });

      const expectedAuthenticationMethod = new AuthenticationMethod({
        identityProvider: OidcIdentityProviders.POLE_EMPLOI.service.code,
        externalIdentifier: externalIdentityId,
        authenticationComplement: new AuthenticationMethod.OidcAuthenticationComplement({
          accessToken: sessionContent.accessToken,
          refreshToken: sessionContent.refreshToken,
          expiredDate: new Date('2021-01-02T00:00:10Z'),
        }),
        userId,
      });
      const poleEmploiAuthenticationService = new PoleEmploiOidcAuthenticationService();

      // when
      const result = await poleEmploiAuthenticationService.createUserAccount({
        user,
        sessionContent,
        externalIdentityId,
        userToCreateRepository,
        authenticationMethodRepository,
      });

      // then
      expect(authenticationMethodRepository.create).to.have.been.calledWith({
        authenticationMethod: expectedAuthenticationMethod,
        domainTransaction,
      });
      expect(result).to.equal(userId);
    });
  });

  describe('#getRedirectLogoutUrl', function () {
    it('should return a redirect logout url', async function () {
      // given
      const idToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const userId = '1';
      const logoutUrlUUID = '1f3dbb71-f399-4c1c-85ae-0a863c78aeea';
      const key = `${userId}:${logoutUrlUUID}`;
      await logoutUrlTemporaryStorage.save({ key, value: idToken, expirationDelaySeconds: 1140 });
      const poleEmploiOidcAuthenticationService = new PoleEmploiOidcAuthenticationService();

      // when
      const redirectTarget = await poleEmploiOidcAuthenticationService.getRedirectLogoutUrl({
        userId,
        logoutUrlUUID,
      });

      // then
      expect(redirectTarget).to.equal(
        'http://logout-url.fr/?id_token_hint=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c&redirect_uri=http%3A%2F%2Fafter-logout.url'
      );
    });

    it('removes idToken from temporary storage', async function () {
      // given
      const idToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const userId = '2';
      const logoutUrlUUID = 'f9f1b471-a74e-4722-8dde-f5731279146a';
      const key = `${userId}:${logoutUrlUUID}`;
      await logoutUrlTemporaryStorage.save({ key, value: idToken, expirationDelaySeconds: 1140 });
      const poleEmploiOidcAuthenticationService = new PoleEmploiOidcAuthenticationService();

      // when
      await poleEmploiOidcAuthenticationService.getRedirectLogoutUrl({
        userId,
        logoutUrlUUID,
      });
      const expectedIdToken = await logoutUrlTemporaryStorage.get(key);

      // then
      expect(expectedIdToken).to.be.undefined;
    });
  });

  describe('#saveIdToken', function () {
    it('should return an uuid', async function () {
      // given
      const uuidPattern = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);
      const idToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const userId = '123';
      const poleEmploiOidcAuthenticationService = new PoleEmploiOidcAuthenticationService();

      // when
      const uuid = await poleEmploiOidcAuthenticationService.saveIdToken({ idToken, userId });
      const result = await logoutUrlTemporaryStorage.get(`123:${uuid}`);

      // then
      expect(uuid.match(uuidPattern)).to.be.ok;
      expect(result).to.equal(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      );
    });
  });

  describe('#createAuthenticationComplement', function () {
    it('should create pole emploi authentication complement', function () {
      // given
      const sessionContent = {
        accessToken: 'accessToken',
        idToken: 'idToken',
        expiresIn: 10,
        refreshToken: 'refreshToken',
      };
      const poleEmploiOidcAuthenticationService = new PoleEmploiOidcAuthenticationService();

      // when
      const result = poleEmploiOidcAuthenticationService.createAuthenticationComplement({ sessionContent });

      // then
      expect(result).to.be.instanceOf(AuthenticationMethod.OidcAuthenticationComplement);
    });
  });
});
