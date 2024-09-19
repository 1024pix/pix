import { scoLearnerListController } from '../../../../../src/prescription/organization-learner/application/sco-learner-list-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/organization-learner/application/sco-learner-list-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Integration | Application | Routes | Sco Learner List', function () {
  describe('GET /api/organizations/:id/sco-participants', function () {
    it('should call the organization controller to return sco participants', async function () {
      // given
      const method = 'GET';
      const url = '/api/organizations/1/sco-participants';

      sinon
        .stub(securityPreHandlers, 'checkUserBelongsToScoOrganizationAndManagesStudents')
        .callsFake((_, h) => h.response(true));
      sinon
        .stub(scoLearnerListController, 'findPaginatedFilteredScoParticipants')
        .callsFake((_, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(scoLearnerListController.findPaginatedFilteredScoParticipants).to.have.been.calledOnce;
    });

    describe('When parameters are not valid', function () {
      it('should throw an error when page size is invalid', async function () {
        // given
        const method = 'GET';
        const url = '/api/organizations/1/sco-participants?page[size]=blabla';

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
        const url = '/api/organizations/1/sco-participants?page[number]=blabla';

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });

      describe('certificability filter', function () {
        it('should throw an error on single invalid parameter', async function () {
          // given
          const method = 'GET';
          const url = '/api/organizations/1/sco-participants?filter[certificability]=blabla';

          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request(method, url);

          // then
          expect(response.statusCode).to.equal(400);
        });

        it('should throw an error on multiple parameter with invalid param', async function () {
          // given
          const method = 'GET';
          const url =
            '/api/organizations/1/sco-participants?filter[certificability][]=eligible&filter[certificability][]=blabla';

          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request(method, url);

          // then
          expect(response.statusCode).to.equal(400);
        });
      });

      it('should throw an error when id is invalid', async function () {
        // given
        const method = 'GET';
        const url = '/api/organizations/wrongId/sco-participants';

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
