const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const securityController = require('../../../../lib/interfaces/controllers/security-controller');
const organisationController = require('../../../../lib/application/organizations/organization-controller');

describe('Unit | Application | Organizations | Routes', () => {

  let server;

  beforeEach(() => {
    server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/organizations/index') });
  });

  describe('POST /api/organizations', (_) => {

    before(() => {
      sinon.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, reply) => reply(true));
      sinon.stub(organisationController, 'create').callsFake((request, reply) => reply('ok'));
    });

    after(() => {
      securityController.checkUserHasRolePixMaster.restore();
      organisationController.create.restore();
    });

    it('should exist', (done) => {
      return server.inject({ method: 'POST', url: '/api/organizations' }, (res) => {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });
  });

  describe('GET /api/organizations', (_) => {

    before(() => {
      sinon.stub(organisationController, 'search').callsFake((request, reply) => reply('ok'));
    });

    after(() => {
      organisationController.search.restore();
    });

    it('should exist', (done) => {
      server.inject({ method: 'GET', url: '/api/organizations' }, (res) => {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });
  });

  describe('GET /api/organizations/:id/snapshots', (_) => {

    before(() => {
      sinon.stub(organisationController, 'getSharedProfiles').callsFake((request, reply) => reply('ok'));
    });

    after(() => {
      organisationController.getSharedProfiles.restore();
    });

    it('should exist', (done) => {
      server.inject({ method: 'GET', url: '/api/organizations/:id/snapshots' }, (res) => {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });
  });

  describe('GET /api/organizations/:id/campaigns', () => {

    before(() => {
      sinon.stub(organisationController, 'getCampaigns').callsFake((request, reply) => reply('ok'));
    });

    after(() => {
      organisationController.getCampaigns.restore();
    });

    it('should call the organization controller to get the campaigns', () => {
      // when
      const promise = server.inject({ method: 'GET', url: '/api/organizations/:id/campaigns' });

      // then
      return promise.then((resp) => {
        expect(resp.statusCode).to.equal(200);
        expect(organisationController.getCampaigns).to.have.been.calledOnce;
      });
    });
  });
});
