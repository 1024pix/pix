import { expect, sinon } from '../../../test-helper';
import useCase from '../../../../lib/application/usecases/checkAdminMemberHasRoleMetier';
import tokenService from '../../../../lib/domain/services/token-service';
import adminMemberRepository from '../../../../lib/infrastructure/repositories/admin-member-repository';

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
