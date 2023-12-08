import { domainBuilder, expect, HttpTestServer, sinon } from '../../../../test-helper.js';
import { usecases } from '../../../../../src/prescription/organization-place/domain/usecases/index.js';
import { securityPreHandlers } from '../../../../../lib/application/security-pre-handlers.js';
import * as moduleUnderTest from '../../../../../src/prescription/organization-place/application/organization-place-route.js';

describe('Integration | Application | organization-place-controller', function () {
  let sandbox;
  let httpTestServer;

  beforeEach(async function () {
    sandbox = sinon.createSandbox();

    sandbox.stub(usecases, 'findOrganizationPlacesLot');

    sandbox.stub(securityPreHandlers, 'checkUserIsAdminInOrganization');
    sandbox.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin');
    sandbox.stub(securityPreHandlers, 'checkUserBelongsToOrganizationManagingStudents');
    sandbox.stub(securityPreHandlers, 'checkUserBelongsToScoOrganizationAndManagesStudents');
    sandbox.stub(securityPreHandlers, 'checkUserBelongsToSupOrganizationAndManagesStudents');
    sandbox.stub(securityPreHandlers, 'checkUserIsAdminInSCOOrganizationManagingStudents');
    sandbox.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf');
    sandbox.stub(securityPreHandlers, 'checkUserBelongsToOrganization');
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('#findOrganizationPlacesLot', function () {
    context('Success cases', function () {
      it('should return an HTTP response with status code 200', async function () {
        // given
        const organizationId = domainBuilder.buildOrganization().id;
        const place = domainBuilder.buildOrganizationPlacesLotManagement({
          organizationId,
          count: 18,
          activationDate: new Date('2020-01-01'),
          expirationDate: new Date('2021-01-01'),
          reference: 'Toho Godzilla',
          category: 'T2',
        });
        usecases.findOrganizationPlacesLot.resolves([place]);
        securityPreHandlers.adminMemberHasAtLeastOneAccessOf.returns(() => true);

        // when
        const response = await httpTestServer.request('GET', `/api/admin/organizations/${organizationId}/places`);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });
  });
});
