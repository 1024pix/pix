import { expect, HttpTestServer, sinon } from '../../../test-helper.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import * as moduleUnderTest from '../../../../lib/application/complementary-certification-course-results/index.js';
import { juryOptions } from '../../../../lib/domain/models/ComplementaryCertificationCourseResult.js';
import { complementaryCertificationCourseResultsController } from '../../../../lib/application/complementary-certification-course-results/complementary-certification-course-results-controller.js';

describe('Unit | Application | Complementary Certification Course Results | Route', function () {
  describe('POST /api/admin/complementary-certification-course-results', function () {
    it('return forbidden access if user has METIER role', async function () {
      // given
      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf');
      securityPreHandlers.adminMemberHasAtLeastOneAccessOf
        .withArgs([
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
          securityPreHandlers.checkAdminMemberHasRoleCertif,
          securityPreHandlers.checkAdminMemberHasRoleSupport,
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

      // when
      const response = await httpTestServer.request('POST', '/api/admin/complementary-certification-course-results', {
        data: {
          attributes: {
            juryLevel: 52,
            complementaryCertificationCourseId: 1234,
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(403);
    });

    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    [juryOptions.REJECTED, juryOptions.UNSET, 1].forEach((juryOption) =>
      it(`should accept juryLevel with value: ${juryOption}`, async function () {
        // given
        sinon.stub(complementaryCertificationCourseResultsController, 'saveJuryComplementaryCertificationCourseResult');
        complementaryCertificationCourseResultsController.saveJuryComplementaryCertificationCourseResult.resolves();
        sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf');
        securityPreHandlers.adminMemberHasAtLeastOneAccessOf
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleCertif,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
          ])
          .callsFake(() => (request, h) => h.response('ok').code(200).takeover());

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('POST', '/api/admin/complementary-certification-course-results', {
          data: {
            attributes: {
              juryLevel: juryOption,
              complementaryCertificationCourseId: 1234,
            },
          },
        });

        // then
        expect(response.statusCode).to.equal(200);
      }),
    );

    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      { value: 'CACA_VALUE' },
      { value: [], label: '[]' },
      { value: undefined, label: 'undefined' },
      { value: -1 },
    ].forEach(({ value: juryOption, label }) =>
      it(`should not accept juryLevel with value: ${label ?? juryOption}"`, async function () {
        // given
        sinon.stub(complementaryCertificationCourseResultsController, 'saveJuryComplementaryCertificationCourseResult');
        complementaryCertificationCourseResultsController.saveJuryComplementaryCertificationCourseResult.resolves();
        sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf');
        securityPreHandlers.adminMemberHasAtLeastOneAccessOf
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleCertif,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
          ])
          .callsFake(() => (_, h) => h.response('ok').code(200).takeover());

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('POST', '/api/admin/complementary-certification-course-results', {
          data: {
            attributes: {
              juryLevel: juryOption,
              complementaryCertificationCourseId: 1234,
            },
          },
        });

        // then
        expect(response.statusCode).to.equal(400);
      }),
    );
  });
});
