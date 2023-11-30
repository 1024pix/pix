import { domainBuilder, expect, sinon } from '../../../test-helper.js';
import * as checkUserIsAdminOfCertificationCenterWithCertificationCenterInvitationIdUseCase from '../../../../lib/application/usecases/check-user-is-admin-of-certification-center-with-certification-center-invitation-id.js';

describe('Unit | Application | UseCases | checkUserIsAdminOfCertificationCenterWithCertificationCenterInvitationIdUseCase', function () {
  let certificationCenterInvitation,
    certificationCenterInvitationRepository,
    certificationCenterMembershipRepository,
    dependencies,
    user;

  beforeEach(function () {
    certificationCenterInvitation = domainBuilder.buildCertificationCenterInvitation();
    user = domainBuilder.buildUser();

    certificationCenterInvitationRepository = {
      get: sinon.stub(),
    };
    certificationCenterMembershipRepository = {
      isAdminOfCertificationCenter: sinon.stub(),
    };

    certificationCenterInvitationRepository.get.withArgs(certificationCenterInvitation.id);
    certificationCenterMembershipRepository.isAdminOfCertificationCenter.withArgs({
      certificationCenterId: certificationCenterInvitation.certificationCenterId,
      userId: user.id,
    });

    dependencies = {
      certificationCenterInvitationRepository,
      certificationCenterMembershipRepository,
    };
  });

  context('when user is admin of the certification center', function () {
    it('returns true', async function () {
      // given
      certificationCenterInvitationRepository.get.resolves(certificationCenterInvitation);
      certificationCenterMembershipRepository.isAdminOfCertificationCenter.resolves(true);

      // when
      const response = await checkUserIsAdminOfCertificationCenterWithCertificationCenterInvitationIdUseCase.execute({
        certificationCenterInvitationId: certificationCenterInvitation.id,
        userId: user.id,
        dependencies,
      });

      // then
      expect(response).to.be.true;
    });
  });

  context('when user is not admin of the certification center', function () {
    it('returns false', async function () {
      // given
      certificationCenterInvitationRepository.get.resolves(certificationCenterInvitation);
      certificationCenterMembershipRepository.isAdminOfCertificationCenter.resolves(false);

      // when
      const response = await checkUserIsAdminOfCertificationCenterWithCertificationCenterInvitationIdUseCase.execute({
        certificationCenterInvitationId: certificationCenterInvitation.id,
        userId: user.id,
        dependencies,
      });

      // then
      expect(response).to.be.false;
    });
  });

  context('when there is no certification center invitation', function () {
    it('returns false', async function () {
      // given
      certificationCenterInvitationRepository.get.resolves();

      // when
      const response = await checkUserIsAdminOfCertificationCenterWithCertificationCenterInvitationIdUseCase.execute({
        certificationCenterInvitationId: certificationCenterInvitation.id,
        userId: user.id,
        dependencies,
      });

      // then
      expect(response).to.be.false;
      expect(certificationCenterMembershipRepository.isAdminOfCertificationCenter).to.not.have.been.called;
    });
  });
});
