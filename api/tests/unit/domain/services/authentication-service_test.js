const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');

const { UserNotFoundError, PasswordNotMatching } = require('../../../../lib/domain/errors');
const User = require('../../../../lib/domain/models/User');

const encryptionService = require('../../../../lib/domain/services/encryption-service');
const service = require('../../../../lib/domain/services/authentication-service');

describe('Unit | Domain | Services | authentication', () => {

  describe('#getUserByUsernameAndPassword', () => {

    const username = 'user@example.net';
    const password = 'userPassword';

    let userRepository;

    beforeEach(() => {
      userRepository = {
        getByUsernameOrEmailWithRoles: sinon.stub()
      };
      sinon.stub(encryptionService, 'check');
    });

    context('When user exist', () => {

      let user;

      beforeEach(() => {
        user = domainBuilder.buildUser({ username, password });
        userRepository.getByUsernameOrEmailWithRoles.resolves(user);
        encryptionService.check.resolves();
      });

      it('should call the user repository', async () => {
        // when
        await service.getUserByUsernameAndPassword({ username, password, userRepository });

        // then
        expect(userRepository.getByUsernameOrEmailWithRoles).to.has.been.calledWith(username);
      });

      it('should call the encryptionService check function', async () => {
        // when
        await service.getUserByUsernameAndPassword({ username, password, userRepository });

        // then
        expect(encryptionService.check).to.has.been.calledWith(password, user.password);
      });

      it('should return user found', async () => {
        // when
        const foundUser = await service.getUserByUsernameAndPassword({ username, password, userRepository });

        // then
        expect(foundUser).to.be.an.instanceof(User);
        expect(foundUser).to.equal(user);
      });
    });

    context('When user credentials are not valid', () => {

      it('should throw UserNotFoundError when username does not exist', async () => {
        // given
        userRepository.getByUsernameOrEmailWithRoles.rejects(new UserNotFoundError());

        // when
        const error = await catchErr(service.getUserByUsernameAndPassword)({ username, password, userRepository });

        // then
        expect(error).to.be.an.instanceof(UserNotFoundError);
      });

      it('should throw PasswordNotMatching when password does not match', async () => {
        // given
        userRepository.getByUsernameOrEmailWithRoles.resolves({});
        encryptionService.check.rejects(new PasswordNotMatching());

        // when
        const error = await catchErr(service.getUserByUsernameAndPassword)({ username, password, userRepository });

        // then
        expect(error).to.be.an.instanceof(PasswordNotMatching);
      });
    });
  });

});
