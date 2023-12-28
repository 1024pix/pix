import { expect, sinon, hFake } from '../../../test-helper.js';
import { certificationCenterMembershipController } from '../../../../lib/application/certification-center-memberships/certification-center-membership-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';

describe('Unit | Application | certification-center-memberships | certification-center-membership-controller', function () {
  describe('#acceptCertificationCenterMembership', function () {
    it('calls disableCertificationMembership usecase', async function () {
      // given
      const currentUserId = 1234;
      const certificationCenterMembershipId = 5678;
      const request = {
        params: { certificationCenterMembershipId },
      };

      const requestResponseUtils = {
        extractUserIdFromRequest: () => currentUserId,
      };
      const dependencies = { requestResponseUtils };
      sinon.stub(usecases, 'disableCertificationCenterMembershipFromPixCertif').resolves();

      // when
      const response = await certificationCenterMembershipController.disableFromPixCertif(request, hFake, dependencies);

      // then
      expect(usecases.disableCertificationCenterMembershipFromPixCertif).to.have.been.calledWithExactly({
        certificationCenterMembershipId: 5678,
        updatedByUserId: 1234,
      });
      expect(response.statusCode).to.equal(204);
    });
  });
});
