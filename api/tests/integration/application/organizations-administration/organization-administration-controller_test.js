const { expect, sinon, domainBuilder, HttpTestServer } = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const usecases = require('../../../../lib/domain/usecases/index.js');

const moduleUnderTest = require('../../../../lib/application/organizations-administration');

describe('Integration | Application | Organizations administration | organization-administration-controller', function () {
  let sandbox;
  let httpTestServer;

  beforeEach(async function () {
    sandbox = sinon.createSandbox();
    sandbox.stub(usecases, 'updateOrganizationInformation');

    sandbox.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf');

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('#updateOrganizationInformation', function () {
    const payload = {
      data: {
        type: 'organizations',
        id: '1',
        attributes: {
          name: 'The name of the organization',
          type: 'PRO',
          code: 'ABCD12',
          'logo-url': 'http://log.url',
          'external-id': '02A2145V',
          'province-code': '02A',
          email: 'sco.generic.newaccount@example.net',
          credit: 10,
        },
      },
    };

    context('Success cases', function () {
      it('should resolve a 200 HTTP response', async function () {
        // given
        const organization = domainBuilder.buildOrganization();
        usecases.updateOrganizationInformation.resolves(organization);
        securityPreHandlers.adminMemberHasAtLeastOneAccessOf.returns(() => true);

        // when
        const response = await httpTestServer.request('PATCH', '/api/admin/organizations/1234', payload);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return a JSON API organization', async function () {
        // given
        const organization = domainBuilder.buildOrganization();
        usecases.updateOrganizationInformation.resolves(organization);
        securityPreHandlers.adminMemberHasAtLeastOneAccessOf.returns(() => true);

        // when
        const response = await httpTestServer.request('PATCH', '/api/admin/organizations/1234', payload);

        // then
        expect(response.result.data.type).to.equal('organizations');
      });
    });

    context('Error cases', function () {
      context('when user is not allowed to access resource', function () {
        it('should resolve a 403 HTTP response', async function () {
          // given
          securityPreHandlers.adminMemberHasAtLeastOneAccessOf.returns((request, h) =>
            h.response().code(403).takeover()
          );

          // when
          const response = await httpTestServer.request('PATCH', '/api/admin/organizations/1234', payload);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });
});
