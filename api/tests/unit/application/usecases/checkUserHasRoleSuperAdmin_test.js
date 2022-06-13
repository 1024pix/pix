const { expect, sinon, catchErr } = require('../../../test-helper');
const useCase = require('../../../../lib/application/usecases/checkUserHasRoleSuperAdmin');
const tokenService = require('../../../../lib/domain/services/token-service');
const adminMemberRepository = require('../../../../lib/infrastructure/repositories/admin-member-repository');
const { ForbiddenAccess } = require('../../../../lib/domain/errors');

describe('Unit | Application | Use Case | checkUserHasRoleSuperAdmin', function () {
  const userId = '1234';

  beforeEach(function () {
    sinon.stub(tokenService, 'extractUserId').resolves(userId);
    sinon.stub(adminMemberRepository, 'get');
  });

  it('should resolve true when the admin member has role super admin', function () {
    // given
    adminMemberRepository.get.resolves({ isSuperAdmin: true });

    // when
    const promise = useCase.execute(userId);

    // then
    return promise.then((result) => {
      expect(result).to.be.true;
    });
  });

  it('should resolve false when the admin member has not role admin', function () {
    // given
    adminMemberRepository.get.resolves({ isSuperAdmin: false });

    // when
    const promise = useCase.execute(userId);

    // then
    return promise.then((result) => {
      expect(result).to.be.false;
    });
  });

  it('should throw an error when there is no admin member related to the user', async function () {
    // given
    adminMemberRepository.get.resolves();

    // when
    const error = await catchErr(useCase.execute)(userId);

    // then
    expect(error).to.be.an.instanceof(ForbiddenAccess);
  });
});
