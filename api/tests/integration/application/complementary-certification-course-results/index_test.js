import { expect, HttpTestServer, sinon } from '../../../test-helper.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import * as moduleUnderTest from '../../../../lib/application/complementary-certification-course-results/index.js';
import { complementaryCertificationCourseResultsController } from '../../../../lib/application/complementary-certification-course-results/complementary-certification-course-results-controller.js';

describe('Integration | Application | Route | Certifications', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon
      .stub(complementaryCertificationCourseResultsController, 'saveJuryComplementaryCertificationCourseResult')
      .callsFake((request, h) => h.response('ok').code(200));
    sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('POST /api/admin/complementary-certification-course-results', function () {
    it('should exist', async function () {
      // given
      const payload = {
        data: {
          attributes: {
            juryLevel: 'REJECTED',
            complementaryCertificationCourseId: 123456,
          },
        },
      };
      // when
      const response = await httpTestServer.request(
        'POST',
        '/api/admin/complementary-certification-course-results',
        payload,
      );

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
