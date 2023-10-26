import { expect, sinon } from '../../../test-helper.js';
import { tokenService } from '../../../../src/shared/domain/services/token-service.js';
import * as useCase from '../../../../lib/application/usecases/checkAdminMemberHasRoleSupport.js';

describe('Unit | Application | Use Case | checkAdminMemberHasRoleSupport', function () {
  const userId = '1234';
  let adminMemberRepositoryStub;

  beforeEach(function () {
    sinon.stub(tokenService, 'extractUserId').resolves(userId);
    adminMemberRepositoryStub = {
      get: sinon.stub(),
    };
  });

  it('should resolve true when the user has role support', async function () {
    // given
    adminMemberRepositoryStub.get.resolves({ isSupport: true });

    // when
    const result = await useCase.execute(userId, { adminMemberRepository: adminMemberRepositoryStub });
    // then
    expect(result).to.be.true;
  });

  it('should resolve false when the user does not have role support', async function () {
    // given
    adminMemberRepositoryStub.get.resolves({ isSupport: false });

    // when
    const result = await useCase.execute(userId, { adminMemberRepository: adminMemberRepositoryStub });
    // then
    expect(result).to.be.false;
  });
});
