import { missionController } from '../../../../src/school/application/mission-controller.js';
import * as moduleUnderTest from '../../../../src/school/application/mission-route.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Unit | Router | mission-route', function () {
  describe('GET /api/pix1d/missions/{missionId}', function () {
    it('should check pix1d activated', async function () {
      // given
      sinon.spy(securityPreHandlers, 'checkPix1dActivated');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('GET', '/api/pix1d/missions/1');

      // then
      expect(securityPreHandlers.checkPix1dActivated).to.have.been.calledOnce;
    });

    it('should return 200 if the mission is found', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkPix1dActivated').callsFake((request, h) => h.response(false));
      sinon.stub(missionController, 'getById').callsFake((request, h) => h.response('ok'));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/pix1d/missions/1');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/pix1d/missions', function () {
    it('should check pix1d activated', async function () {
      // given
      sinon.spy(securityPreHandlers, 'checkPix1dActivated');
      sinon.stub(missionController, 'findAll').callsFake((request, h) => h.response('ok'));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('GET', '/api/pix1d/missions');

      // then
      expect(securityPreHandlers.checkPix1dActivated).to.have.been.calledOnce;
    });

    it('should return 200', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkPix1dActivated').callsFake((request, h) => h.response());
      sinon.stub(missionController, 'findAll').callsFake((request, h) => h.response('ok'));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/pix1d/missions');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/organizations/{id}/missions', function () {
    it('should check user belongs to organization and pix1d is activated', async function () {
      // given
      const mock = sinon.mock(securityPreHandlers);
      mock.expects('checkUserBelongsToOrganization').once().returns(true);
      mock.expects('checkPix1dActivated').once().returns(true);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('GET', '/api/organizations/4/missions');

      // then
      mock.verify();
    });

    it('should return 200', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization').resolves(true);
      sinon.stub(securityPreHandlers, 'checkPix1dActivated').resolves(true);
      sinon.stub(missionController, 'findAll').callsFake((request, h) => h.response('ok'));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/organizations/4/missions');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
  describe('GET /api/organizations/{id}/missions/{missionId}', function () {
    it('should check user belongs to organization and pix1d is activated', async function () {
      // given
      const mock = sinon.mock(securityPreHandlers);
      mock.expects('checkUserBelongsToOrganization').once().returns(true);
      mock.expects('checkPix1dActivated').once().returns(true);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('GET', '/api/organizations/4/missions/1');

      // then
      mock.verify();
    });

    it('should return 200', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization').resolves(true);
      sinon.stub(securityPreHandlers, 'checkPix1dActivated').resolves(true);
      sinon.stub(missionController, 'getById').callsFake((request, h) => h.response('ok'));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/organizations/4/missions/1');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
