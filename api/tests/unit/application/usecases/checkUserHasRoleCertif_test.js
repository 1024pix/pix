const { expect, sinon, catchErr } = require('../../../test-helper');
const useCase = require('../../../../lib/application/usecases/checkUserHasRoleCertif');
const tokenService = require('../../../../lib/domain/services/token-service');
const adminMemberRepository = require('../../../../lib/infrastructure/repositories/admin-member-repository');
const { ForbiddenAccess } = require('../../../../lib/domain/errors');

describe('Unit | Application | Use Case | checkUserHasRoleCertifUseCase', function () {
  const userId = '1234';

  beforeEach(function () {
    sinon.stub(tokenService, 'extractUserId').resolves(userId);
    sinon.stub(adminMemberRepository, 'get');
  });

  it('should resolve true when the admin member has role certif', function () {
    // given
    adminMemberRepository.get.resolves({ isCertif: true });

    // when
    const promise = useCase.execute(userId);

    // then
    return promise.then((result) => {
      expect(result).to.be.true;
    });
  });

  it('should resolve false when the admin member has role certif', function () {
    // given
    adminMemberRepository.get.resolves({ isCertif: false });

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
