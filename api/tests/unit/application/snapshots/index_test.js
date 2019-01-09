const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const snapshotController = require('../../../../lib/application/snapshots/snapshot-controller');
const route = require('../../../../lib/application/snapshots');

describe('Unit | Router | snapshot-router', () => {

  let server;

  beforeEach(() => {
    server = Hapi.server();
  });

  describe('POST /api/snapshots', (_) => {

    beforeEach(() => {
      sinon.stub(snapshotController, 'create').returns('ok');
      return server.register(route);
    });

    it('should exist', () => {
      return server.inject({ method: 'POST', url: '/api/snapshots' }).then((res) => {
        expect(res.statusCode).to.equal(200);
      });
    });
  });

});
