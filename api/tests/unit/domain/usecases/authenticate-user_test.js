const { expect, sinon, domainBuilder } = require('../../../test-helper');
const authenticateUser = require('../../../../lib/domain/usecases/authenticate-user');
const User = require('../../../../lib/domain/models/User');
const { MissingOrInvalidCredentialsError, PasswordNotMatching, ForbiddenAccess } = require('../../../../lib/domain/errors');
const encryptionService = require('../../../../lib/domain/services/encryption-service');
const appMessages = require('../../../../lib/domain/constants');

function _expectTreatmentToFailWithMissingOrInvalidCredentialsError(promise) {
  return expect(promise).to.be.an.rejectedWith(MissingOrInvalidCredentialsError, 'Missing or invalid credentials');
}

describe('Unit | Application | Use Case | authenticate-user', () => {

  let userRepository;
  let tokenService;

  const userEmail = 'user@example.net';
  const userPassword = 'user_password';

  beforeEach(() => {
    userRepository = { getByUsernameOrEmailWithRoles: sinon.stub() };
    tokenService = { createTokenFromUser: sinon.stub() };
    sinon.stub(encryptionService, 'check');
  });

  it('should resolves a valid JWT access token when authentication succeeded', () => {
    // given
    const accessToken = 'jwt.access.token';
    const user = domainBuilder.buildUser({ email: userEmail, password: userPassword });
    userRepository.getByUsernameOrEmailWithRoles.resolves(user);
    encryptionService.check.resolves();
    tokenService.createTokenFromUser.returns(accessToken);

    // when
    const promise = authenticateUser({ username: userEmail, userPassword, userRepository, tokenService });

    // then
    return promise.then((accessToken) => {
      expect(userRepository.getByUsernameOrEmailWithRoles).to.have.been.calledWithExactly(userEmail);
      expect(tokenService.createTokenFromUser).to.have.been.calledWithExactly(user, 'pix');
      expect(accessToken).to.equal(accessToken);
    });
  });

  it('should rejects an error when given username (email) does not match an existing one', () => {
    // given
    const unknownUserEmail = 'unknown_user_email@example.net';
    const error = new Error('Simulates BookshelfUser.NotFoundError');
    userRepository.getByUsernameOrEmailWithRoles.rejects(error);

    // when
    const promise = authenticateUser({ username: unknownUserEmail, userPassword, userRepository, tokenService });

    // then
    return _expectTreatmentToFailWithMissingOrInvalidCredentialsError(promise);
  });

  it('should rejects an error when given password does not match the found user’s one', () => {
    // given
    const user = new User({ email: userEmail, password: userPassword });
    userRepository.getByUsernameOrEmailWithRoles.resolves(user);
    encryptionService.check.rejects(new PasswordNotMatching());

    // when
    const promise = authenticateUser({ userEmail, userPassword, userRepository, tokenService });

    // then
    return _expectTreatmentToFailWithMissingOrInvalidCredentialsError(promise);
  });

  context('scope access', () => {

    it('rejects an error when scope is pix-orga and user is not linked to any organizations', function() {
      // given
      const wrongUserPassword = 'wrong_password';
      const scope = appMessages.PIX_ORGA.SCOPE;
      const user = new User({ email: userEmail, password: userPassword, memberships: [] });
      userRepository.getByUsernameOrEmailWithRoles.resolves(user);

      // when
      const promise = authenticateUser({ userEmail, wrongUserPassword, scope, userRepository, tokenService });

      // then
      return expect(promise).to.be.rejectedWith(ForbiddenAccess, appMessages.PIX_ORGA.NOT_LINKED_ORGANIZATION_MSG);
    });

    it('rejects an error when scope is pix-admin and user has not pix master role', function() {
      // given
      const scope = appMessages.PIX_ADMIN.SCOPE;
      const user = new User({ email: userEmail, password: userPassword, pixRoles: [] });
      userRepository.getByUsernameOrEmailWithRoles.resolves(user);

      // when
      const promise = authenticateUser({ userEmail, userPassword, scope, userRepository, tokenService });

      // then
      return expect(promise).to.be.rejectedWith(ForbiddenAccess, appMessages.PIX_ADMIN.NOT_PIXMASTER_MSG);
    });

    it('rejects an error when scope is pix-certif and user is not linked to any certification centers', function() {
      // given
      const scope = appMessages.PIX_CERTIF.SCOPE;
      const user = domainBuilder.buildUser({ email: userEmail, password: userPassword, certificationCenterMemberships: [] });
      userRepository.getByUsernameOrEmailWithRoles.resolves(user);

      // when
      const promise = authenticateUser({ userEmail, userPassword, scope, userRepository, tokenService });

      // then
      return expect(promise).to.be.rejectedWith(ForbiddenAccess,appMessages.PIX_CERTIF.NOT_LINKED_CERTIFICATION_MSG);
    });
  });

});
