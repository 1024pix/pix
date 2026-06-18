import sinon from 'sinon';

import { complementaryCertificationCourseResultsController } from '../../../../../src/certification/session-management/application/complementary-certification-course-results-controller.js';
import { complementaryCertificationCourseResultsRoute as moduleUnderTest } from '../../../../../src/certification/session-management/application/complementary-certification-course-results-route.js';
import { juryOptions } from '../../../../../src/certification/shared/domain/models/ComplementaryCertificationCourseResult.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Certification | Session Management | Unit | Application | Routes | Complementary Certification Course Results', function () {
  let httpTestServer;

  describe('POST /api/admin/complementary-certification-course-results', function () {
    it('should exist', async function () {
      // given
      sinon
        .stub(complementaryCertificationCourseResultsController, 'saveJuryComplementaryCertificationCourseResult')
        .callsFake((request, h) => h.response('ok').code(200));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));

      httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
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

    it('return forbidden access if user has METIER role', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf');
      securityPreHandlers.hasAtLeastOneAccessOf
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

    [juryOptions.REJECTED, juryOptions.UNSET, 1].forEach((juryOption) =>
      it(`should accept juryLevel with value: ${juryOption}`, async function () {
        // given
        sinon.stub(complementaryCertificationCourseResultsController, 'saveJuryComplementaryCertificationCourseResult');
        complementaryCertificationCourseResultsController.saveJuryComplementaryCertificationCourseResult.resolves();
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf');
        securityPreHandlers.hasAtLeastOneAccessOf
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
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf');
        securityPreHandlers.hasAtLeastOneAccessOf
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
