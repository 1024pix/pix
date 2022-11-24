const { expect, sinon, domainBuilder, catchErr } = require('../../../../test-helper');
const { PasswordNotMatching, UserNotFoundError } = require('../../../../../lib/domain/errors');

const User = require('../../../../../lib/domain/models/User');
const encryptionService = require('../../../../../lib/domain/services/encryption-service');
const pixAuthenticationService = require('../../../../../lib/domain/services/authentication/pix-authentication-service');
const userLoginRepository = require('../../../../../lib/infrastructure/repositories/user-login-repository');

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
      sinon.stub(userLoginRepository, 'findByUserId');
      sinon.stub(userLoginRepository, 'create');
      sinon.stub(userLoginRepository, 'update');

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

      context('When username exists and password does not match', function () {
        context('When user failed to login for the first time', function () {
          it('should throw passwordNotMatching error and create an user logins', async function () {
            // given
            userRepository.getByUsernameOrEmailWithRolesAndPassword.resolves(user);
            encryptionService.checkPassword.rejects(new PasswordNotMatching());
            const incrementFailureCountStub = sinon.stub();
            const userLoginCreated = { incrementFailureCount: incrementFailureCountStub };
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
            expect(incrementFailureCountStub).to.have.been.calledOnce;
            expect(userLoginRepository.update).to.have.been.calledWith(userLoginCreated);
            expect(error).to.be.an.instanceof(PasswordNotMatching);
          });
        });

        context('When user failed to login multiple times', function () {
          it('should throw passwordNotMatching error and update the user logins', async function () {
            // given
            userRepository.getByUsernameOrEmailWithRolesAndPassword.resolves(user);
            encryptionService.checkPassword.rejects(new PasswordNotMatching());
            const incrementFailureCountStub = sinon.stub();
            const userLogin = { incrementFailureCount: incrementFailureCountStub };
            userLoginRepository.findByUserId.withArgs(user.id).resolves(userLogin);

            // when
            const error = await catchErr(pixAuthenticationService.getUserByUsernameAndPassword)({
              username,
              password,
              userRepository,
            });

            // then
            expect(userLoginRepository.create).to.not.have.been.called;
            expect(incrementFailureCountStub).to.have.been.calledOnce;
            expect(userLoginRepository.update).to.have.been.calledWith(userLogin);
            expect(error).to.be.an.instanceof(PasswordNotMatching);
          });
        });
      });
    });
  });
});
