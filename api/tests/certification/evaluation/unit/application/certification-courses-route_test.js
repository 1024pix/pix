import sinon from 'sinon';

import { certificationCourseController as certificationCoursesController } from '../../../../../src/certification/evaluation/application/certification-course-controller.js';
import { certificationCourseRoute as moduleUnderTest } from '../../../../../src/certification/evaluation/application/certification-course-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Unit | Application | Certifications Course | Route', function () {
  describe('POST /api/certification-courses', function () {
    it('should return OK (200)', async function () {
      // given
      sinon.stub(certificationCoursesController, 'save').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const method = 'POST';
      const url = '/api/certification-courses';
      const payload = {
        data: {
          attributes: {
            'access-code': 'FMKP39',
            'session-id': 2,
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/certification-courses/{id}', function () {
    it('should exist', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserOwnsCertificationCourse').returns(() => true);
      sinon.stub(certificationCoursesController, 'get').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/certification-courses/1234');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
