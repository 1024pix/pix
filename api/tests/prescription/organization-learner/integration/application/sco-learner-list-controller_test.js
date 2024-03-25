import * as moduleUnderTest from '../../../../../src/prescription/organization-learner/application/sco-learner-list-route.js';
import { ScoOrganizationParticipant } from '../../../../../src/prescription/organization-learner/domain/read-models/ScoOrganizationParticipant.js';
import { usecases } from '../../../../../src/prescription/organization-learner/domain/usecases/index.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Integration | Application | sco-learner-list-controller', function () {
  let sandbox;
  let httpTestServer;

  beforeEach(async function () {
    sandbox = sinon.createSandbox();
    sandbox.stub(usecases, 'findPaginatedFilteredScoParticipants');

    sandbox.stub(securityPreHandlers, 'checkUserBelongsToScoOrganizationAndManagesStudents');
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('#findPaginatedFilteredScoParticipants', function () {
    context('Success cases', function () {
      it('should return an HTTP response with status code 200', async function () {
        // given
        const scoOrganizationParticipant = new ScoOrganizationParticipant();
        usecases.findPaginatedFilteredScoParticipants.resolves({ data: [scoOrganizationParticipant] });
        securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents.returns(true);

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1234/sco-participants');

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return an HTTP response formatted as JSON:API', async function () {
        // given
        const scoOrganizationParticipant = new ScoOrganizationParticipant();
        usecases.findPaginatedFilteredScoParticipants.resolves({ data: [scoOrganizationParticipant] });
        securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents.returns(true);

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1234/sco-participants');

        // then
        expect(response.result.data[0].type).to.equal('sco-organization-participants');
      });
    });

    context('Error cases', function () {
      context('when user is not allowed to access resource', function () {
        it('should resolve a 403 HTTP response', async function () {
          // given
          securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents.callsFake((request, h) => {
            return Promise.resolve(h.response().code(403).takeover());
          });

          // when
          const response = await httpTestServer.request('GET', '/api/organizations/1234/sco-participants');

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });
});
