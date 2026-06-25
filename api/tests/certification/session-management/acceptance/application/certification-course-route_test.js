import { createServer } from '../../../../../server.js';
import { PIX_PLUS_EDU_EXTERNAL_LEVELS } from '../../../../../src/certification/shared/domain/constants/mesh-configuration.js';
import { AlgorithmEngineVersion } from '../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../../src/certification/shared/domain/models/Frameworks.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';
import { createSuccessfulCertificationCourse } from '../../../shared/fixtures/certification-course.js';

describe('Certification | Session Management | Acceptance | Application | Routes | Certification Course', function () {
  describe('PATCH /api/admin/certification-courses/{certificationCourseId}', function () {
    context('when the user does not have role super admin', function () {
      it('should return 403 HTTP status code', async function () {
        // given
        const server = await createServer();

        const options = {
          headers: generateAuthenticatedUserRequestHeaders(),
          method: 'PATCH',
          url: '/api/admin/certification-courses/1',
          payload: {
            data: {},
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when the user does have role super admin', function () {
      let options;
      let certificationCourseId;
      let server;

      beforeEach(async function () {
        server = await createServer();
        const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();

        const versionId = databaseBuilder.factory.buildCertificationVersion({
          scope: 'CORE',
          startDate: new Date('2019-01-01'),
          expirationDate: null,
          challengesConfiguration: {
            maximumAssessmentLength: 10,
            defaultCandidateCapacity: -3,
          },
        }).id;

        databaseBuilder.factory.buildCertificationCpfCountry({
          code: '99100',
          commonName: 'FRANCE',
          matcher: 'ACEFNR',
        });
        databaseBuilder.factory.buildCertificationCpfCity({
          name: 'CHATILLON EN MICHAILLE',
          INSEECode: '01091',
          isActualName: true,
        });
        const candidate = databaseBuilder.factory.buildCertificationCandidate();
        const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          verificationCode: 'ABCD123',
          createdAt: new Date('2019-12-21T15:44:38Z'),
          sex: 'F',
          candidate: candidate.id,
          versionId,
        });
        certificationCourseId = certificationCourse.id;

        databaseBuilder.factory.buildCoreSubscription({
          certificationCandidateId: candidate.id,
        });

        options = {
          headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
          method: 'PATCH',
          url: `/api/admin/certification-courses/${certificationCourseId}`,
          payload: {
            data: {
              type: 'certifications',
              id: certificationCourseId,
              attributes: {
                'first-name': 'Freezer',
                'last-name': 'The all mighty',
                birthplace: null,
                birthdate: '1989-10-24',
                'external-id': 'xenoverse2',
                sex: 'M',
                'birth-country': 'FRANCE',
                'birth-insee-code': '01091',
                'birth-postal-code': null,
              },
            },
          },
        };

        return databaseBuilder.commit();
      });

      it('should update the certification course', async function () {
        // when
        const response = await server.inject(options);

        // then
        const result = response.result.data;
        expect(result.attributes['first-name']).to.equal('Freezer');
        expect(result.attributes['last-name']).to.equal('The all mighty');
        expect(result.attributes['birthplace']).to.equal('CHATILLON EN MICHAILLE');
        expect(result.attributes['birthdate']).to.equal('1989-10-24');
        expect(result.attributes['sex']).to.equal('M');
        expect(result.attributes['birth-country']).to.equal('FRANCE');
        expect(result.attributes['birth-insee-code']).to.equal('01091');
        expect(result.attributes['birth-postal-code']).to.be.null;
        const { version, verificationCode } = await knex
          .select('version', 'verificationCode')
          .from('certification-courses')
          .where({ id: certificationCourseId })
          .first();
        expect(version).to.equal(2);
        expect(verificationCode).to.equal('ABCD123');
      });

      context('when birthdate is not a date', function () {
        it('should return a wrong format error', async function () {
          // given
          options.payload.data.attributes.birthdate = 'aaaaaaa';

          // when
          const error = await server.inject(options);

          // then
          expect(error.statusCode).to.be.equal(400);
        });
      });
    });
  });

  describe('PATCH /api/admin/certification-courses/{certificationCourseId}/reject', function () {
    describe('when certification is V2', function () {
      it('should create a new rejected AssessmentResult', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser.withRoleSuperAdmin().id;

        const session = databaseBuilder.factory.buildSession({
          finalizedAt: new Date('2018-12-01T01:02:03Z'),
        });

        const candidateId = databaseBuilder.factory.buildCertificationCandidate({
          sessionId: session.id,
          userId,
          reconciledAt: new Date('2020-01-01'),
        }).id;

        const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          sessionId: session.id,
          userId,
          candidateId,
        });

        const { assessment, assessmentResult } = await createSuccessfulCertificationCourse({
          candidateId,
          userId,
          certificationCourse,
        });

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: `/api/admin/certification-courses/${certificationCourse.id}/reject`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        });

        // then
        expect(response.statusCode).to.equal(204);
        const rejectedCertificationCourse = await knex('certification-courses').first();
        const assessmentResults = await knex('assessment-results')
          .where({
            assessmentId: assessment.id,
          })
          .orderBy('createdAt');

        expect(rejectedCertificationCourse.isRejectedForFraud).to.equal(true);
        expect(assessmentResults).to.have.lengthOf(2);
        expect(assessmentResults[0].id).to.deep.equal(assessmentResult.id);
        expect(assessmentResults[1].status).to.equal('rejected');

        const lastAssessmentResult = await knex('certification-courses-last-assessment-results').first();

        expect(lastAssessmentResult).to.deep.equal({
          certificationCourseId: certificationCourse.id,
          lastAssessmentResultId: assessmentResults[1].id,
        });
      });
    });

    describe('when certification is V3', function () {
      it('should create a new rejected AssessmentResult', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser.withRoleSuperAdmin().id;

        const session = databaseBuilder.factory.buildSession({
          finalizedAt: new Date('2018-12-01T01:02:03Z'),
          version: 3,
        });

        const versionId = databaseBuilder.factory.buildCertificationVersion({
          startDate: new Date('2018-12-01T01:02:03Z'),
          competencesScoringConfiguration: [
            {
              competence: '1.1',
              competenceId: 'competenceId',
              values: [{ bounds: { max: Number.MAX_SAFE_INTEGER, min: Number.MIN_SAFE_INTEGER }, competenceLevel: 0 }],
            },
          ],
        }).id;

        const candidateId = databaseBuilder.factory.buildCertificationCandidate({
          sessionId: session.id,
          userId,
          reconciledAt: new Date('2020-01-01'),
        }).id;
        const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          sessionId: session.id,
          userId,
          version: 3,
          candidateId,
          versionId,
        });

        const { assessment, assessmentResult } = await createSuccessfulCertificationCourse({
          candidateId,
          userId,
          certificationCourse,
        });

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: `/api/admin/certification-courses/${certificationCourse.id}/reject`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        });

        // then
        expect(response.statusCode).to.equal(204);
        const rejectedCertificationCourse = await knex('certification-courses').first();
        const assessmentResults = await knex('assessment-results')
          .where({
            assessmentId: assessment.id,
          })
          .orderBy('createdAt');

        expect(rejectedCertificationCourse.isRejectedForFraud).to.equal(true);
        expect(assessmentResults).to.have.lengthOf(2);
        expect(assessmentResults[0].id).to.equal(assessmentResult.id);
        expect(assessmentResults[1].status).to.equal('rejected');

        const lastAssessmentResult = await knex('certification-courses-last-assessment-results').first();

        expect(lastAssessmentResult).to.deep.equal({
          certificationCourseId: certificationCourse.id,
          lastAssessmentResultId: assessmentResults[1].id,
        });
      });
    });
  });

  describe('PATCH /api/admin/certification-courses/{certificationCourseId}/unreject', function () {
    it('should create a new unrejected AssessmentResult', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser.withRoleSuperAdmin().id;
      const versionId = databaseBuilder.factory.buildCertificationVersion({
        minimumAnswersRequiredToValidateACertification: 1,
        competencesScoringConfiguration: [
          {
            competence: '1.1',
            competenceId: 'competenceId',
            values: [{ bounds: { max: Number.MAX_SAFE_INTEGER, min: Number.MIN_SAFE_INTEGER }, competenceLevel: 0 }],
          },
        ],
      }).id;
      const session = databaseBuilder.factory.buildSession({
        finalizedAt: new Date('2018-12-01T01:02:03Z'),
        version: AlgorithmEngineVersion.V3,
      });

      const candidateId = databaseBuilder.factory.buildCertificationCandidate({
        sessionId: session.id,
        userId,
        reconciledAt: new Date('2020-01-01'),
      }).id;
      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        sessionId: session.id,
        userId,
        isRejectedForFraud: true,
        version: AlgorithmEngineVersion.V3,
        candidateId,
        versionId,
      });

      const { assessment, assessmentResult } = await createSuccessfulCertificationCourse({
        candidateId,
        userId,
        certificationCourse,
      });

      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'PATCH',
        url: `/api/admin/certification-courses/${certificationCourse.id}/unreject`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      });

      // then
      expect(response.statusCode).to.equal(204);
      const unrejectedCertificationCourse = await knex('certification-courses').first();
      const assessmentResults = await knex('assessment-results')
        .where({
          assessmentId: assessment.id,
        })
        .orderBy('createdAt');

      expect(unrejectedCertificationCourse.isRejectedForFraud).to.equal(false);
      expect(assessmentResults).to.have.lengthOf(2);
      expect(assessmentResults[0].id).to.equal(assessmentResult.id);
      expect(assessmentResults[1].status).to.equal('validated');

      const lastAssessmentResult = await knex('certification-courses-last-assessment-results').first();

      expect(lastAssessmentResult).to.deep.equal({
        certificationCourseId: certificationCourse.id,
        lastAssessmentResultId: assessmentResults[1].id,
      });
    });
  });

  describe('POST /api/admin/certification-courses/{certificationCourseId}/assessment-results', function () {
    let certificationCourseId;
    let options;
    let server;

    beforeEach(async function () {
      certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
      const assessmentId = databaseBuilder.factory.buildAssessment({
        id: 567,
        certificationCourseId: certificationCourseId,
        type: Assessment.types.CERTIFICATION,
      }).id;
      const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
      }).id;
      databaseBuilder.factory.buildCompetenceMark({ assessmentResultId });
      databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
        certificationCourseId,
        lastAssessmentResultId: assessmentResultId,
      });
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      await databaseBuilder.commit();

      server = await createServer();

      options = {
        method: 'POST',
        url: `/api/admin/certification-courses/${certificationCourseId}/assessment-results`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        payload: {
          data: {
            attributes: {
              'comment-by-jury': 'Parce que voilà',
            },
          },
        },
      };
    });

    it('should respond with a 403 - forbidden access - if user has not role Super Admin', async function () {
      // given
      const nonSuperAdminUserId = 9999;
      options.headers = generateAuthenticatedUserRequestHeaders({ userId: nonSuperAdminUserId });

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('should save a new assessment result and one mark and return a 204', async function () {
      // when
      const response = await server.inject(options);

      // then
      const assessmentResults = await knex('assessment-results').orderBy('createdAt', 'desc');
      expect(assessmentResults).to.have.lengthOf(2);
      const competenceMarks = await knex('competence-marks').where({ assessmentResultId: assessmentResults[0].id });
      expect(competenceMarks).to.have.lengthOf(1);
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('GET /api/admin/certification-courses-v3/{certificationCourseId}/details', function () {
    let certificationCourse;
    let certificationChallenges;
    let assessmentResult;
    let options;
    let server;

    beforeEach(async function () {
      const versionId = databaseBuilder.factory.buildCertificationVersion({
        scope: 'CORE',
        startDate: new Date('2020-01-01'),
        expirationDate: null,
        challengesConfiguration: domainBuilder.buildFlashAlgorithmConfiguration({
          maximumAssessmentLength: 10,
          defaultCandidateCapacity: -3,
        }),
      }).id;

      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const session = databaseBuilder.factory.buildSession();
      const candidateId = databaseBuilder.factory.buildCertificationCandidate({
        sessionId: session.id,
        userId: superAdmin.id,
        reconciledAt: new Date('2020-01-01'),
      }).id;
      certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        version: 3,
        sessionId: session.id,
        userId: superAdmin.id,
        candidateId,
        versionId,
      });
      ({ certificationChallenges, assessmentResult } = await createSuccessfulCertificationCourse({
        candidateId,
        userId: superAdmin.id,
        certificationCourse,
      }));
      await databaseBuilder.commit();

      server = await createServer();

      options = {
        method: 'GET',
        url: `/api/admin/certification-courses-v3/${certificationCourse.id}/details`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };
    });

    it('should respond with a 403 - forbidden access - if user is not an admin member', async function () {
      // given
      const nonAdminMemberUserId = 9999;
      options.headers = generateAuthenticatedUserRequestHeaders({ userId: nonAdminMemberUserId });

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('should return a v3 certification details for administration payload', async function () {
      // when
      const response = await server.inject(options);

      const expectedResponse = {
        type: 'v3-certification-course-details-for-administrations',
        attributes: {
          'abort-reason': null,
          'certification-course-id': certificationCourse.id,
          'last-answer-at': certificationCourse.lastAnswerAt,
          'created-at': certificationCourse.createdAt,
          'is-rejected-for-fraud': false,
          'pix-score': assessmentResult.pixScore,
          'reached-result-key': 'CORE.BELOW_MINIMUM',
          'number-of-challenges': 10,
          'assessment-state': 'completed',
          'assessment-result-status': 'validated',
          'certification-framework': Frameworks.CORE,
        },
        id: certificationCourse.id.toString(),
        relationships: {
          'certification-challenges-for-administration': {
            data: [
              {
                id: certificationChallenges[0].challengeId,
                type: 'certification-challenges-for-administration',
              },
            ],
          },
        },
      };

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal(expectedResponse);
      expect(response.result.included).to.deep.equal([
        {
          attributes: {
            'answer-status': 'ok',
            'answered-at': new Date('2020-01-01'),
            'answer-value': '1',
            'competence-index': '1.1',
            'competence-name': 'Fabriquer un meuble',
            'skill-name': '@sau3',
            'validated-live-alert': null,
          },
          id: 'recCHAL1',
          type: 'certification-challenges-for-administration',
        },
      ]);
    });
  });

  describe('POST /api/admin/certification-courses/{certificationCourseId}/edu-v3-external-jury-result', function () {
    let certificationCourseFromDB;
    let assessmentResultFromDB;
    let options;
    let server;

    beforeEach(async function () {
      certificationCourseFromDB = databaseBuilder.factory.buildCertificationCourse({
        isPublished: true,
        framework: Frameworks.EDU_1ER_DEGRE,
        version: AlgorithmEngineVersion.V3,
        birthINSEECode: '12345',
      });
      assessmentResultFromDB = databaseBuilder.factory.buildAssessmentResult.last({
        certificationCourseId: certificationCourseFromDB.id,
        reachedMeshIndex: 0,
        eduV3ExternalJuryResult: null,
        commentByJury: null,
      });

      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      await databaseBuilder.commit();

      server = await createServer();

      options = {
        method: 'POST',
        url: `/api/admin/certification-courses/${certificationCourseFromDB.id}/edu-v3-external-jury-result`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        payload: {
          data: {
            attributes: {
              'edu-v3-external-jury-result': PIX_PLUS_EDU_EXTERNAL_LEVELS.ADVANCED,
            },
          },
        },
      };
    });

    it('should save edu v3 external jury result in database and return the refreshed certification', async function () {
      // when
      const response = await server.inject(options);

      // then
      const assessmentResults = await knex('assessment-results').orderBy('createdAt', 'desc');
      expect(assessmentResults).to.have.lengthOf(1);
      expect(assessmentResults[0].eduV3ExternalJuryResult).to.equal(PIX_PLUS_EDU_EXTERNAL_LEVELS.ADVANCED);
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.type).to.equal('certifications');
      expect(response.result.data.id).to.equal(certificationCourseFromDB.id.toString());
      expect(response.result.data.attributes).to.deep.equal({
        'first-name': certificationCourseFromDB.firstName,
        'last-name': certificationCourseFromDB.lastName,
        sex: certificationCourseFromDB.sex,
        'birth-country': certificationCourseFromDB.birthCountry,
        'birth-insee-code': certificationCourseFromDB.birthINSEECode,
        'birth-postal-code': certificationCourseFromDB.birthPostalCode,
        birthdate: certificationCourseFromDB.birthdate,
        birthplace: certificationCourseFromDB.birthplace,
        'created-at': certificationCourseFromDB.createdAt,
        'user-id': certificationCourseFromDB.userId,
        'session-id': certificationCourseFromDB.sessionId,
        version: certificationCourseFromDB.version,
        'certification-framework': certificationCourseFromDB.framework,
        'last-answer-at': certificationCourseFromDB.lastAnswerAt,
        'is-published': certificationCourseFromDB.isPublished,
        'assessment-id': assessmentResultFromDB.assessmentId,
        'is-rejected-for-fraud': certificationCourseFromDB.isRejectedForFraud,
        status: assessmentResultFromDB.status,
        'pix-score': assessmentResultFromDB.pixScore,
        'reached-result-key': Frameworks.EDU_1ER_DEGRE + '.' + PIX_PLUS_EDU_EXTERNAL_LEVELS.ADVANCED,
        'comment-by-jury': assessmentResultFromDB.commentByJury,
        'comment-for-candidate': assessmentResultFromDB.commentForCandidate,
        'comment-for-organization': assessmentResultFromDB.commentForOrganization,
        'jury-id': assessmentResultFromDB.juryId,
        'competences-with-mark': [],
      });
    });
  });
});
