const { expect, hFake, sinon } = require('../../../test-helper');

const usecases = require('../../../../lib/domain/usecases');

const organizationLearnerUserAssociationController = require('../../../../lib/application/organization-learner-user-associations/organization-learner-user-association-controller');

describe('Unit | Application | Controller | organization-learner-user-association', function () {
  describe('#dissociate', function () {
    beforeEach(function () {
      sinon.stub(usecases, 'dissociateUserFromOrganizationLearner');
    });

    it('should call the usecase', async function () {
      // given
      const userId = 1;
      const organizationLearnerId = 1;
      const request = {
        auth: { credentials: { userId } },
        params: { id: organizationLearnerId },
      };
      usecases.dissociateUserFromOrganizationLearner.resolves();

      // when
      await organizationLearnerUserAssociationController.dissociate(request, hFake);

      // then
      expect(usecases.dissociateUserFromOrganizationLearner).to.have.been.calledWith({ organizationLearnerId });
    });
  });
});
