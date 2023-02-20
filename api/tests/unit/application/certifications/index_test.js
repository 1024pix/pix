import { sinon, expect, HttpTestServer } from '../../../test-helper';
import securityPreHandlers from '../../../../lib/application/security-pre-handlers';
import certificationController from '../../../../lib/application/certifications/certification-controller';
import moduleUnderTest from '../../../../lib/application/certifications';

describe('Unit | Application | Certification | Routes', function () {
  context('POST /api/admin/certification/neutralize-challenge', function () {
    it('return forbidden access if user has METIER role', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
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
              .takeover()
        );

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/admin/certification/neutralize-challenge', {
        data: {
          attributes: {
            certificationCourseId: 1,
            challengeRecId: 'rec43mpMIR5dUzdjh',
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('checks that a valid certification-course id is given', async function () {
      // given
      sinon.stub(certificationController, 'neutralizeChallenge').returns('ok');
      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const payload = {
        data: {
          attributes: {
            certificationCourseId: 'invalide',
            challengeRecId: 'rec43mpMIR5dUzdjh',
          },
        },
      };

      // when
      const response = await httpTestServer.request('POST', '/api/admin/certification/neutralize-challenge', payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('checks that a challenge recId is given', async function () {
      // given
      sinon.stub(certificationController, 'neutralizeChallenge').returns('ok');
      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const payload = {
        data: {
          attributes: {
            certificationCourseId: 1,
            challengeRecId: null,
          },
        },
      };

      // when
      const response = await httpTestServer.request('POST', '/api/admin/certification/neutralize-challenge', payload);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  context('POST /api/admin/certification/deneutralize-challenge', function () {
    it('return forbidden access if user has METIER role', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
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
              .takeover()
        );

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/admin/certification/deneutralize-challenge', {
        data: {
          attributes: {
            certificationCourseId: 1,
            challengeRecId: 'rec43mpMIR5dUzdjh',
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('checks that a valid certification-course id is given', async function () {
      // given
      sinon.stub(certificationController, 'deneutralizeChallenge').returns('ok');
      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const payload = {
        data: {
          attributes: {
            certificationCourseId: 'invalide',
            challengeRecId: 'rec43mpMIR5dUzdjh',
          },
        },
      };

      // when
      const response = await httpTestServer.request('POST', '/api/admin/certification/deneutralize-challenge', payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('checks that a challenge recId is given', async function () {
      // given
      sinon.stub(certificationController, 'deneutralizeChallenge').returns('ok');
      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const payload = {
        data: {
          attributes: {
            certificationCourseId: 1,
            challengeRecId: null,
          },
        },
      };

      // when
      const response = await httpTestServer.request('POST', '/api/admin/certification/deneutralize-challenge', payload);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
