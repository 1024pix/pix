import sinon from 'sinon';

import { campaignParticipationController } from '../../../../../src/devcomp/application/campaign-participations/campaign-participation-controller.js';
import { usecases as devcompUsecases } from '../../../../../src/devcomp/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Application | Controller | Campaign-Participation', function () {
  describe('#findTrainings', function () {
    beforeEach(function () {
      sinon.stub(devcompUsecases, 'findCampaignParticipationTrainings');
    });

    it('should call usecase and serializer with expected parameters', async function () {
      // given
      const campaignParticipationId = 123;
      const userId = 456;
      const locale = 'fr-fr';
      const trainings = { id: 1, duration: {} };
      devcompUsecases.findCampaignParticipationTrainings
        .withArgs({ userId, campaignParticipationId, locale })
        .resolves(trainings);

      const request = {
        auth: { credentials: { userId } },
        params: { id: campaignParticipationId },
      };

      // when
      const response = await campaignParticipationController.findTrainings(request);

      // then
      expect(response.data.id).to.equal('1');
      expect(response.data.type).to.equal('trainings');
    });
  });
});
