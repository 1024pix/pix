import { campaignParticipationController } from '../../../../lib/application/campaign-participations/campaign-participation-controller.js';
import { usecases as devcompUsecases } from '../../../../src/devcomp/domain/usecases/index.js';
import { expect, sinon } from '../../../test-helper.js';
describe('Unit | Application | Controller | Campaign-Participation', function () {
  describe('#findTrainings', function () {
    let dependencies;

    beforeEach(function () {
      sinon.stub(devcompUsecases, 'findCampaignParticipationTrainings');
      const trainingSerializer = {
        serialize: sinon.stub(),
      };
      dependencies = {
        trainingSerializer,
      };
    });

    it('should call usecase and serializer with expected parameters', async function () {
      // given
      const campaignParticipationId = 123;
      const userId = 456;
      const locale = 'fr-fr';
      const trainings = Symbol('trainings');
      const expectedResults = Symbol('results');
      devcompUsecases.findCampaignParticipationTrainings
        .withArgs({ userId, campaignParticipationId, locale })
        .resolves(trainings);
      dependencies.trainingSerializer.serialize.withArgs(trainings).returns(expectedResults);

      const request = {
        auth: { credentials: { userId } },
        params: { id: campaignParticipationId },
        headers: { 'accept-language': locale },
      };
      const h = Symbol('h');

      // when
      const response = await campaignParticipationController.findTrainings(request, h, dependencies);

      // then
      expect(response).to.equal(expectedResults);
    });
  });
});
