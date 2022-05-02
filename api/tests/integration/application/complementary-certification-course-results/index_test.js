const { expect, HttpTestServer, sinon } = require('../../../test-helper');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const moduleUnderTest = require('../../../../lib/application/complementary-certification-course-results');
const complementaryCertificationCourseResultsController = require('../../../../lib/application/complementary-certification-course-results/complementary-certification-course-results-controller');

describe('Integration | Application | Route | Certifications', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon
      .stub(complementaryCertificationCourseResultsController, 'saveJuryComplementaryCertificationCourseResult')
      .callsFake((request, h) => h.response('ok').code(200));
    sinon.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin').callsFake((request, h) => h.response(true));

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('POST /api/complementary-certification-course-results', function () {
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
      const response = await httpTestServer.request('POST', '/api/complementary-certification-course-results', payload);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
