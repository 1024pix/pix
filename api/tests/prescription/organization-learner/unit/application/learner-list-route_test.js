import sinon from 'sinon';

import { learnerListController } from '../../../../../src/prescription/organization-learner/application/learner-list-controller.js';
import { learnerListRoute as moduleUnderTest } from '../../../../../src/prescription/organization-learner/application/learner-list-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Unit | Application | Routes | Learner List', function () {
  describe('GET /api/organizations/{organizationId}/participants', function () {
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

      // when
      const response = await httpTestServer.request(method, url, null);

      // then
      expect(response.statusCode).to.equal(200);
      expect(learnerListController.findPaginatedFilteredParticipants).to.have.been.calledOnce;
    });

    it('should return HTTP code 403 when user not belongs to the organization', async function () {
      //given
      sinon
        .stub(securityPreHandlers, 'checkUserBelongsToOrganization')
        .callsFake((_, h) => h.response('ko').code(403).takeover());

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url, null);

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('returns an error 400 when the organization id is not valid', async function () {
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const response = await httpTestServer.request('GET', `/api/organizations/ABC/participants`);

      expect(response.statusCode).to.equal(400);
    });

    describe('certificability filter', function () {
      it('should throw an error on single invalid parameter', async function () {
        // given
        const method = 'GET';
        const url = '/api/organizations/1/participants?filter[certificability]=blabla';

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
          '/api/organizations/1/participants?filter[certificability][]=eligible&filter[certificability][]=blabla';

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });
  describe('GET /api/admin/organization-learners', function () {
    it('should return error 403 when user is not admin', async function () {
      //given
      sinon.stub(learnerListController, 'findOrganizationLearnersForAdmin');
      sinon
        .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
        .withArgs([
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
          securityPreHandlers.checkAdminMemberHasRoleCertif,
          securityPreHandlers.checkAdminMemberHasRoleSupport,
          securityPreHandlers.checkAdminMemberHasRoleMetier,
        ])
        .callsFake(
          () => (request, h) =>
            h
              .response({ errors: new Error('forbidden') })
              .code(403)
              .takeover(),
        );

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      //when
      const response = await httpTestServer.request('GET', '/api/admin/organization-learners', null);

      //then
      expect(response.statusCode).to.be.equal(403);
      sinon.assert.notCalled(learnerListController.findOrganizationLearnersForAdmin);
    });
    it('should return error 400 when filters are invalid', async function () {
      //given
      sinon.stub(learnerListController, 'findOrganizationLearnersForAdmin');
      sinon
        .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
        .withArgs([
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
          securityPreHandlers.checkAdminMemberHasRoleCertif,
          securityPreHandlers.checkAdminMemberHasRoleSupport,
          securityPreHandlers.checkAdminMemberHasRoleMetier,
        ])
        .callsFake(() => (request, h) => h.response().code(200));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      //when
      const response = await httpTestServer.request('GET', '/api/admin/organization-learners?filter[wrongFilter]=true');

      //then
      expect(response.statusCode).to.be.equal(400);
      sinon.assert.notCalled(learnerListController.findOrganizationLearnersForAdmin);
    });
  });
});
