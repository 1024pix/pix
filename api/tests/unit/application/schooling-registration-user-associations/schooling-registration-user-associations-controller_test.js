const { expect, hFake, sinon } = require('../../../test-helper');

const usecases = require('../../../../lib/domain/usecases');

const schoolingRegistrationUserAssociationController = require('../../../../lib/application/organization-learner-user-associations/organization-learner-user-association-controller');

describe('Unit | Application | Controller | schooling-registration-user-associations', function () {
  describe('#dissociate', function () {
    beforeEach(function () {
      sinon.stub(usecases, 'dissociateUserFromOrganizationLearner');
    });

    it('should call the usecase', async function () {
      // given
      const userId = 1;
      const schoolingRegistrationId = 1;
      const request = {
        auth: { credentials: { userId } },
        params: { id: schoolingRegistrationId },
      };
      usecases.dissociateUserFromOrganizationLearner.resolves();

      // when
      await schoolingRegistrationUserAssociationController.dissociate(request, hFake);

      // then
      expect(usecases.dissociateUserFromOrganizationLearner).to.have.been.calledWith({ schoolingRegistrationId });
    });
  });
});
