import * as useCase from '../../../../../src/shared/application/usecases/checkAdminMemberHasRoleMetier.js';
import { tokenService } from '../../../../../src/shared/domain/services/token-service.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Use Case | checkAdminMemberHasRoleMetier', function () {
  const userId = '1234';
  let adminMemberRepositoryStub;

  beforeEach(function () {
    sinon.stub(tokenService, 'extractUserId').resolves(userId);
    adminMemberRepositoryStub = {
      get: sinon.stub(),
    };
  });

  it('should resolve true when the admin member has role metier', async function () {
    // given
    adminMemberRepositoryStub.get.resolves({ isMetier: true });

    // when
    const result = await useCase.execute(userId, { adminMemberRepository: adminMemberRepositoryStub });

    // then
    expect(result).to.be.true;
  });

  it('should resolve true when the admin member does not have role metier', async function () {
    // given
    adminMemberRepositoryStub.get.resolves({ isMetier: false });

    // when
    const result = await useCase.execute(userId, { adminMemberRepository: adminMemberRepositoryStub });
    // then
    expect(result).to.be.false;
  });
});
