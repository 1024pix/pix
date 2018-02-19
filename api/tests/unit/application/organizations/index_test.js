const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');

const organisationController = require('../../../../lib/application/organizations/organization-controller');

describe('Unit | Router | organization-router', () => {

  let server;

  beforeEach(() => {
    server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/organizations') });
  });

  describe('POST /api/organizations', _ => {

    before(() => {
      sinon.stub(organisationController, 'create').callsFake((request, reply) => reply('ok'));
    });

    after(() => {
      organisationController.create.restore();
    });

    it('should exist', (done) => {
      return server.inject({ method: 'POST', url: '/api/organizations' }, res => {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });
  });

  describe('GET /api/organizations', _ => {

    before(() => {
      sinon.stub(organisationController, 'search').callsFake((request, reply) => reply('ok'));
    });

    after(() => {
      organisationController.search.restore();
    });

    it('should exist', (done) => {
      server.inject({ method: 'GET', url: '/api/organizations' }, res => {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });
  });

  describe('GET /api/organizations/:id/snapshots', _ => {

    before(() => {
      sinon.stub(organisationController, 'getSharedProfiles').callsFake((request, reply) => reply('ok'));
    });

    after(() => {
      organisationController.getSharedProfiles.restore();
    });

    it('should exist', (done) => {
      server.inject({ method: 'GET', url: '/api/organizations/:id/snapshots' }, res => {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });
  });

});
