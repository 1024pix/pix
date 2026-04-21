import sinon from 'sinon';

import { combinedCourseController } from '../../../../src/quest/application/combined-course-controller.js';
import * as combinedCourseRoute from '../../../../src/quest/application/combined-course-route.js';
import { OrganizationLearnerParticipationStatuses } from '../../../../src/quest/domain/models/OrganizationLearnerParticipation.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { HttpTestServer } from '../../../tooling/server/http-test-server.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

describe('Quest | Unit | Routes | combined-course-route', function () {
  describe('GET /api/combined-courses/{combinedCourseId}', function () {
    it('should call prehandler', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserCanManageCombinedCourse').returns(() => true);
      sinon.stub(combinedCourseController, 'getById').callsFake((_, h) => h.response());

      const httpTestServer = new HttpTestServer();
      httpTestServer.setupAuthentication();
      await httpTestServer.register(combinedCourseRoute);

      // when
      await httpTestServer.request(
        'GET',
        '/api/combined-courses/123',
        null,
        null,
        generateAuthenticatedUserRequestHeaders({ userId: 123 }),
      );

      // then
      expect(securityPreHandlers.checkUserCanManageCombinedCourse).to.have.been.called;
    });
  });

  describe('GET /api/combined-courses/{combinedCourseId}/statistics', function () {
    it('should call prehandler', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserCanManageCombinedCourse').returns(() => true);
      sinon.stub(combinedCourseController, 'getStatistics').callsFake((_, h) => h.response());

      const httpTestServer = new HttpTestServer();
      httpTestServer.setupAuthentication();
      await httpTestServer.register(combinedCourseRoute);

      // when
      await httpTestServer.request(
        'GET',
        '/api/combined-courses/123/statistics',
        null,
        null,
        generateAuthenticatedUserRequestHeaders({ userId: 123 }),
      );

      // then
      expect(securityPreHandlers.checkUserCanManageCombinedCourse).to.have.been.called;
    });
  });

  describe('GET /api/combined-courses/{combinedCourseId}/participations', function () {
    it('should call prehandler', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserCanManageCombinedCourse').returns(() => true);
      sinon.stub(combinedCourseController, 'findParticipations').callsFake((_, h) => h.response());

      const httpTestServer = new HttpTestServer();
      httpTestServer.setupAuthentication();
      await httpTestServer.register(combinedCourseRoute);

      // when
      await httpTestServer.request(
        'GET',
        '/api/combined-courses/123/participations?' +
          'page[number]=1' +
          '&page[size]=5' +
          '&filters[fullName]=Mar' +
          `&filters[statuses][]=${OrganizationLearnerParticipationStatuses.STARTED}` +
          '&filters[divisions][]=6eme' +
          '&filters[groups][]=A',
        null,
        null,
        generateAuthenticatedUserRequestHeaders({ userId: 123 }),
      );

      // then
      expect(securityPreHandlers.checkUserCanManageCombinedCourse).to.have.been.called;
    });
  });

  describe('GET /api/combined-courses/{combinedCourseId}/participations/{participationId}', function () {
    it('should call prehandler', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserCanManageCombinedCourse').returns(() => true);
      sinon.stub(securityPreHandlers, 'checkParticipationBelongsToCombinedCourse').returns(() => true);
      sinon.stub(combinedCourseController, 'getCombinedCourseParticipationById').callsFake((_, h) => h.response());

      const httpTestServer = new HttpTestServer();
      httpTestServer.setupAuthentication();
      await httpTestServer.register(combinedCourseRoute);

      // when
      await httpTestServer.request(
        'GET',
        '/api/combined-courses/123/participations/456',
        null,
        null,
        generateAuthenticatedUserRequestHeaders({ userId: 123 }),
      );

      // then
      expect(securityPreHandlers.checkUserCanManageCombinedCourse).to.have.been.called;
      expect(securityPreHandlers.checkParticipationBelongsToCombinedCourse).to.have.been.called;
    });
  });

  describe('PUT /api/combined-course/{code}/start', function () {
    it('should call prehandler', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkAuthorizationToAccessCombinedCourse').returns(() => true);
      sinon.stub(combinedCourseController, 'start').callsFake((_, h) => h.response());

      const httpTestServer = new HttpTestServer();
      httpTestServer.setupAuthentication();
      await httpTestServer.register(combinedCourseRoute);

      // when
      await httpTestServer.request(
        'PUT',
        '/api/combined-courses/ABC/start',
        null,
        null,
        generateAuthenticatedUserRequestHeaders({ userId: 123 }),
      );

      // then
      expect(securityPreHandlers.checkAuthorizationToAccessCombinedCourse).to.have.been.called;
    });
  });

  describe('PATCH /api/combined-course/{code}/reassess-status', function () {
    it('should call prehandler', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkAuthorizationToAccessCombinedCourse').returns(() => true);
      sinon.stub(combinedCourseController, 'reassessStatus').callsFake((_, h) => h.response());

      const httpTestServer = new HttpTestServer();
      httpTestServer.setupAuthentication();
      await httpTestServer.register(combinedCourseRoute);

      // when
      await httpTestServer.request(
        'PATCH',
        '/api/combined-courses/ABC/reassess-status',
        null,
        null,
        generateAuthenticatedUserRequestHeaders({ userId: 123 }),
      );

      // then
      expect(securityPreHandlers.checkAuthorizationToAccessCombinedCourse).to.have.been.called;
    });
  });

  describe('GET /api/organizations/{organizationId}/combined-courses', function () {
    it('should call prehandler', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization').returns(() => true);
      sinon.stub(combinedCourseController, 'getByOrganizationId').callsFake((_, h) => h.response());

      const httpTestServer = new HttpTestServer();
      httpTestServer.setupAuthentication();
      await httpTestServer.register(combinedCourseRoute);

      // when
      await httpTestServer.request(
        'GET',
        '/api/organizations/123/combined-courses',
        null,
        null,
        generateAuthenticatedUserRequestHeaders({ userId: 123 }),
      );

      // then
      expect(securityPreHandlers.checkUserBelongsToOrganization).to.have.been.called;
    });
  });
});
