import { learnerParticipationController } from '../../../../../src/prescription/campaign-participation/application/learner-participation-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/campaign-participation/application/learner-participation-route.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Integration | Application | Route | learnerParticipationRouter', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon
      .stub(learnerParticipationController, 'shareCampaignResult')
      .callsFake((request, h) => h.response('ok').code(201));

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('PATCH /api/campaign-participations/{id}', function () {
    it('should exist', async function () {
      // given
      const payload = {
        data: {
          type: 'campaign-participation',
          attributes: {
            isShared: true,
          },
        },
      };

      // when
      const response = await httpTestServer.request('PATCH', '/api/campaign-participations/1', payload);

      // then
      expect(response.statusCode).to.equal(201);
    });
  });
});
