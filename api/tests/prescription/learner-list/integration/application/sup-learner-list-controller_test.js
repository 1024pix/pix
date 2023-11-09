import { expect, sinon, HttpTestServer } from '../../../../test-helper.js';
import { securityPreHandlers } from '../../../../../lib/application/security-pre-handlers.js';
import { usecases } from '../../../../../src/prescription/learner-list/domain/usecases/index.js';

import { SupOrganizationParticipant } from '../../../../../src/prescription/learner-list/domain/read-models/SupOrganizationParticipant.js';
import * as moduleUnderTest from '../../../../../src/prescription/learner-list/application/sup-learner-list-route.js';

describe('Integration | Application | sup-learner-list-controller', function () {
  let sandbox;
  let httpTestServer;

  beforeEach(async function () {
    sandbox = sinon.createSandbox();
    sandbox.stub(usecases, 'findPaginatedFilteredSupParticipants');

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
});
