const { expect, sinon } = require('../../../test-helper');
const useCase = require('../../../../lib/application/usecases/checkUserHasRoleSuperAdmin');
const tokenService = require('../../../../lib/domain/services/token-service');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

describe('Unit | Application | Use Case | checkUserHasRoleSuperAdmin', function () {
  const accessToken = 'jwt.access.token';

  beforeEach(function () {
    sinon.stub(tokenService, 'extractUserId').resolves();
    sinon.stub(userRepository, 'isSuperAdmin');
  });

  it('should resolve true when the user (designed by the access_token via its userId) has role Super Admin', function () {
    // given
    userRepository.isSuperAdmin.resolves(true);

    // when
    const promise = useCase.execute(accessToken);

    // then
    return promise.then((result) => {
      expect(result).to.be.true;
    });
  });

  it('should resolve false when the user (designed by the access_token via its userId) has not role Super Admin', function () {
    // given
    userRepository.isSuperAdmin.resolves(false);

    // when
    const promise = useCase.execute(accessToken);

    // then
    return promise.then((result) => {
      expect(result).to.be.false;
    });
  });
});
