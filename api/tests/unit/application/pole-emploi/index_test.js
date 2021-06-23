const {
  expect,
  HttpTestServer,
  sinon,
} = require('../../../test-helper');
const poleEmploiController = require('../../../../lib/application/pole-emplois/pole-emploi-controller');
const moduleUnderTest = require('../../../../lib/application/pole-emplois');

describe('Unit | Router | pole-emploi-router', () => {

  describe('GET /api/pole-emploi/envois', () => {
    it('should exist', async () => {
      // given
      sinon.stub(poleEmploiController, 'getSendings').callsFake((request, h) => h.response('ok').code(200));
      sinon.stub(poleEmploiController, 'getSendings').callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'GET';
      const url = '/api/pole-emploi/envois';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(poleEmploiController.getSendings).have.been.calledOnce;
    });
  });

});
