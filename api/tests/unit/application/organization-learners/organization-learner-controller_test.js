const { sinon, expect, hFake } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const organizationLearnerParticipationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization-learner-activity-serializer');
const organizationLearnerSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization-learner-follow-up/organization-learner-serializer');
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

  describe('#getOrganizationLearner', function () {
    it('should fetch and return the organization learner, serialized as JSONAPI', async function () {
      // given
      const organizationLearnerId = 123;
      const organizationLearner = Symbol('learner returned by use case');
      const serializedLearner = Symbol('serialized learner');

      sinon.stub(organizationLearnerSerializer, 'serialize');
      sinon.stub(usecases, 'getOrganizationLearner');

      usecases.getOrganizationLearner.withArgs({ organizationLearnerId }).resolves(organizationLearner);

      organizationLearnerSerializer.serialize.withArgs(organizationLearner).returns(serializedLearner);

      const request = {
        params: {
          id: organizationLearnerId,
        },
      };

      // when
      const response = await organizationLearnerController.getLearner(request, hFake);

      // then
      expect(usecases.getOrganizationLearner).to.have.been.calledWith({ organizationLearnerId });
      expect(organizationLearnerSerializer.serialize).to.have.been.calledWith(organizationLearner);
      expect(response.statusCode).to.equal(200);
      expect(response.source).to.equal(serializedLearner);
    });
  });
});
