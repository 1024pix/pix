import { certificationVersionController } from '../../../../../src/certification/configuration/application/certification-version-controller.js';
import * as moduleUnderTest from '../../../../../src/certification/configuration/application/certification-version-route.js';
import { SCOPES } from '../../../../../src/certification/shared/domain/models/Scopes.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Certification | Configuration | Application | Router | certification-version-route', function () {
  describe('GET /api/admin/certification-versions/{scope}/active', function () {
    describe('when the user authenticated has no role', function () {
      it('should return 403 HTTP status code', async function () {
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        sinon.stub(certificationVersionController, 'getActiveVersionByScope').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const response = await httpTestServer.request('GET', '/api/admin/certification-versions/CORE/active');

        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(certificationVersionController.getActiveVersionByScope);
      });
    });

    describe('when the scope parameter is invalid', function () {
      it('should return 400 HTTP status code when scope is not a valid Framework', async function () {
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
        sinon.stub(certificationVersionController, 'getActiveVersionByScope').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const response = await httpTestServer.request('GET', '/api/admin/certification-versions/INVALID_SCOPE/active');

        expect(response.statusCode).to.equal(400);
        sinon.assert.notCalled(certificationVersionController.getActiveVersionByScope);
      });
    });
  });

  describe('PATCH /api/admin/certification-versions/{certificationVersionId}', function () {
    describe('when the user authenticated has no role', function () {
      it('should return 403 HTTP status code', async function () {
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        sinon.stub(certificationVersionController, 'updateCertificationVersion').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const response = await httpTestServer.request('PATCH', '/api/admin/certification-versions/123', {
          data: {
            id: '123',
            type: 'certification-versions',
            attributes: {
              scope: SCOPES.PIX_PLUS_DROIT,
              'start-date': '2024-01-01T00:00:00.000Z',
              'expiration-date': null,
              'assessment-duration': 120,
              'global-scoring-configuration': null,
              'competences-scoring-configuration': null,
              'challenges-configuration': {
                maximumAssessmentLength: 32,
                challengesBetweenSameCompetence: 0,
                defaultCandidateCapacity: -3,
                defaultProbabilityToPickChallenge: 51,
              },
            },
          },
        });

        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(certificationVersionController.updateCertificationVersion);
      });
    });

    describe('when the payload is invalid', function () {
      it('should return 400 HTTP status code when scope is invalid', async function () {
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
        sinon.stub(certificationVersionController, 'updateCertificationVersion').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const response = await httpTestServer.request('PATCH', '/api/admin/certification-versions/123', {
          data: {
            id: '123',
            type: 'certification-versions',
            attributes: {
              scope: 'INVALID_SCOPE',
              'start-date': '2024-01-01T00:00:00.000Z',
              'expiration-date': null,
              'assessment-duration': 120,
              'challenges-configuration': { maximumAssessmentLength: 32 },
            },
          },
        });

        expect(response.statusCode).to.equal(400);
        sinon.assert.notCalled(certificationVersionController.updateCertificationVersion);
      });

      it('should return 400 HTTP status code when assessmentDuration is negative', async function () {
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
        sinon.stub(certificationVersionController, 'updateCertificationVersion').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const response = await httpTestServer.request('PATCH', '/api/admin/certification-versions/123', {
          data: {
            id: '123',
            type: 'certification-versions',
            attributes: {
              scope: SCOPES.PIX_PLUS_DROIT,
              'start-date': '2024-01-01T00:00:00.000Z',
              'expiration-date': null,
              'assessment-duration': -10,
              'challenges-configuration': { maximumAssessmentLength: 32 },
            },
          },
        });

        expect(response.statusCode).to.equal(400);
        sinon.assert.notCalled(certificationVersionController.updateCertificationVersion);
      });

      it('should return 400 HTTP status code when challengesConfiguration is missing', async function () {
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
        sinon.stub(certificationVersionController, 'updateCertificationVersion').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const response = await httpTestServer.request('PATCH', '/api/admin/certification-versions/123', {
          data: {
            id: '123',
            type: 'certification-versions',
            attributes: {
              scope: SCOPES.PIX_PLUS_DROIT,
              'start-date': '2024-01-01T00:00:00.000Z',
              'expiration-date': null,
              'assessment-duration': 120,
            },
          },
        });

        expect(response.statusCode).to.equal(400);
        sinon.assert.notCalled(certificationVersionController.updateCertificationVersion);
      });

      it('should return 400 HTTP status code when the entity id is missing', async function () {
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
        sinon.stub(certificationVersionController, 'updateCertificationVersion').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const response = await httpTestServer.request('PATCH', '/api/admin/certification-versions/123', {
          data: {
            type: 'certification-versions',
            attributes: {
              scope: SCOPES.PIX_PLUS_DROIT,
              'start-date': '2024-01-01T00:00:00.000Z',
              'expiration-date': null,
              'assessment-duration': 120,
              'challenges-configuration': { maximumAssessmentLength: 32 },
            },
          },
        });

        expect(response.statusCode).to.equal(400);
        sinon.assert.notCalled(certificationVersionController.updateCertificationVersion);
      });

      it('should return 400 HTTP status code when the entity id from payload does not match URL parameter', async function () {
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
        sinon.stub(certificationVersionController, 'updateCertificationVersion').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const response = await httpTestServer.request('PATCH', '/api/admin/certification-versions/123', {
          data: {
            id: '456',
            type: 'certification-versions',
            attributes: {
              scope: SCOPES.PIX_PLUS_DROIT,
              'start-date': '2024-01-01T00:00:00.000Z',
              'expiration-date': null,
              'assessment-duration': 120,
              'challenges-configuration': { maximumAssessmentLength: 32 },
            },
          },
        });

        expect(response.statusCode).to.equal(400);
        sinon.assert.notCalled(certificationVersionController.updateCertificationVersion);
      });

      it('should return 400 HTTP status code when the entity type is invalid', async function () {
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
        sinon.stub(certificationVersionController, 'updateCertificationVersion').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const response = await httpTestServer.request('PATCH', '/api/admin/certification-versions/123', {
          data: {
            id: '123',
            type: 'invalid-type',
            attributes: {
              scope: SCOPES.PIX_PLUS_DROIT,
              'start-date': '2024-01-01T00:00:00.000Z',
              'expiration-date': null,
              'assessment-duration': 120,
              'challenges-configuration': { maximumAssessmentLength: 32 },
            },
          },
        });

        expect(response.statusCode).to.equal(400);
        sinon.assert.notCalled(certificationVersionController.updateCertificationVersion);
      });

      it('should return 400 HTTP status code when the entity type is missing', async function () {
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
        sinon.stub(certificationVersionController, 'updateCertificationVersion').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const response = await httpTestServer.request('PATCH', '/api/admin/certification-versions/123', {
          data: {
            id: '123',
            attributes: {
              scope: SCOPES.PIX_PLUS_DROIT,
              'start-date': '2024-01-01T00:00:00.000Z',
              'expiration-date': null,
              'assessment-duration': 120,
              'challenges-configuration': { maximumAssessmentLength: 32 },
            },
          },
        });

        expect(response.statusCode).to.equal(400);
        sinon.assert.notCalled(certificationVersionController.updateCertificationVersion);
      });

      it('should return 400 HTTP status code when the defaultCandidateCapacity is invalid', async function () {
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
        sinon.stub(certificationVersionController, 'updateCertificationVersion').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const response = await httpTestServer.request('PATCH', '/api/admin/certification-versions/123', {
          data: {
            id: 'certification-versions',
            attributes: {
              scope: SCOPES.PIX_PLUS_DROIT,
              'start-date': '2024-01-01T00:00:00.000Z',
              'expiration-date': null,
              'assessment-duration': 120,
              'challenges-configuration': { defaultCandidateCapacity: 'XXX' },
            },
          },
        });

        expect(response.statusCode).to.equal(400);
        sinon.assert.notCalled(certificationVersionController.updateCertificationVersion);
      });
    });
  });
});
