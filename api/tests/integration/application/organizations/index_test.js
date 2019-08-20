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

  describe('POST /api/organizations', () => {

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

  describe('GET /api/organizations', () => {

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

  describe('POST /api/organizations/:id/students', () => {

    beforeEach(() => {
      sinon.stub(securityController, 'checkUserIsOwnerInScoOrganizationAndManagesStudents').callsFake((request, h) => h.response(true));
      sinon.stub(organisationController, 'importStudents').callsFake((request, h) => h.response('ok').code(201));
      return server.register(route);
    });

    it('should call the organization controller to import students', () => {
      // given
      const payload =
        '------WebKitFormBoundaryxSSpu5dJeHVmxnBq\r\n' +
        'Content-Disposition: form-data; name="Content-Type"\r\n' +
        '\r\n' +
        'text/xml\r\n' +
        '------WebKitFormBoundaryxSSpu5dJeHVmxnBq\r\n' +
        'Content-Disposition: form-data; name="file"; filename="file.xml"\r\n' +
        'Content-Type: text/xml\r\n' +
        '\r\n' +
        '\r\n' +
        '------WebKitFormBoundaryxSSpu5dJeHVmxnBq--';

      // when
      const promise = server.inject({
        method: 'POST',
        url: '/api/organizations/:id/students',
        headers: {
          'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundaryxSSpu5dJeHVmxnBq'
        },
        payload
      });

      // then
      return promise.then((resp) => {
        expect(resp.statusCode).to.equal(201);
        expect(organisationController.importStudents).to.have.been.calledOnce;
      });
    });
  });
});
