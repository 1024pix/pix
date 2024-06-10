import { adminCampaignParticipationController } from '../../../../../src/prescription/campaign-participation/application/admin-campaign-participation-controller.js';
import { usecases } from '../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Prescription | Admin Campaign Participation | Controller', function () {
  describe('#findCampaignParticipationsForUserManagement', function () {
    let dependencies;
    const userId = 456;

    beforeEach(function () {
      sinon.stub(usecases, 'findCampaignParticipationsForUserManagement');
      const campaignParticipationForUserManagementSerializer = {
        serialize: sinon.stub(),
      };
      dependencies = {
        campaignParticipationForUserManagementSerializer,
      };
    });

    it('should call usecase and serializer with expected parameters', async function () {
      // given
      const campaignParticipationList = Symbol('campaignParticipationList');
      const expectedResults = Symbol('results');
      usecases.findCampaignParticipationsForUserManagement.withArgs({ userId }).resolves(campaignParticipationList);

      dependencies.campaignParticipationForUserManagementSerializer.serialize
        .withArgs(campaignParticipationList)
        .returns(expectedResults);

      const request = {
        params: { userId },
      };
      const h = Symbol('h');

      // when
      const response = await adminCampaignParticipationController.findCampaignParticipationsForUserManagement(
        request,
        h,
        dependencies,
      );

      // then
      expect(response).to.equal(expectedResults);
    });
  });
});
