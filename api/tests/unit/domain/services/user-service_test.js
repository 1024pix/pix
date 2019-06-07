const { expect, sinon } = require('../../../test-helper');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const userService = require('../../../../lib/domain/services/user-service');
const { UserNotFoundError } = require('../../../../lib/domain/errors');

const User = require('../../../../lib/domain/models/User');

describe('Unit | Service | User Service', () => {

  describe('#isUserExistingByEmail', () => {

    const email = 'shi@fu.me';

    beforeEach(() => {
      sinon.stub(userRepository, 'findByEmail');
    });

    it('should call a userRepository#findByEmail', () => {
      // given
      userRepository.findByEmail.resolves();

      // when
      const promise = userService.isUserExistingByEmail(email);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(userRepository.findByEmail);
        sinon.assert.calledWith(userRepository.findByEmail, email);
      });
    });

    it('should return true, when user is found', () => {
      // given
      const foundUser = new User({});
      userRepository.findByEmail.resolves(foundUser);

      // when
      const promise = userService.isUserExistingByEmail(email);

      // then
      return promise.then((result) => {
        expect(result).to.equal(true);
      });
    });

    it('should throw an error, when no user found', () => {
      // given
      userRepository.findByEmail.rejects();

      // when
      const promise = userService.isUserExistingByEmail(email);

      // then
      return promise.catch((result) => {
        expect(result).to.be.an.instanceOf(UserNotFoundError);
      });
    });
  });

  describe('#isUserExistingById', () => {

    const userId = 4367;

    beforeEach(() => {
      sinon.stub(userRepository, 'get');
    });

    it('should call a userRepository.get', () => {
      // given
      userRepository.get.resolves();

      // when
      const promise = userService.isUserExistingById(userId);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(userRepository.get);
        sinon.assert.calledWith(userRepository.get, userId);
      });
    });

    it('should return true, when user is found', () => {
      // given
      const foundUser = {};
      userRepository.get.resolves(foundUser);

      // when
      const promise = userService.isUserExistingById(userId);

      // then
      return promise.then((result) => {
        expect(result).to.equal(true);
      });
    });

    it('should throw an error, when no user found', () => {
      // given
      userRepository.get.rejects();

      // when
      const promise = userService.isUserExistingById(userId);

      // then
      return promise.catch((result) => {
        expect(result).to.be.an.instanceOf(Error);
      });
    });
  });
});
