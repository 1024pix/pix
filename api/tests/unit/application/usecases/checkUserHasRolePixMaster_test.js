const { expect, sinon } = require('../../../test-helper');
const useCase = require('../../../../lib/application/usecases/checkUserHasRolePixMaster');
const { UserNotFoundError } = require('../../../../lib/domain/errors');
const tokenService = require('../../../../lib/domain/services/token-service');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

describe('Unit | Application | Use Case | CheckUserHasRolePixMaster', () => {

  const accessToken = 'jwt.access.token';

  beforeEach(() => {
    sinon.stub(tokenService, 'extractUserId').resolves();
    sinon.stub(userRepository, 'get');
  });

  afterEach(() => {
    tokenService.extractUserId.restore();
    userRepository.get.restore();
  });

  it('should resolve true when the user (designed by the access_token via its userId) has role PIX_MASTER', () => {
    // given
    const user = {
      hasRolePixMaster: true
    };
    userRepository.get.resolves(user);

    // when
    const promise = useCase.execute(accessToken);

    // then
    return promise.then((result) => {
      expect(result).to.be.true;
    });
  });

  it('should resolve false when the user (designed by the access_token via its userId) has not role PIX_MASTER', () => {
    // given
    const user = {
      hasRolePixMaster: false
    };
    userRepository.get.resolves(user);

    // when
    const promise = useCase.execute(accessToken);

    // then
    return promise.then((result) => {
      expect(result).to.be.false;
    });
  });

  it('should reject with "UserNotFoundError" when userId is unknown in database', () => {
    // given
    userRepository.get.rejects(new UserNotFoundError());

    // when
    const promise = useCase.execute(accessToken);

    // then
    return promise
      .then(() => expect.fail('Expected error but no one was thrown'))
      .catch((err) => {
        expect(err).to.be.an.instanceof(UserNotFoundError);
      });
  });
});
