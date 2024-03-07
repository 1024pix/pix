import { organizationLearnerController } from '../../../../../src/prescription/organization-learner/application/organization-learner-controller.js';
import { usecases } from '../../../../../src/prescription/organization-learner/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Organization-Learner | organization-learner-controller', function () {
  describe('#getOrganizationLearner', function () {
    it('should fetch and return the organization learner, serialized as JSONAPI', async function () {
      // given
      const organizationLearnerId = 123;
      const organizationLearner = Symbol('learner returned by use case');
      const serializedLearner = Symbol('serialized learner');

      const organizationLearnerSerializer = {
        serialize: sinon.stub(),
      };
      sinon.stub(usecases, 'getOrganizationLearner');

      usecases.getOrganizationLearner.withArgs({ organizationLearnerId }).resolves(organizationLearner);

      organizationLearnerSerializer.serialize.withArgs(organizationLearner).returns(serializedLearner);

      const request = {
        params: {
          id: organizationLearnerId,
        },
      };

      // when
      const response = await organizationLearnerController.getLearner(request, hFake, {
        organizationLearnerSerializer,
      });

      // then
      expect(usecases.getOrganizationLearner).to.have.been.calledWithExactly({ organizationLearnerId });
      expect(organizationLearnerSerializer.serialize).to.have.been.calledWithExactly(organizationLearner);
      expect(response.statusCode).to.equal(200);
      expect(response.source).to.equal(serializedLearner);
    });
  });
});
