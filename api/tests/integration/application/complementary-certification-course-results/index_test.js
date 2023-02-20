import { expect, HttpTestServer, sinon } from '../../../test-helper';
import securityPreHandlers from '../../../../lib/application/security-pre-handlers';
import moduleUnderTest from '../../../../lib/application/complementary-certification-course-results';
import complementaryCertificationCourseResultsController from '../../../../lib/application/complementary-certification-course-results/complementary-certification-course-results-controller';

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
        payload
      );

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
