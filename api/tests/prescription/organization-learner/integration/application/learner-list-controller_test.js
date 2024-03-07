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

    sandbox.stub(securityPreHandlers, 'checkUserBelongsToOrganization');
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
          .withArgs({ organizationId, page: {}, filters: {}, sort: {} })
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
  });
});
