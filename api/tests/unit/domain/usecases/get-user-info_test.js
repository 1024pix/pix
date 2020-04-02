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
