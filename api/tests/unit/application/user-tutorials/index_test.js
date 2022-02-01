const { expect, HttpTestServer, sinon } = require('../../../test-helper');
const userTutorialsController = require('../../../../lib/application/user-tutorials/user-tutorials-controller');
const moduleUnderTest = require('../../../../lib/application/user-tutorials');

describe('Unit | Router | user-tutorials-router', function () {
  describe('PUT /api/users/tutorials/{tutorialId}', function () {
    it('should exist', async function () {
      // given
      sinon.stub(userTutorialsController, 'add').callsFake((request, h) => h.response('ok').code(204));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'PUT';
      const url = '/api/users/tutorials/{tutorialId}';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(userTutorialsController.add).have.been.called;
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('GET /api/users/tutorials', function () {
    it('should exist', async function () {
      // given
      sinon.stub(userTutorialsController, 'find').callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'GET';
      const url = '/api/users/tutorials';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(userTutorialsController.find).have.been.called;
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('DELETE /api/users/tutorials/{tutorialId}', function () {
    it('should exist', async function () {
      // given
      sinon.stub(userTutorialsController, 'removeFromUser').callsFake((request, h) => h.response().code(204));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'DELETE';
      const url = '/api/users/tutorials/tutorialId';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(userTutorialsController.removeFromUser).have.been.called;
      expect(response.statusCode).to.equal(204);
    });
  });
});
