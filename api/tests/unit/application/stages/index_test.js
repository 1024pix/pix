const { expect, sinon, HttpTestServer } = require('../../../test-helper');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const stagesController = require('../../../../lib/application/stages/stages-controller');
const moduleUnderTest = require('../../../../lib/application/stages');

let httpTestServer;

function startServer() {
  return new HttpTestServer(moduleUnderTest);
}

describe('Unit | Router | stages-router', () => {
  beforeEach(() => {
    sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
    sinon.stub(stagesController, 'create').returns('ok');
    sinon.stub(stagesController, 'updateStage').callsFake((request, h) => h.response('ok').code(204));
    sinon.stub(stagesController, 'getStageDetails').callsFake((request, h) => h.response('ok').code(200));
    httpTestServer = startServer();
  });

  describe('POST /api/admin/stages', () => {

    const method = 'POST';

    it('should exist', async () => {
      // given
      const url = '/api/admin/stages';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/admin/stages/:id', () => {
    it('should exist', async () => {
      // given
      const method = 'GET';
      const url = '/api/admin/stages/34';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return a 400 error when the id is not a number', async () => {
      // given
      const method = 'GET';
      const unknownId = 'abcd45';
      const url = `/api/admin/stages/${unknownId}`;

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('PATCH /api/admin/stages/:id', () => {
    it('should update the stage with attributes', async () => {
      // given
      const method = 'PATCH';
      const payload = { data: {
        attributes: {
          'prescriber-title': 'test',
          'prescriber-description': 'bidule',
        },
      } };
      const url = '/api/admin/stages/34';

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should update the stage even if there is null', async () => {
      // given
      const method = 'PATCH';
      const payload = { data: {
        attributes: {
          'prescriber-title': null,
          'prescriber-description': 'bidule',
        },
      } };
      const url = '/api/admin/stages/34';

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should return a 400 error when the id is not a number', async () => {
      // given
      const method = 'PATCH';
      const unknownId = 'abcd45';
      const payload = { data: {
        attributes: {
          'prescriber-title': 'test',
          'prescriber-description': 'bidule',
        },
      } };
      const url = `/api/admin/stages/${unknownId}`;

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return a 400 error when payload is undefined', async () => {
      // given
      const method = 'PATCH';
      const payload = { data: {
        attributes: {
          'prescriber-title': undefined,
          'prescriber-description': undefined,
        },
      } };
      const url = '/api/admin/stages/34';

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return a 400 error when payload is empty strings', async () => {
      // given
      const method = 'PATCH';
      const payload = { data: {
        attributes: {
          'prescriber-title': '',
          'prescriber-description': '',
        },
      } };
      const url = '/api/admin/stages/34';

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
