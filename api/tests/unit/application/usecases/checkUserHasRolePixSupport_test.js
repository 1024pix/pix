const { expect, sinon, catchErr } = require('../../../test-helper');
const useCase = require('../../../../lib/application/usecases/checkUserHasRoleSupport');
const tokenService = require('../../../../lib/domain/services/token-service');
const adminMemberRepository = require('../../../../lib/infrastructure/repositories/admin-member-repository');
const { ForbiddenAccess } = require('../../../../lib/domain/errors');

describe('Unit | Application | Use Case | checkUserHasRoleSupport', function () {
  const userId = '1234';

  beforeEach(function () {
    sinon.stub(tokenService, 'extractUserId').resolves(userId);
    sinon.stub(adminMemberRepository, 'get');
  });

  it('should resolve true when the user has role support', function () {
    // given
    adminMemberRepository.get.resolves({ isSupport: true });

    // when
    const promise = useCase.execute(userId);

    // then
    return promise.then((result) => {
      expect(result).to.be.true;
    });
  });

  it('should resolve false when the user has note role support', function () {
    // given
    adminMemberRepository.get.resolves({ isSupport: false });

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
