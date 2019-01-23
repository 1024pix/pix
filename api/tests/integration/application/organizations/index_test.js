const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const securityController = require('../../../../lib/interfaces/controllers/security-controller');
const organisationController = require('../../../../lib/application/organizations/organization-controller');
const route = require('../../../../lib/application/organizations/index');

describe('Integration | Application | Organizations | Routes', () => {

  let server;

  beforeEach(() => {
    server = Hapi.server();
  });

  describe('POST /api/organizations', (_) => {

    beforeEach(() => {
      sinon.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
      sinon.stub(organisationController, 'create').returns('ok');
      return server.register(route);
    });

    it('should exist', () => {
      return server.inject({ method: 'POST', url: '/api/organizations' }).then((res) => {
        expect(res.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/organizations', (_) => {

    beforeEach(() => {
      sinon.stub(organisationController, 'find').returns('ok');
      return server.register(route);
    });

    it('should exist', () => {
      server.inject({ method: 'GET', url: '/api/organizations' }).then((res) => {
        expect(res.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/organizations/:id/campaigns', () => {

    beforeEach(() => {
      sinon.stub(organisationController, 'getCampaigns').returns('ok');
      return server.register(route);
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
