import { subscriptionController } from '../../../../../src/certification/enrolment/application/subscription-controller.js';
import { usecases } from '../../../../../src/certification/enrolment/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Certification | Enrolment | Unit | Application | Controller | subscription', function () {
  describe('#getSubscription', function () {
    it('should call the usecase to get candidate subscription', async function () {
      // given
      const certificationCandidateId = 123;
      const request = {
        params: { id: certificationCandidateId },
      };
      const certificationCandidateSubscription = Symbol('certificationCandidateSubscription');
      sinon.stub(usecases, 'getCertificationCandidateSubscription');
      usecases.getCertificationCandidateSubscription.resolves(certificationCandidateSubscription);

      const serializedCertificationCandidateSubscription = Symbol('serializedCertificationCandidateSubscription');
      const certificationCandidateSubscriptionSerializerStub = {
        serialize: sinon.stub(),
      };
      certificationCandidateSubscriptionSerializerStub.serialize
        .withArgs(certificationCandidateSubscription)
        .returns(serializedCertificationCandidateSubscription);

      // when
      await subscriptionController.getSubscription(request, hFake, {
        certificationCandidateSubscriptionSerializer: certificationCandidateSubscriptionSerializerStub,
      });

      // then
      expect(usecases.getCertificationCandidateSubscription).to.have.been.calledWithExactly({
        certificationCandidateId,
      });
    });
  });
});
