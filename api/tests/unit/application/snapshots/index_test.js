const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');

const snapshotController = require('../../../../lib/application/snapshots/snapshot-controller');

describe('Unit | Router | snapshot-router', () => {

  let server;

  beforeEach(() => {
    server = Hapi.server();
    return server.register(require('../../../../lib/application/snapshots'));
  });

  describe('POST /api/snapshots', (_) => {

    before(() => {
      sinon.stub(snapshotController, 'create').returns('ok');
    });

    after(() => {
      snapshotController.create.restore();
    });

    it('should exist', () => {
      return server.inject({ method: 'POST', url: '/api/snapshots' }).then((res) => {
        expect(res.statusCode).to.equal(200);
      });
    });
  });

});
