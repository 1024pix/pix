import sinon from 'sinon';

import { courseController } from '../../../../../src/evaluation/application/courses/course-controller.js';
import { courseRoute as moduleUnderTest } from '../../../../../src/evaluation/application/courses/course-route.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Unit | Router | course-router', function () {
  describe('GET /api/courses/{id}', function () {
    it('should exist', async function () {
      // given
      sinon.stub(courseController, 'get').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/courses/course_id');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
