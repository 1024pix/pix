const { expect, sinon, HttpTestServer } = require('../../../test-helper');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const usecases = require('../../../../lib/domain/usecases');
const moduleUnderTest = require('../../../../lib/application/complementary-certification-course-results');

describe('Integration | Application | complementary-certification-course-results | complementary-certification-course-results-controller', function () {
  let sandbox;
  let httpTestServer;

  beforeEach(async function () {
    sandbox = sinon.createSandbox();
    sandbox.stub(usecases, 'saveJuryComplementaryCertificationCourseResult');
    sandbox.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin');
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('#saveJuryComplementaryCertificationCourseResult', function () {
    context('Success cases', function () {
      // eslint-disable-next-line mocha/no-setup-in-describe
      [
        'PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE',
        'PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME',
        'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME',
        'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE',
        'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT',
        'PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE',
        'PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME',
        'PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME',
        'PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE',
        'PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT',
        'REJECTED',
      ].forEach((juryLevel) => {
        it(`should resolve a 200 HTTP response for ${juryLevel} juryLevel`, async function () {
          // given
          const payload = {
            data: {
              attributes: {
                juryLevel,
                complementaryCertificationCourseId: 123456,
              },
            },
          };
          usecases.saveJuryComplementaryCertificationCourseResult.resolves();
          securityPreHandlers.checkUserHasRoleSuperAdmin.callsFake((request, h) => h.response(true));

          // when
          const response = await httpTestServer.request(
            'POST',
            '/api/complementary-certification-course-results',
            payload
          );

          // then
          expect(response.statusCode).to.equal(200);
        });
      });
    });

    context('Error cases', function () {
      context('when juryLevel is not valid', function () {
        it('should resolve a 400 HTTP response', async function () {
          // given
          const payload = {
            data: {
              attributes: {
                juryLevel: 'INVALID_JURY_LEVEL',
                complementaryCertificationCourseId: 123456,
              },
            },
          };
          usecases.saveJuryComplementaryCertificationCourseResult.resolves();
          securityPreHandlers.checkUserHasRoleSuperAdmin.callsFake((request, h) => h.response(true));

          // when
          const response = await httpTestServer.request(
            'POST',
            '/api/complementary-certification-course-results',
            payload
          );

          // then
          expect(response.statusCode).to.equal(400);
        });
      });

      context('when user is not allowed to access resource', function () {
        it('should resolve a 403 HTTP response', async function () {
          // given
          const payload = {
            data: {
              attributes: {
                juryLevel: 'REJECTED',
                complementaryCertificationCourseId: 123456,
              },
            },
          };
          securityPreHandlers.checkUserHasRoleSuperAdmin.callsFake((request, h) => {
            return Promise.resolve(h.response().code(403).takeover());
          });

          // when
          const response = await httpTestServer.request(
            'POST',
            '/api/complementary-certification-course-results',
            payload
          );

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });
});
