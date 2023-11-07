import { expect, sinon, HttpTestServer } from '../../../../test-helper.js';
import { securityPreHandlers } from '../../../../../lib/application/security-pre-handlers.js';
import { supLearnerListController } from '../../../../../src/prescription/learner-list/application/sup-learner-list-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/learner-list/application/sup-learner-list-route.js';

describe('Integration | Application | Routes | Sup Learner List', function () {
  describe('GET /api/organizations/:id/sup-participants', function () {
    it('should call the organization controller to return sup participants', async function () {
      // given
      const method = 'GET';
      const url = '/api/organizations/1/sup-participants';

      sinon
        .stub(securityPreHandlers, 'checkUserBelongsToSupOrganizationAndManagesStudents')
        .callsFake((_, h) => h.response(true));
      sinon
        .stub(supLearnerListController, 'findPaginatedFilteredSupParticipants')
        .callsFake((_, h) => h.response('ok').code(200));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(supLearnerListController.findPaginatedFilteredSupParticipants).to.have.been.calledOnce;
    });

    describe('When parameters are not valid', function () {
      it('should throw an error when page size is invalid', async function () {
        // given
        const method = 'GET';
        const url = '/api/organizations/1/sup-participants?page[size]=blabla';

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should throw an error when page number is invalid', async function () {
        // given
        const method = 'GET';
        const url = '/api/organizations/1/sup-participants?page[number]=blabla';

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should throw an error when id is invalid', async function () {
        // given
        const method = 'GET';
        const url = '/api/organizations/wrongId/sup-participants';

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });
});
