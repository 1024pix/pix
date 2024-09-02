import * as moduleUnderTest from '../../../../../src/prescription/organization-learner/application/learner-list-route.js';
import { usecases } from '../../../../../src/prescription/organization-learner/domain/usecases/index.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Integration | Application | learner-list-controller', function () {
  let sandbox;
  let httpTestServer;

  beforeEach(async function () {
    sandbox = sinon.createSandbox();
    sandbox.stub(usecases, 'findPaginatedFilteredParticipants');
    sandbox.stub(usecases, 'findDivisionsByOrganization');
    sandbox.stub(securityPreHandlers, 'checkUserBelongsToOrganization');
    sandbox.stub(securityPreHandlers, 'checkUserBelongsToScoOrganizationAndManagesStudents');
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('#findPaginatedFilteredParticipants', function () {
    context('when the organization has participants', function () {
      it('returns organization participants', async function () {
        const organizationId = 5678;
        usecases.findPaginatedFilteredParticipants
          .withArgs({ organizationId, page: {}, filters: {}, sort: {}, extraFilters: {} })
          .resolves({
            organizationParticipants: [
              {
                id: 5678,
                firstName: 'Mei',
                lastName: 'Lee',
              },
            ],
            pagination: 1,
          });
        securityPreHandlers.checkUserBelongsToOrganization.returns(() => true);
        const response = await httpTestServer.request('GET', `/api/organizations/${organizationId}/participants`);

        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.deep.equal([
          {
            id: '5678',
            type: 'organization-participants',
            attributes: {
              'first-name': 'Mei',
              'last-name': 'Lee',
            },
          },
        ]);
      });
    });
    context('when extrafilters are provided', function () {
      it('returns organization participants that match filters', async function () {
        const organizationId = 5678;

        usecases.findPaginatedFilteredParticipants
          .withArgs({ organizationId, page: {}, filters: {}, sort: {}, extraFilters: { firstName: 'Mei' } })
          .resolves({
            organizationParticipants: [
              {
                id: 5678,
                firstName: 'Mei',
                lastName: 'Lee',
              },
            ],
            pagination: 1,
          });
        securityPreHandlers.checkUserBelongsToOrganization.returns(() => true);

        const response = await httpTestServer.request(
          'GET',
          `/api/organizations/${organizationId}/participants?filter[extra][firstName]=Mei`,
        );
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.deep.equal([
          {
            id: '5678',
            type: 'organization-participants',
            attributes: {
              'first-name': 'Mei',
              'last-name': 'Lee',
            },
          },
        ]);
      });
    });
  });

  describe('#getDivisions', function () {
    context('when the user is a member of the organization', function () {
      it('returns organizations divisions', async function () {
        const organizationId = 1234;
        securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents.returns(true);
        usecases.findDivisionsByOrganization.withArgs({ organizationId }).resolves([{ name: 'G1' }]);

        const response = await httpTestServer.request('GET', `/api/organizations/${organizationId}/divisions`);

        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.deep.equal([{ id: 'G1', type: 'divisions', attributes: { name: 'G1' } }]);
      });
    });

    context('when the user is not a member of the organization', function () {
      it('returns organizations divisions', async function () {
        const organizationId = 1234;
        securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents.callsFake((request, h) => {
          return Promise.resolve(h.response().code(403).takeover());
        });
        const response = await httpTestServer.request('GET', `/api/organizations/${organizationId}/divisions`);

        expect(response.statusCode).to.equal(403);
      });
    });

    context('when the organization id is invalid', function () {
      it('returns returns an error 400', async function () {
        const response = await httpTestServer.request('GET', `/api/organizations/ABC/divisions`);

        expect(response.statusCode).to.equal(400);
      });
    });
  });
});
