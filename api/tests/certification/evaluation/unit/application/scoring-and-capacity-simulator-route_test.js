import sinon from 'sinon';

import { scoringAndCapacitySimulatorController } from '../../../../../src/certification/evaluation/application/scoring-and-capacity-simulator-controller.js';
import { scoringAndCapacitySimulatorRoute as moduleUnderTest } from '../../../../../src/certification/evaluation/application/scoring-and-capacity-simulator-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Unit | Route | scoring-and-capacity-simulator-route', function () {
  describe('GET /api/admin/simulate-score-or-capacity', function () {
    it('should return 200 if everything goes well', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon
        .stub(scoringAndCapacitySimulatorController, 'simulateScoringOrCapacity')
        .callsFake((request, h) => h.response('ok'));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/admin/simulate-score-or-capacity', {
        data: {
          score: 128,
        },
      });

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 400 when payload contains both a score and a capacity', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon
        .stub(scoringAndCapacitySimulatorController, 'simulateScoringOrCapacity')
        .callsFake((request, h) => h.response('ok'));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/admin/simulate-score-or-capacity', {
        data: {
          score: 128,
          capacity: 2.5,
        },
      });

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
