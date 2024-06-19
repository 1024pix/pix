import { missionLearnerController } from '../../../../src/school/application/mission-learner-controller.js';
import * as moduleUnderTest from '../../../../src/school/application/mission-learner-route.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Unit | Route | mission-learner-route', function () {
  describe('GET /api/organizations/{id}/missions/{missionId}/learners', function () {
    it('should check user belongs to organization and pix1d is activated', async function () {
      // given
      const mock = sinon.mock(securityPreHandlers);
      mock.expects('checkUserBelongsToOrganization').once().returns(true);
      mock.expects('checkPix1dActivated').once().returns(true);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('GET', '/api/organizations/4/missions/1/learners');

      // then
      mock.verify();
    });

    it('should return 200 if the mission is found', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization').callsFake((request, h) => h.response(true));
      sinon.stub(securityPreHandlers, 'checkPix1dActivated').callsFake((request, h) => h.response(true));
      sinon.stub(missionLearnerController, 'findPaginatedMissionLearners').callsFake((request, h) => h.response('ok'));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/organizations/4/missions/1/learners');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 400 when the organizationId is not a number', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization').callsFake((request, h) => h.response(true));
      sinon.stub(securityPreHandlers, 'checkPix1dActivated').callsFake((request, h) => h.response(true));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/organizations/AZRTY/missions/1/learners');

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 400 when the missionId is not a number', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization').callsFake((request, h) => h.response(true));
      sinon.stub(securityPreHandlers, 'checkPix1dActivated').callsFake((request, h) => h.response(true));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/organizations/4/missions/UIOP/learners');

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
