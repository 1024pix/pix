import { deactivateAdminMember } from '../../../../../src/team/domain/usecases/deactivate-admin-member.usecase.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Team | Domain | UseCase | deactivate-admin-member', function () {
  it("should deactivate the given admin member and revoke all user's refresh tokens", async function () {
    // given
    const adminMemberRepository = { deactivate: sinon.stub(), getById: sinon.stub() };
    adminMemberRepository.deactivate.withArgs({ id: 7 }).resolves(undefined);
    adminMemberRepository.getById.withArgs(7).resolves({ userId: 2 });

    const refreshTokenRepository = { revokeAllByUserId: sinon.stub() };

    // when
    const adminMember = await deactivateAdminMember({
      id: 7,
      adminMemberRepository,
      refreshTokenRepository,
    });

    // then
    expect(adminMember).to.be.undefined;
  });

  it("should revoke all user's refresh tokens", async function () {
    // given
    const adminMemberRepository = { deactivate: sinon.stub(), getById: sinon.stub() };
    adminMemberRepository.deactivate.withArgs({ id: 7 }).resolves(undefined);
    adminMemberRepository.getById.withArgs(7).resolves({ userId: 2 });
    const refreshTokenRepository = { revokeAllByUserId: sinon.stub() };

    // when
    await deactivateAdminMember({
      id: 7,
      adminMemberRepository,
      refreshTokenRepository,
    });

    // then
    expect(refreshTokenRepository.revokeAllByUserId).to.have.been.calledWithExactly({ userId: 2 });
  });
});
