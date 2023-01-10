const { expect, sinon, domainBuilder, catchErr } = require('../../../../test-helper');
const { PasswordNotMatching, UserNotFoundError } = require('../../../../../lib/domain/errors');

const User = require('../../../../../lib/domain/models/User');
const UserLogin = require('../../../../../lib/domain/models/UserLogin');
const encryptionService = require('../../../../../lib/domain/services/encryption-service');
const pixAuthenticationService = require('../../../../../lib/domain/services/authentication/pix-authentication-service');
const userLoginRepository = require('../../../../../lib/infrastructure/repositories/user-login-repository');

describe('Unit | Domain | Services | pix-authentication-service', function () {
  describe('#getUserByUsernameAndPassword', function () {
    const username = 'user@example.net';
    const password = 'Password123';

    let user;
    let userLogin;
    let authenticationMethod;
    let userRepository;

    beforeEach(function () {
      user = domainBuilder.buildUser({ username });
      authenticationMethod = domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndRawPassword({
        userId: user.id,
        rawPassword: password,
      });
      user.authenticationMethods = [authenticationMethod];
      userLogin = new UserLogin({ userId: user.id });

      userRepository = {
        getByUsernameOrEmailWithRolesAndPassword: sinon.stub(),
      };
      sinon.stub(userLoginRepository, 'findByUserId');
      sinon.stub(userLoginRepository, 'create');
      sinon.stub(userLoginRepository, 'update');

      sinon.stub(encryptionService, 'checkPassword');
    });

    context('When user credentials are valid', function () {
      beforeEach(function () {
        userRepository.getByUsernameOrEmailWithRolesAndPassword.resolves(user);
        userLoginRepository.findByUserId.withArgs(user.id).resolves(userLogin);
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

      context('when user is not temporary blocked', function () {
        it('should not reset password failure count', async function () {
          // given
          const userLogin = { hasFailedAtLeastOnce: sinon.stub().returns(false) };
          userLoginRepository.findByUserId.withArgs(user.id).resolves(userLogin);

          // when
          await pixAuthenticationService.getUserByUsernameAndPassword({
            username,
            password,
            userRepository,
          });

          // then
          expect(userLoginRepository.update).to.not.have.been.called;
        });
      });

      context('when user is temporary blocked', function () {
        it('should reset password failure count', async function () {
          // given
          const user = domainBuilder.buildUser({ username });
          const resetUserTemporaryBlockingStub = sinon.stub();
          const userLogin = {
            hasFailedAtLeastOnce: sinon.stub().returns(true),
            resetUserTemporaryBlocking: resetUserTemporaryBlockingStub,
          };
          userLoginRepository.findByUserId.withArgs(user.id).resolves(userLogin);

          // when
          await pixAuthenticationService.getUserByUsernameAndPassword({
            username,
            password,
            userRepository,
          });

          // then
          expect(resetUserTemporaryBlockingStub).to.have.been.calledOnce;
          expect(userLoginRepository.update).to.have.been.calledWith(userLogin);
        });
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

      context('When username exists and password does not match', function () {
        context('When user failed to login for the first time', function () {
          it('throws passwordNotMatching error, increment user failure count and create an user logins', async function () {
            // given
            userRepository.getByUsernameOrEmailWithRolesAndPassword.resolves(user);
            encryptionService.checkPassword.rejects(new PasswordNotMatching());
            const userLoginCreated = {
              incrementFailureCount: sinon.stub(),
              shouldMarkUserAsTemporarilyBlocked: sinon.stub().returns(false),
              markUserAsTemporarilyBlocked: sinon.stub(),
              shouldMarkUserAsBlocked: sinon.stub().returns(false),
              markUserAsBlocked: sinon.stub(),
            };
            userLoginRepository.findByUserId.withArgs(user.id).resolves(null);
            userLoginRepository.create.resolves(userLoginCreated);

            // when
            const error = await catchErr(pixAuthenticationService.getUserByUsernameAndPassword)({
              username,
              password,
              userRepository,
            });

            // then
            expect(userLoginRepository.create).to.have.been.calledWith({ userId: user.id });
            expect(userLoginCreated.incrementFailureCount).to.have.been.calledOnce;
            expect(userLoginCreated.markUserAsTemporarilyBlocked).to.not.have.been.called;
            expect(userLoginCreated.markUserAsBlocked).to.not.have.been.called;
            expect(userLoginRepository.update).to.have.been.calledWith(userLoginCreated);
            expect(error).to.be.an.instanceof(PasswordNotMatching);
          });
        });

        context('When user failed to login multiple times', function () {
          it('throws passwordNotMatching error, block temporarily the user and update the user logins', async function () {
            // given
            userRepository.getByUsernameOrEmailWithRolesAndPassword.resolves(user);
            encryptionService.checkPassword.rejects(new PasswordNotMatching());
            const userLogin = {
              incrementFailureCount: sinon.stub(),
              shouldMarkUserAsTemporarilyBlocked: sinon.stub().returns(true),
              markUserAsTemporarilyBlocked: sinon.stub(),
              shouldMarkUserAsBlocked: sinon.stub().returns(false),
              markUserAsBlocked: sinon.stub(),
            };
            userLoginRepository.findByUserId.withArgs(user.id).resolves(userLogin);

            // when
            const error = await catchErr(pixAuthenticationService.getUserByUsernameAndPassword)({
              username,
              password,
              userRepository,
            });

            // then
            expect(userLoginRepository.create).to.not.have.been.called;
            expect(userLogin.incrementFailureCount).to.have.been.calledOnce;
            expect(userLogin.markUserAsTemporarilyBlocked).to.have.been.calledOnce;
            expect(userLogin.markUserAsBlocked).to.not.have.been.called;
            expect(userLoginRepository.update).to.have.been.calledWith(userLogin);
            expect(error).to.be.an.instanceof(PasswordNotMatching);
          });
        });

        context('When user failure count reaches limit', function () {
          it('throws passwordNotMatching error, block the user and update the user logins', async function () {
            // given
            userRepository.getByUsernameOrEmailWithRolesAndPassword.resolves(user);
            encryptionService.checkPassword.rejects(new PasswordNotMatching());
            const userLogin = {
              incrementFailureCount: sinon.stub(),
              shouldMarkUserAsTemporarilyBlocked: sinon.stub().returns(false),
              markUserAsTemporarilyBlocked: sinon.stub(),
              shouldMarkUserAsBlocked: sinon.stub().returns(true),
              markUserAsBlocked: sinon.stub(),
            };
            userLoginRepository.findByUserId.withArgs(user.id).resolves(userLogin);

            // when
            const error = await catchErr(pixAuthenticationService.getUserByUsernameAndPassword)({
              username,
              password,
              userRepository,
            });

            // then
            expect(userLoginRepository.create).to.not.have.been.called;
            expect(error).to.be.an.instanceof(PasswordNotMatching);
            expect(userLogin.incrementFailureCount).to.have.been.calledOnce;
            expect(userLogin.markUserAsBlocked).to.have.been.calledOnce;
            expect(userLogin.markUserAsTemporarilyBlocked).to.not.have.been.called;
            expect(userLoginRepository.update).to.have.been.calledWith(userLogin);
          });
        });
      });
    });
  });
});
