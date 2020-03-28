const { expect, sinon, catchErr } = require('../../../test-helper');
const getUserInfo = require('../../../../lib/domain/usecases/get-user-info');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-user-info', () => {
  let userId;
  let userRepository;

  beforeEach(() => {
    userRepository = { get: sinon.stub() };
  });

  context('when user id is not a number', () => {

    it('should throw a NotFound error', async () => {
      // given
      userId = 'notANumber';

      // when
      const error = await catchErr(getUserInfo)({ userId, userRepository });

      // then
      expect(error).to.be.an.instanceOf(NotFoundError);
    });
  });

  context('when user id is a number', () => {
    const returnedUser = Symbol('returnedUser');

    beforeEach(() => {
      userId = 1;
    });

    context('when the user does not exist', () => {

      beforeEach(() => {
        userRepository.get.withArgs(userId).rejects();
      });

      it('should throw a NotFound error when getting the user', async () => {
        // when
        const error = await catchErr(getUserInfo)({ userId, userRepository });

        // then
        sinon.assert.calledOnce(userRepository.get);
        expect(error).to.be.an.instanceOf(NotFoundError);
      });
    });

    context('when the user exists', () => {

      beforeEach(() => {
        userRepository.get.withArgs(userId).resolves(returnedUser);
      });

      it('should return the user', async () => {
        // when
        const actualUser = await getUserInfo({ userId, userRepository });

        // then
        expect(actualUser).to.equal(returnedUser);
      });
    });
  });
});
