const { sinon, expect, generateValidRequestAuthorizationHeader, hFake } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const organizationLearnerParticipationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization-learner-activity-serializer');
const organizationLearnerController = require('../../../../lib/application/organization-learners/organization-learner-controller');

describe('Unit | Application | Organization-Learner | organization-learner-controller', function () {
  describe('#getOrganizationLearnerActivity', function () {
    it('should fetch and return the organization learner activity, serialized as JSONAPI', async function () {
      // given
      const organizationLearnerId = 123;
      const organizationLearnerActivity = Symbol('activity returned by use case');
      const serializedActivity = Symbol('serialized activity');

      sinon.stub(organizationLearnerParticipationSerializer, 'serialize');
      sinon.stub(usecases, 'getOrganizationLearnerActivity');

      usecases.getOrganizationLearnerActivity.withArgs({ organizationLearnerId }).resolves(organizationLearnerActivity);

      organizationLearnerParticipationSerializer.serialize
        .withArgs(organizationLearnerActivity)
        .returns(serializedActivity);

      const request = {
        params: {
          id: organizationLearnerId,
        },
        headers: { authorization: generateValidRequestAuthorizationHeader(organizationLearnerId) },
      };

      // when
      const response = await organizationLearnerController.getActivity(request, hFake);

      // then
      expect(usecases.getOrganizationLearnerActivity).to.have.been.calledWith({ organizationLearnerId });
      expect(organizationLearnerParticipationSerializer.serialize).to.have.been.calledWith(organizationLearnerActivity);
      expect(response.statusCode).to.equal(200);
      expect(response.source).to.equal(serializedActivity);
    });
  });
});
