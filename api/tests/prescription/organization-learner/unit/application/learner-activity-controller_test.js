import { sinon, expect, hFake } from '../../../../test-helper.js';
import { usecases } from '../../../../../src/prescription/organization-learner/domain/usecases/index.js';
import { learnerActivityController } from '../../../../../src/prescription/organization-learner/application/learner-activity-controller.js';

describe('Unit | Application | Organization-Learner | organization-learner-controller', function () {
  describe('#getOrganizationLearnerActivity', function () {
    it('should fetch and return the organization learner activity, serialized as JSONAPI', async function () {
      // given
      const organizationLearnerId = 123;
      const organizationLearnerActivity = Symbol('activity returned by use case');
      const serializedActivity = Symbol('serialized activity');

      const organizationLearnerActivitySerializer = {
        serialize: sinon.stub(),
      };
      sinon.stub(usecases, 'getOrganizationLearnerActivity');

      usecases.getOrganizationLearnerActivity.withArgs({ organizationLearnerId }).resolves(organizationLearnerActivity);

      organizationLearnerActivitySerializer.serialize.withArgs(organizationLearnerActivity).returns(serializedActivity);

      const request = {
        params: {
          id: organizationLearnerId,
        },
      };

      // when
      const response = await learnerActivityController.getActivity(request, hFake, {
        organizationLearnerActivitySerializer,
      });

      // then
      expect(usecases.getOrganizationLearnerActivity).to.have.been.calledWithExactly({ organizationLearnerId });
      expect(organizationLearnerActivitySerializer.serialize).to.have.been.calledWithExactly(
        organizationLearnerActivity,
      );
      expect(response.statusCode).to.equal(200);
      expect(response.source).to.equal(serializedActivity);
    });
  });
});
