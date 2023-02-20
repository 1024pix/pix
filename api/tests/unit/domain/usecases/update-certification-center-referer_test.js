import { expect, sinon, domainBuilder } from '../../../test-helper';
import updateCertificationCenterReferer from '../../../../lib/domain/usecases/update-certification-center-referer';

describe('Unit | UseCase | update-certification-center-referer', function () {
  context('when there is already a referer', function () {
    it('should replace the current referer', async function () {
      // given
      const certificationCenterMembershipRepository = {
        updateRefererStatusByUserIdAndCertificationCenterId: sinon.stub(),
        getRefererByCertificationCenterId: sinon.stub(),
      };

      certificationCenterMembershipRepository.getRefererByCertificationCenterId
        .withArgs({ certificationCenterId: 456 })
        .resolves(
          domainBuilder.buildCertificationCenterMembership({
            isReferer: true,
            user: domainBuilder.buildUser({
              id: 4567,
            }),
          })
        );

      // when
      await updateCertificationCenterReferer({
        userId: 1234,
        certificationCenterId: 456,
        isReferer: true,
        certificationCenterMembershipRepository,
      });

      // then
      expect(
        certificationCenterMembershipRepository.updateRefererStatusByUserIdAndCertificationCenterId
      ).to.have.been.calledTwice;

      expect(
        certificationCenterMembershipRepository.updateRefererStatusByUserIdAndCertificationCenterId.firstCall
      ).to.have.been.calledWithExactly({
        userId: 4567,
        certificationCenterId: 456,
        isReferer: false,
      });

      expect(
        certificationCenterMembershipRepository.updateRefererStatusByUserIdAndCertificationCenterId.secondCall
      ).to.have.been.calledWithExactly({
        userId: 1234,
        certificationCenterId: 456,
        isReferer: true,
      });
    });
  });

  context('when there is no referer yet', function () {
    it('should select a referer', async function () {
      // given
      const certificationCenterMembershipRepository = {
        updateRefererStatusByUserIdAndCertificationCenterId: sinon.stub(),
        getRefererByCertificationCenterId: sinon.stub(),
      };

      // when
      await updateCertificationCenterReferer({
        userId: 1234,
        certificationCenterId: 456,
        isReferer: true,
        certificationCenterMembershipRepository,
      });

      // then
      expect(
        certificationCenterMembershipRepository.updateRefererStatusByUserIdAndCertificationCenterId
      ).to.have.been.calledOnceWithExactly({
        userId: 1234,
        certificationCenterId: 456,
        isReferer: true,
      });
    });
  });
});
