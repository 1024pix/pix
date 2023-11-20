import { expect, sinon, HttpTestServer } from '../../../../test-helper.js';
import { securityPreHandlers } from '../../../../../lib/application/security-pre-handlers.js';
import { learnerListController } from '../../../../../src/prescription/organization-learner/application/learner-list-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/organization-learner/application/learner-list-route.js';

describe('Integration | Application | Routes | Learner List', function () {
  describe('GET /api/organizations/{id}/participants', function () {
    const method = 'GET';
    const url = '/api/organizations/1/participants';

    it('should return HTTP code 200', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization').returns(true);

      sinon
        .stub(learnerListController, 'findPaginatedFilteredParticipants')
        .callsFake((_, h) => h.response('ok').code(200));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            id: '1',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
      expect(learnerListController.findPaginatedFilteredParticipants).to.have.been.calledOnce;
    });

    it('should return HTTP code 400 when user not belongs to the organization', async function () {
      //given
      sinon
        .stub(securityPreHandlers, 'checkUserBelongsToOrganization')
        .callsFake((_, h) => h.response('ko').code(403).takeover());

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          type: 'organization-participants',
          attributes: {
            id: '1',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('returns an error 400 when the organization id is not valid', async function () {
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const response = await httpTestServer.request('GET', `/api/organizations/ABC/participants`);

      expect(response.statusCode).to.equal(400);
    });
  });
});
