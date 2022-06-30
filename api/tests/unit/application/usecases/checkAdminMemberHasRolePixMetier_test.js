const { expect, sinon } = require('../../../test-helper');
const useCase = require('../../../../lib/application/usecases/checkAdminMemberHasRoleMetier');
const tokenService = require('../../../../lib/domain/services/token-service');
const adminMemberRepository = require('../../../../lib/infrastructure/repositories/admin-member-repository');

describe('Unit | Application | Use Case | checkAdminMemberHasRoleMetier', function () {
  const userId = '1234';

  beforeEach(function () {
    sinon.stub(tokenService, 'extractUserId').resolves(userId);
    sinon.stub(adminMemberRepository, 'get');
  });

  it('should resolve true when the admin member has role metier', async function () {
    // given
    adminMemberRepository.get.resolves({ isMetier: true });

    // when
    const result = await useCase.execute(userId);

    // then
    expect(result).to.be.true;
  });

  it('should resolve true when the admin member does not have role metier', async function () {
    // given
    adminMemberRepository.get.resolves({ isMetier: false });

    // when
    const result = await useCase.execute(userId);
    // then
    expect(result).to.be.false;
  });
});
