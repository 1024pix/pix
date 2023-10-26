import { expect, sinon } from '../../../test-helper.js';
import { tokenService } from '../../../../src/shared/domain/services/token-service.js';
import * as useCase from '../../../../lib/application/usecases/checkAdminMemberHasRoleCertif.js';

describe('Unit | Application | Use Case | checkAdminMemberHasRoleCertifUseCase', function () {
  const userId = '1234';
  let adminMemberRepositoryStub;

  beforeEach(function () {
    sinon.stub(tokenService, 'extractUserId').resolves(userId);
    adminMemberRepositoryStub = {
      get: sinon.stub(),
    };
  });

  it('should resolve true when the admin member has role certif', async function () {
    // given
    adminMemberRepositoryStub.get.resolves({ isCertif: true });

    // when
    const result = await useCase.execute(userId, { adminMemberRepository: adminMemberRepositoryStub });

    // then
    expect(result).to.be.true;
  });

  it('should resolve false when the admin member does not have role certif', async function () {
    // given
    adminMemberRepositoryStub.get.resolves({ isCertif: false });

    // when
    const result = await useCase.execute(userId, { adminMemberRepository: adminMemberRepositoryStub });

    // then
    expect(result).to.be.false;
  });
});
