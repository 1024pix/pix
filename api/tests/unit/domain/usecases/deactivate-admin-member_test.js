import { sinon, expect } from '../../../test-helper';
import deactivateAdminMember from '../../../../lib/domain/usecases/deactivate-admin-member';

describe('Unit | UseCase | deactivate-admin-member', function () {
  it("should deactivate the given admin member and revoke all user's refresh tokens", async function () {
    // given
    const adminMemberRepository = { deactivate: sinon.stub(), getById: sinon.stub() };
    adminMemberRepository.deactivate.withArgs({ id: 7 }).resolves(undefined);
    adminMemberRepository.getById.withArgs(7).resolves({ userId: 2 });

    const refreshTokenService = { revokeRefreshTokensForUserId: sinon.stub() };

    // when
    const adminMember = await deactivateAdminMember({
      id: 7,
      adminMemberRepository,
      refreshTokenService,
    });

    // then
    expect(adminMember).to.be.undefined;
  });

  it("should revoke all user's refresh tokens", async function () {
    // given
    const adminMemberRepository = { deactivate: sinon.stub(), getById: sinon.stub() };
    adminMemberRepository.deactivate.withArgs({ id: 7 }).resolves(undefined);
    adminMemberRepository.getById.withArgs(7).resolves({ userId: 2 });
    const refreshTokenService = { revokeRefreshTokensForUserId: sinon.stub() };

    // when
    await deactivateAdminMember({
      id: 7,
      adminMemberRepository,
      refreshTokenService,
    });

    // then
    expect(refreshTokenService.revokeRefreshTokensForUserId).to.have.been.calledWithExactly({ userId: 2 });
  });
});
