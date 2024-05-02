import { UserNotFoundError } from '../../../../../lib/domain/errors.js';
import { PasswordNotMatching } from '../../../../../src/identity-access-management/domain/errors.js';
import { UserLogin } from '../../../../../src/identity-access-management/domain/models/UserLogin.js';
import * as pixAuthenticationService from '../../../../../src/identity-access-management/domain/services/pix-authentication-service.js';
import { User } from '../../../../../src/shared/domain/models/User.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | Services | pix-authentication-service', function () {
  describe('#getUserByUsernameAndPassword', function () {
    const username = 'user@example.net';
    const password = 'Password123';

    let user;
    let userLogin;
    let authenticationMethod;
    let userRepository;
    let userLoginRepository;
    let cryptoService;

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
      userLoginRepository = {
        findByUserId: sinon.stub(),
        create: sinon.stub(),
        update: sinon.stub(),
      };
      cryptoService = {
        checkPassword: sinon.stub(),
      };
    });

    context('When user credentials are valid', function () {
      beforeEach(function () {
        userRepository.getByUsernameOrEmailWithRolesAndPassword.resolves(user);
        userLoginRepository.findByUserId.withArgs(user.id).resolves(userLogin);
        cryptoService.checkPassword.resolves();
      });

      it('should call the user repository', async function () {
        // when
        await pixAuthenticationService.getUserByUsernameAndPassword({
          username,
          password,
          userRepository,
          dependencies: { userLoginRepository, cryptoService },
        });

        // then
        expect(userRepository.getByUsernameOrEmailWithRolesAndPassword).to.has.been.calledWithExactly(username);
      });

      it('should call the cryptoService check function', async function () {
        // given
        const expectedPasswordHash = authenticationMethod.authenticationComplement.password;

        // when
        await pixAuthenticationService.getUserByUsernameAndPassword({
          username,
          password,
          userRepository,
          dependencies: { userLoginRepository, cryptoService },
        });

        // then
        expect(cryptoService.checkPassword).to.has.been.calledWithExactly({
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
          dependencies: { userLoginRepository, cryptoService },
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
            dependencies: { userLoginRepository, cryptoService },
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
            dependencies: { userLoginRepository, cryptoService },
          });

          // then
          expect(resetUserTemporaryBlockingStub).to.have.been.calledOnce;
          expect(userLoginRepository.update).to.have.been.calledWithExactly(userLogin);
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
          dependencies: { userLoginRepository, cryptoService },
        });

        // then
        expect(error).to.be.an.instanceof(UserNotFoundError);
      });

      context('When username exists and password does not match', function () {
        context('When user failed to login for the first time', function () {
          it('throws passwordNotMatching error, increment user failure count and create an user logins', async function () {
            // given
            userRepository.getByUsernameOrEmailWithRolesAndPassword.resolves(user);
            cryptoService.checkPassword.rejects(new PasswordNotMatching());
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
              dependencies: { userLoginRepository, cryptoService },
            });

            // then
            expect(userLoginRepository.create).to.have.been.calledWithExactly({ userId: user.id });
            expect(userLoginCreated.incrementFailureCount).to.have.been.calledOnce;
            expect(userLoginCreated.markUserAsTemporarilyBlocked).to.not.have.been.called;
            expect(userLoginCreated.markUserAsBlocked).to.not.have.been.called;
            expect(userLoginRepository.update).to.have.been.calledWithExactly(userLoginCreated);
            expect(error).to.be.an.instanceof(PasswordNotMatching);
          });
        });

        context('When user failed to login multiple times', function () {
          it('throws passwordNotMatching error, block temporarily the user and update the user logins', async function () {
            // given
            userRepository.getByUsernameOrEmailWithRolesAndPassword.resolves(user);
            cryptoService.checkPassword.rejects(new PasswordNotMatching());
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
              dependencies: { userLoginRepository, cryptoService },
            });

            // then
            expect(userLoginRepository.create).to.not.have.been.called;
            expect(userLogin.incrementFailureCount).to.have.been.calledOnce;
            expect(userLogin.markUserAsTemporarilyBlocked).to.have.been.calledOnce;
            expect(userLogin.markUserAsBlocked).to.not.have.been.called;
            expect(userLoginRepository.update).to.have.been.calledWithExactly(userLogin);
            expect(error).to.be.an.instanceof(PasswordNotMatching);
          });
        });

        context('When user failure count reaches limit', function () {
          it('throws passwordNotMatching error, block the user and update the user logins', async function () {
            // given
            userRepository.getByUsernameOrEmailWithRolesAndPassword.resolves(user);
            cryptoService.checkPassword.rejects(new PasswordNotMatching());
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
              dependencies: { userLoginRepository, cryptoService },
            });

            // then
            expect(userLoginRepository.create).to.not.have.been.called;
            expect(error).to.be.an.instanceof(PasswordNotMatching);
            expect(userLogin.incrementFailureCount).to.have.been.calledOnce;
            expect(userLogin.markUserAsBlocked).to.have.been.calledOnce;
            expect(userLogin.markUserAsTemporarilyBlocked).to.not.have.been.called;
            expect(userLoginRepository.update).to.have.been.calledWithExactly(userLogin);
          });
        });
      });
    });
  });
});
