import sinon from 'sinon';

import { combinedCourseController } from '../../../../src/quest/application/combined-course-controller.js';
import * as combinedCourseRoute from '../../../../src/quest/application/combined-course-route.js';
import questSecurityPreHandlers from '../../../../src/quest/application/security-pre-handlers.js';
import { OrganizationLearnerParticipationStatuses } from '../../../../src/quest/domain/models/OrganizationLearnerParticipation.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../test-helper.js';
import { HttpTestServer } from '../../../tooling/server/http-test-server.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

describe('Quest | Unit | Routes | combined-course-route', function () {
  describe('GET /api/combined-courses/{combinedCourseId}', function () {
    it('should call prehandler', async function () {
      // given
      sinon.stub(questSecurityPreHandlers, 'checkUserCanManageCombinedCourse').returns(() => true);
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
      expect(questSecurityPreHandlers.checkUserCanManageCombinedCourse).to.have.been.called;
    });
  });

  describe('GET /api/combined-courses/{combinedCourseId}/statistics', function () {
    it('should call prehandler', async function () {
      // given
      sinon.stub(questSecurityPreHandlers, 'checkUserCanManageCombinedCourse').returns(() => true);
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
      expect(questSecurityPreHandlers.checkUserCanManageCombinedCourse).to.have.been.called;
    });
  });

  describe('GET /api/combined-courses/{combinedCourseId}/participations', function () {
    it('should call prehandler', async function () {
      // given
      sinon.stub(questSecurityPreHandlers, 'checkUserCanManageCombinedCourse').returns(() => true);
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
      expect(questSecurityPreHandlers.checkUserCanManageCombinedCourse).to.have.been.called;
    });
  });

  describe('GET /api/combined-courses/{combinedCourseId}/participations/{participationId}', function () {
    it('should call prehandler', async function () {
      // given
      sinon.stub(questSecurityPreHandlers, 'checkUserCanManageCombinedCourse').returns(() => true);
      sinon.stub(questSecurityPreHandlers, 'checkParticipationBelongsToCombinedCourse').returns(() => true);
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
      expect(questSecurityPreHandlers.checkUserCanManageCombinedCourse).to.have.been.called;
      expect(questSecurityPreHandlers.checkParticipationBelongsToCombinedCourse).to.have.been.called;
    });
  });

  describe('PUT /api/combined-courses/{code}/start', function () {
    it('should call prehandler', async function () {
      // given
      sinon.stub(questSecurityPreHandlers, 'checkAuthorizationToAccessCombinedCourse').returns(() => true);
      sinon.stub(questSecurityPreHandlers, 'checkCombinedCoursesFeatureIsEnabled').returns(() => true);
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
      expect(questSecurityPreHandlers.checkAuthorizationToAccessCombinedCourse).to.have.been.called;
      expect(questSecurityPreHandlers.checkCombinedCoursesFeatureIsEnabled).to.have.been.called;
    });
  });

  describe('PATCH /api/combined-courses/{code}/reassess-status', function () {
    it('should call prehandler', async function () {
      // given
      sinon.stub(questSecurityPreHandlers, 'checkAuthorizationToAccessCombinedCourse').returns(() => true);
      sinon.stub(questSecurityPreHandlers, 'checkCombinedCoursesFeatureIsEnabled').returns(() => true);
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
      expect(questSecurityPreHandlers.checkAuthorizationToAccessCombinedCourse).to.have.been.called;
      expect(questSecurityPreHandlers.checkCombinedCoursesFeatureIsEnabled).to.have.been.called;
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

  describe('POST /api/combined-courses', function () {
    it('should call prehandlers', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkOrganizationAccess').returns(() => true);

      const httpTestServer = new HttpTestServer();
      httpTestServer.setupAuthentication();
      await httpTestServer.register(combinedCourseRoute);

      // when
      const payload = {
        data: {
          type: 'campaign',
          attributes: {
            name: 'Parcours combiné collège',
            type: 'COMBINED_COURSE',
            ['owner-id']: null,
          },
          relationships: {
            'combined-course-blueprint': {
              data: {
                type: 'combined-course-blueprints',
                id: `456`,
              },
            },
            organization: {
              data: {
                type: 'organizations',
                id: `123`,
              },
            },
          },
        },
      };

      await httpTestServer.request(
        'POST',
        '/api/combined-courses',
        payload,
        null,
        generateAuthenticatedUserRequestHeaders({ userId: 123 }),
      );

      // then
      expect(securityPreHandlers.checkOrganizationAccess).to.have.been.called;
    });
  });
});
