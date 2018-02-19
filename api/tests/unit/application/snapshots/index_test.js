const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');

const snapshotController = require('../../../../lib/application/snapshots/snapshot-controller');

describe('Unit | Router | snapshot-router', () => {

  let server;

  beforeEach(() => {
    server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/snapshots') });
  });

  describe('POST /api/snapshots', _ => {

    before(() => {
      sinon.stub(snapshotController, 'create').callsFake((request, reply) => reply('ok'));
    });

    after(() => {
      snapshotController.create.restore();
    });

    it('should exist', (done) => {
      return server.inject({ method: 'POST', url: '/api/snapshots' }, res => {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });
  });

});
