import * as moduleUnderTest from '../../../../../src/prescription/organization-learner/application/sup-learner-list-route.js';
import { SupOrganizationParticipant } from '../../../../../src/prescription/organization-learner/domain/read-models/SupOrganizationParticipant.js';
import { usecases } from '../../../../../src/prescription/organization-learner/domain/usecases/index.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Integration | Application | sup-learner-list-controller', function () {
  let sandbox;
  let httpTestServer;

  beforeEach(async function () {
    sandbox = sinon.createSandbox();
    sandbox.stub(usecases, 'findPaginatedFilteredSupParticipants');
    sandbox.stub(usecases, 'findGroupsByOrganization');
    sandbox.stub(securityPreHandlers, 'checkUserBelongsToSupOrganizationAndManagesStudents');
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('#findPaginatedFilteredSupParticipants', function () {
    context('Success cases', function () {
      it('should return an HTTP response with status code 200', async function () {
        // given
        const supOrganizationParticipant = new SupOrganizationParticipant();
        usecases.findPaginatedFilteredSupParticipants.resolves({ data: [supOrganizationParticipant] });
        securityPreHandlers.checkUserBelongsToSupOrganizationAndManagesStudents.returns(true);

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1234/sup-participants');

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return an HTTP response formatted as JSON:API', async function () {
        // given
        const supOrganizationParticipant = new SupOrganizationParticipant();
        usecases.findPaginatedFilteredSupParticipants.resolves({ data: [supOrganizationParticipant] });
        securityPreHandlers.checkUserBelongsToSupOrganizationAndManagesStudents.returns(true);

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1234/sup-participants');

        // then
        expect(response.result.data[0].type).to.equal('sup-organization-participants');
      });
    });

    context('Error cases', function () {
      context('when user is not allowed to access resource', function () {
        it('should resolve a 403 HTTP response', async function () {
          // given
          securityPreHandlers.checkUserBelongsToSupOrganizationAndManagesStudents.callsFake((request, h) => {
            return Promise.resolve(h.response().code(403).takeover());
          });

          // when
          const response = await httpTestServer.request('GET', '/api/organizations/1234/sup-participants');

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

  describe('#getGroups', function () {
    context('when the user is a member of the organization', function () {
      it('returns organizations groups', async function () {
        const organizationId = 1234;
        securityPreHandlers.checkUserBelongsToSupOrganizationAndManagesStudents.returns(true);
        usecases.findGroupsByOrganization.withArgs({ organizationId }).resolves([{ name: 'G1' }]);

        const response = await httpTestServer.request('GET', `/api/organizations/${organizationId}/groups`);

        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.deep.equal([{ id: 'G1', type: 'groups', attributes: { name: 'G1' } }]);
      });
    });

    context('when the user is not a member of the organization', function () {
      it('returns organizations groups', async function () {
        const organizationId = 1234;
        securityPreHandlers.checkUserBelongsToSupOrganizationAndManagesStudents.callsFake((request, h) => {
          return Promise.resolve(h.response().code(403).takeover());
        });
        const response = await httpTestServer.request('GET', `/api/organizations/${organizationId}/groups`);

        expect(response.statusCode).to.equal(403);
      });
    });

    context('when the organization id is invalid', function () {
      it('returns organizations groups', async function () {
        const response = await httpTestServer.request('GET', `/api/organizations/ABC/groups`);

        expect(response.statusCode).to.equal(400);
      });
    });
  });
});
