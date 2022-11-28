const { expect, sinon, domainBuilder, catchErr } = require('../../../../test-helper');
const { PasswordNotMatching, UserNotFoundError } = require('../../../../../lib/domain/errors');

const User = require('../../../../../lib/domain/models/User');
const encryptionService = require('../../../../../lib/domain/services/encryption-service');
const pixAuthenticationService = require('../../../../../lib/domain/services/authentication/pix-authentication-service');

describe('Unit | Domain | Services | pix-authentication-service', function () {
  describe('#getUserByUsernameAndPassword', function () {
    const username = 'user@example.net';
    const password = 'Password123';

    let user;
    let authenticationMethod;
    let userRepository;

    beforeEach(function () {
      user = domainBuilder.buildUser({ username });
      authenticationMethod = domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndRawPassword({
        userId: user.id,
        rawPassword: password,
      });
      user.authenticationMethods = [authenticationMethod];

      userRepository = {
        getByUsernameOrEmailWithRolesAndPassword: sinon.stub(),
      };
      sinon.stub(encryptionService, 'checkPassword');
    });

    context('When user credentials are valid', function () {
      beforeEach(function () {
        userRepository.getByUsernameOrEmailWithRolesAndPassword.resolves(user);
        encryptionService.checkPassword.resolves();
      });

      it('should call the user repository', async function () {
        // when
        await pixAuthenticationService.getUserByUsernameAndPassword({
          username,
          password,
          userRepository,
        });

        // then
        expect(userRepository.getByUsernameOrEmailWithRolesAndPassword).to.has.been.calledWith(username);
      });

      it('should call the encryptionService check function', async function () {
        // given
        const expectedPasswordHash = authenticationMethod.authenticationComplement.password;

        // when
        await pixAuthenticationService.getUserByUsernameAndPassword({
          username,
          password,
          userRepository,
        });

        // then
        expect(encryptionService.checkPassword).to.has.been.calledWith({
          password,
          passwordHash: expectedPasswordHash,
        });
      });

      it('should return user found', async function () {
        // when
        const foundUser = await pixAuthenticationService.getUserByUsernameAndPassword({
          username,
          password,
          userRepository,
        });

        // then
        expect(foundUser).to.be.an.instanceof(User);
        expect(foundUser).to.equal(user);
      });
    });

    context('When user credentials are not valid', function () {
      it('should throw UserNotFoundError when username does not exist', async function () {
        // given
        userRepository.getByUsernameOrEmailWithRolesAndPassword.rejects(new UserNotFoundError());

        // when
        const error = await catchErr(pixAuthenticationService.getUserByUsernameAndPassword)({
          username,
          password,
          userRepository,
        });

        // then
        expect(error).to.be.an.instanceof(UserNotFoundError);
      });

      it('should throw PasswordNotMatching when password does not match', async function () {
        // given
        userRepository.getByUsernameOrEmailWithRolesAndPassword.resolves(user);
        encryptionService.checkPassword.rejects(new PasswordNotMatching());

        // when
        const error = await catchErr(pixAuthenticationService.getUserByUsernameAndPassword)({
          username,
          password,
          userRepository,
        });

        // then
        expect(error).to.be.an.instanceof(PasswordNotMatching);
      });
    });
  });
});
