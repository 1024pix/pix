import { expect, sinon, HttpTestServer } from '../../../../test-helper.js';
import { securityPreHandlers } from '../../../../../lib/application/security-pre-handlers.js';
import { usecases } from '../../../../../src/prescription/organization-learner/domain/usecases/index.js';

import * as moduleUnderTest from '../../../../../src/prescription/organization-learner/application/learner-list-route.js';

describe('Integration | Application | learner-list-controller', function () {
  let sandbox;
  let httpTestServer;

  beforeEach(async function () {
    sandbox = sinon.createSandbox();
    sandbox.stub(usecases, 'getPaginatedParticipantsForAnOrganization');

    sandbox.stub(securityPreHandlers, 'checkUserBelongsToOrganization');
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  afterEach(function () {
    sandbox.restore();
  });
  describe('#getPaginatedParticipantsForAnOrganization', function () {
    context('when the organization has participants', function () {
      it('returns organization participants', async function () {
        const organizationId = 5678;
        usecases.getPaginatedParticipantsForAnOrganization
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
