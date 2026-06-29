import { createServer } from '../../../../../server.js';
import { PIX_PLUS_EDU_EXTERNAL_LEVELS } from '../../../../../src/certification/shared/domain/constants/mesh-configuration.js';
import { AlgorithmEngineVersion } from '../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../../src/certification/shared/domain/models/Frameworks.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Controller | session-controller-get-jury-certification-summaries', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/admin/sessions/{id}/jury-certification-summaries', function () {
    let sessionId;

    beforeEach(function () {
      sessionId = databaseBuilder.factory.buildSession().id;

      return databaseBuilder.commit();
    });

    context('when user has not the role Super Admin', function () {
      let userId;

      beforeEach(function () {
        userId = databaseBuilder.factory.buildUser().id;
        return databaseBuilder.commit();
      });

      it('should return 403 HTTP status code', async function () {
        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/admin/sessions/${sessionId}/jury-certification-summaries`,
          payload: {},
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        });

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when user has role Super Admin', function () {
      it('should return the expected data', async function () {
        // given
        const superAdminId = databaseBuilder.factory.buildUser.withRole().id;
        sessionId = databaseBuilder.factory.buildSession().id;

        const certificationCourse1 = databaseBuilder.factory.buildCertificationCourse({
          sessionId,
          lastName: 'AAA',
          framework: Frameworks.CLEA,
        });
        const asr1 = databaseBuilder.factory.buildAssessmentResult.last({
          certificationCourseId: certificationCourse1.id,
          createdAt: new Date('2018-04-15T00:00:00Z'),
        });

        const certificationCourse2 = databaseBuilder.factory.buildCertificationCourse({
          sessionId,
          lastName: 'CCC',
          framework: Frameworks.CLEA,
        });
        databaseBuilder.factory.buildAssessment({ certificationCourseId: certificationCourse2.id });

        const certificationCourse3 = databaseBuilder.factory.buildCertificationCourse({
          sessionId,
          lastName: 'DDD',
          framework: Frameworks.EDU_1ER_DEGRE,
          version: AlgorithmEngineVersion.V3,
        });
        const assessmentId3 = databaseBuilder.factory.buildAssessment({
          certificationCourseId: certificationCourse2.id,
        }).id;
        const asr3 = databaseBuilder.factory.buildAssessmentResult.last({
          certificationCourseId: certificationCourse3.id,
          createdAt: new Date('2018-04-15T00:00:00Z'),
          reachedMeshIndex: 0,
          eduV3ExternalJuryResult: PIX_PLUS_EDU_EXTERNAL_LEVELS.EXPERT,
          assessmentId: assessmentId3,
        });

        await databaseBuilder.commit();

        const request = {
          method: 'GET',
          url: `/api/admin/sessions/${sessionId}/jury-certification-summaries`,
          payload: {},
          headers: generateAuthenticatedUserRequestHeaders({ userId: superAdminId }),
        };

        // when
        const response = await server.inject(request);

        // then
        const expectedJuryCertificationSummary1 = {
          'first-name': certificationCourse1.firstName,
          'last-name': certificationCourse1.lastName,
          status: asr1.status,
          'pix-score': asr1.pixScore,
          'algorithm-version': certificationCourse1.version,
          'reached-result-key': 'CLEA.NONE',
          'is-published': certificationCourse1.isPublished,
          'created-at': certificationCourse1.createdAt,
          'last-answer-at': certificationCourse1.lastAnswerAt,
          'number-of-certification-issue-reports': 0,
          'number-of-certification-issue-reports-with-required-action': 0,
          'examiner-comment': undefined,
          'is-flagged-aborted': false,
          'certification-framework': Frameworks.CLEA,
        };
        const expectedJuryCertificationSummary2 = {
          'first-name': certificationCourse2.firstName,
          'last-name': certificationCourse2.lastName,
          status: 'started',
          'pix-score': null,
          'algorithm-version': certificationCourse2.version,
          'reached-result-key': 'CLEA.NONE',
          'is-published': certificationCourse2.isPublished,
          'created-at': certificationCourse2.createdAt,
          'number-of-certification-issue-reports': 0,
          'number-of-certification-issue-reports-with-required-action': 0,
          'last-answer-at': certificationCourse2.lastAnswerAt,
          'examiner-comment': undefined,
          'is-flagged-aborted': false,
          'certification-framework': Frameworks.CLEA,
        };
        const expectedJuryCertificationSummary3 = {
          'first-name': certificationCourse3.firstName,
          'last-name': certificationCourse3.lastName,
          status: asr3.status,
          'pix-score': asr3.pixScore,
          'algorithm-version': certificationCourse3.version,
          'reached-result-key': 'EDU_1ER_DEGRE.EXPERT',
          'is-published': certificationCourse3.isPublished,
          'created-at': certificationCourse3.createdAt,
          'last-answer-at': certificationCourse3.lastAnswerAt,
          'number-of-certification-issue-reports': 0,
          'number-of-certification-issue-reports-with-required-action': 0,
          'examiner-comment': undefined,
          'is-flagged-aborted': false,
          'certification-framework': Frameworks.EDU_1ER_DEGRE,
        };

        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.deep.equal([
          {
            type: 'jury-certification-summaries',
            id: certificationCourse1.id.toString(),
            attributes: expectedJuryCertificationSummary1,
          },
          {
            type: 'jury-certification-summaries',
            id: certificationCourse2.id.toString(),
            attributes: expectedJuryCertificationSummary2,
          },
          {
            type: 'jury-certification-summaries',
            id: certificationCourse3.id.toString(),
            attributes: expectedJuryCertificationSummary3,
          },
        ]);
      });
    });
  });
});
