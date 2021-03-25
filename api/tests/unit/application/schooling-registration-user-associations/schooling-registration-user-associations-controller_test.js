const { expect, hFake, sinon } = require('../../../test-helper');

const usecases = require('../../../../lib/domain/usecases');

const schoolingRegistrationUserAssociationController = require('../../../../lib/application/schooling-registration-user-associations/schooling-registration-user-association-controller');

describe('Unit | Application | Controller | schooling-registration-user-associations', () => {

  describe('#dissociate', () => {

    beforeEach(() => {
      sinon.stub(usecases, 'dissociateUserFromSchoolingRegistration');
    });

    it('should call the usecase', async () => {
      // given
      const userId = 1;
      const schoolingRegistrationId = 1;
      const request = {
        auth: { credentials: { userId } },
        params: { id: schoolingRegistrationId },
      };
      usecases.dissociateUserFromSchoolingRegistration.resolves();

      // when
      await schoolingRegistrationUserAssociationController.dissociate(request, hFake);

      // then
      expect(usecases.dissociateUserFromSchoolingRegistration)
        .to.have.been.calledWith({ schoolingRegistrationId, userId });
    });
  });

});
