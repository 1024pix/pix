const { expect, sinon } = require('../../../test-helper');
const useCase = require('../../../../lib/application/usecases/checkAdminMemberHasRoleSupport');
const tokenService = require('../../../../lib/domain/services/token-service');
const adminMemberRepository = require('../../../../lib/infrastructure/repositories/admin-member-repository');

describe('Unit | Application | Use Case | checkAdminMemberHasRoleSupport', function () {
  const userId = '1234';

  beforeEach(function () {
    sinon.stub(tokenService, 'extractUserId').resolves(userId);
    sinon.stub(adminMemberRepository, 'get');
  });

  it('should resolve true when the user has role support', async function () {
    // given
    adminMemberRepository.get.resolves({ isSupport: true });

    // when
    const result = await useCase.execute(userId);
    // then
    expect(result).to.be.true;
  });

  it('should resolve false when the user does not have role support', async function () {
    // given
    adminMemberRepository.get.resolves({ isSupport: false });

    // when
    const result = await useCase.execute(userId);
    // then
    expect(result).to.be.false;
  });
});
