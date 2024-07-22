import * as moduleUnderTest from '../../../../../src/certification/session-management/application/complementary-certification-course-results-route.js';
import { usecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { InvalidJuryLevelError } from '../../../../../src/shared/domain/errors.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Certification | Session-management | Unit | Application | complementary-certification-course-results-controller', function () {
  let sandbox;
  let httpTestServer;

  beforeEach(async function () {
    sandbox = sinon.createSandbox();
    sandbox.stub(usecases, 'saveJuryComplementaryCertificationCourseResult');
    sandbox.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin');
    sandbox.stub(securityPreHandlers, 'checkAdminMemberHasRoleCertif');
    sandbox.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport');
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('#saveJuryComplementaryCertificationCourseResult', function () {
    context('Success cases', function () {
      it(`should resolve a 200 HTTP response`, async function () {
        // given
        const payload = {
          data: {
            attributes: {
              juryLevel: 1,
              complementaryCertificationCourseId: 123456,
            },
          },
        };
        usecases.saveJuryComplementaryCertificationCourseResult.resolves();
        securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.callsFake((request, h) => h.response(true));

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

    context('Error cases', function () {
      context('when juryLevel is not valid', function () {
        it('should resolve a 400 HTTP response', async function () {
          // given
          const payload = {
            data: {
              attributes: {
                juryLevel: 1,
                complementaryCertificationCourseId: 123456,
              },
            },
          };
          usecases.saveJuryComplementaryCertificationCourseResult.rejects(new InvalidJuryLevelError());
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.callsFake((request, h) => h.response(true));

          // when
          const response = await httpTestServer.request(
            'POST',
            '/api/admin/complementary-certification-course-results',
            payload,
          );

          // then
          expect(response.statusCode).to.equal(400);
          expect(response.result.errors[0].detail).to.equal('Le niveau jury renseigné est invalide.');
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
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.callsFake((request, h) =>
            h.response({ errors: new Error('forbidden') }).code(403),
          );
          securityPreHandlers.checkAdminMemberHasRoleSupport.callsFake((request, h) =>
            h.response({ errors: new Error('forbidden') }).code(403),
          );
          securityPreHandlers.checkAdminMemberHasRoleCertif.callsFake((request, h) =>
            h.response({ errors: new Error('forbidden') }).code(403),
          );

          // when
          const response = await httpTestServer.request(
            'POST',
            '/api/admin/complementary-certification-course-results',
            payload,
          );

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });
});
