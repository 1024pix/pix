import { domainBuilder, expect, sinon } from '../../../test-helper.js';
import * as checkUserIsAdminOfCertificationCenterWithCertificationCenterMembershipIdUseCase from '../../../../lib/application/usecases/check-user-is-admin-of-certification-center-with-certification-center-membership-id.js';

describe('Unit | Application | UseCases | checkUserIsAdminOfCertificationCenterWithCertificationCenterMembershipIdUseCase', function () {
  let certificationCenterMembership, certificationCenterMembershipRepository, dependencies, user;

  beforeEach(function () {
    certificationCenterMembership = domainBuilder.buildCertificationCenterMembership();
    user = domainBuilder.buildUser();

    certificationCenterMembershipRepository = {
      findById: sinon.stub(),
      isAdminOfCertificationCenter: sinon.stub(),
    };

    certificationCenterMembershipRepository.findById.withArgs(certificationCenterMembership.id);
    certificationCenterMembershipRepository.isAdminOfCertificationCenter.withArgs({
      certificationCenterId: certificationCenterMembership.certificationCenterId,
      userId: user.id,
    });

    dependencies = {
      certificationCenterMembershipRepository,
    };
  });

  context('when user is admin of the certification center', function () {
    it('returns true', async function () {
      // given
      certificationCenterMembershipRepository.findById.resolves(certificationCenterMembership);
      certificationCenterMembershipRepository.isAdminOfCertificationCenter.resolves(true);

      // when
      const response = await checkUserIsAdminOfCertificationCenterWithCertificationCenterMembershipIdUseCase.execute({
        certificationCenterMembershipId: certificationCenterMembership.id,
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
      certificationCenterMembershipRepository.findById.resolves(certificationCenterMembership);
      certificationCenterMembershipRepository.isAdminOfCertificationCenter.resolves(false);

      // when
      const response = await checkUserIsAdminOfCertificationCenterWithCertificationCenterMembershipIdUseCase.execute({
        certificationCenterMembershipId: certificationCenterMembership.id,
        userId: user.id,
        dependencies,
      });

      // then
      expect(response).to.be.false;
    });
  });

  context('when there is no certification center membership', function () {
    it('returns false', async function () {
      // given
      certificationCenterMembershipRepository.findById.resolves();

      // when
      const response = await checkUserIsAdminOfCertificationCenterWithCertificationCenterMembershipIdUseCase.execute({
        certificationCenterMembershipId: certificationCenterMembership.id,
        userId: user.id,
        dependencies,
      });

      // then
      expect(response).to.be.false;
      expect(certificationCenterMembershipRepository.isAdminOfCertificationCenter).to.not.have.been.called;
    });
  });
});
