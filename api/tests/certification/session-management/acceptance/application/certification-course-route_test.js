import { Assessment } from '../../../../../src/shared/domain/models/index.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  knex,
} from '../../../../test-helper.js';
import { createSuccessfulCertificationCourse } from '../../../shared/fixtures/certification-course.js';

describe('Certification | Session Management | Unit | Application | Routes | Certification Course', function () {
  describe('PATCH /api/admin/certification-courses/{certificationCourseId}', function () {
    context('when the user does not have role super admin', function () {
      it('should return 403 HTTP status code', async function () {
        // given
        const server = await createServer();

        const options = {
          headers: { authorization: generateValidRequestAuthorizationHeader() },
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
        await insertUserWithRoleSuperAdmin();
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
        certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          verificationCode: 'ABCD123',
          createdAt: new Date('2019-12-21T15:44:38Z'),
          completedAt: new Date('2017-12-21T15:48:38Z'),
          sex: 'F',
        }).id;

        options = {
          headers: { authorization: generateValidRequestAuthorizationHeader() },
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

  describe('POST /api/admin/certification-courses/{id}/reject', function () {
    describe('when certification is V2', function () {
      it('should create a new rejected AssessmentResult', async function () {
        // given
        const userId = (await insertUserWithRoleSuperAdmin()).id;

        const session = databaseBuilder.factory.buildSession({
          publishedAt: new Date('2018-12-01T01:02:03Z'),
        });

        const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          sessionId: session.id,
          userId,
        });

        const { assessment, assessmentResult } = await createSuccessfulCertificationCourse({
          userId,
          certificationCourse,
        });

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: `/api/admin/certification-courses/${certificationCourse.id}/reject`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        });

        // then
        expect(response.statusCode).to.equal(200);
        const rejectedCertificationCourse = await knex('certification-courses').first();
        const assessmentResults = await knex('assessment-results')
          .where({
            assessmentId: assessment.id,
          })
          .orderBy('createdAt');

        expect(rejectedCertificationCourse.isRejectedForFraud).to.equal(true);
        expect(assessmentResults).to.have.length(2);
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
        const userId = (await insertUserWithRoleSuperAdmin()).id;

        databaseBuilder.factory.buildFlashAlgorithmConfiguration();

        databaseBuilder.factory.buildScoringConfiguration({
          createdByUserId: userId,
        });

        const session = databaseBuilder.factory.buildSession({
          publishedAt: new Date('2018-12-01T01:02:03Z'),
          version: 3,
        });

        const configuration = [
          {
            competence: '1.1',
            values: [
              {
                bounds: {
                  max: -2.2,
                  min: -9.8,
                },
                competenceLevel: 0,
              },
            ],
          },
        ];

        databaseBuilder.factory.buildCompetenceScoringConfiguration({
          configuration,
          createdAt: new Date('2018-01-01T08:00:00Z'),
          createdByUserId: userId,
        });

        const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          sessionId: session.id,
          userId,
          version: 3,
        });

        const { assessment, assessmentResult } = await createSuccessfulCertificationCourse({
          userId,
          certificationCourse,
        });

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: `/api/admin/certification-courses/${certificationCourse.id}/reject`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        });

        // then
        expect(response.statusCode).to.equal(200);
        const rejectedCertificationCourse = await knex('certification-courses').first();
        const assessmentResults = await knex('assessment-results')
          .where({
            assessmentId: assessment.id,
          })
          .orderBy('createdAt');

        expect(rejectedCertificationCourse.isRejectedForFraud).to.equal(true);
        expect(assessmentResults).to.have.length(2);
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

  describe('POST /api/admin/certification-courses/{id}/unreject', function () {
    it('should create a new unrejected AssessmentResult', async function () {
      // given
      const userId = (await insertUserWithRoleSuperAdmin()).id;

      const session = databaseBuilder.factory.buildSession({
        publishedAt: new Date('2018-12-01T01:02:03Z'),
      });

      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        sessionId: session.id,
        userId,
        isRejectedForFraud: true,
      });

      const { assessment, assessmentResult } = await createSuccessfulCertificationCourse({
        userId,
        certificationCourse,
      });

      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/admin/certification-courses/${certificationCourse.id}/unreject`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      });

      // then
      expect(response.statusCode).to.equal(200);
      const unrejectedCertificationCourse = await knex('certification-courses').first();
      const assessmentResults = await knex('assessment-results')
        .where({
          assessmentId: assessment.id,
        })
        .orderBy('createdAt');

      expect(unrejectedCertificationCourse.isRejectedForFraud).to.equal(false);
      expect(assessmentResults).to.have.length(2);
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

      server = await createServer();

      options = {
        method: 'POST',
        url: `/api/admin/certification-courses/${certificationCourseId}/assessment-results`,
        headers: { authorization: generateValidRequestAuthorizationHeader() },
        payload: {
          data: {
            attributes: {
              'comment-by-jury': 'Parce que voilà',
            },
          },
        },
      };
      return insertUserWithRoleSuperAdmin();
    });

    it('should respond with a 403 - forbidden access - if user has not role Super Admin', async function () {
      // given
      const nonSuperAdminUserId = 9999;
      options.headers.authorization = generateValidRequestAuthorizationHeader(nonSuperAdminUserId);

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

  describe('POST /api/admin/certification-courses-v3/{certificationCourseId}/details', function () {
    let certificationCourse;
    let certificationChallenges;
    let assessmentResult;
    let options;
    let server;

    beforeEach(async function () {
      certificationCourse = databaseBuilder.factory.buildCertificationCourse({ version: 3 });
      databaseBuilder.factory.buildFlashAlgorithmConfiguration({
        maximumAssessmentLength: 10,
        createdAt: new Date('2020-01-01'),
      });

      const user = await insertUserWithRoleSuperAdmin();
      ({ certificationChallenges, assessmentResult } = await createSuccessfulCertificationCourse({
        userId: user.id,
        certificationCourse,
      }));
      await databaseBuilder.commit();

      server = await createServer();

      options = {
        method: 'GET',
        url: `/api/admin/certification-courses-v3/${certificationCourse.id}/details`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };
    });

    it('should respond with a 403 - forbidden access - if user is not an admin member', async function () {
      // given
      const nonAdminMemberUserId = 9999;
      options.headers.authorization = generateValidRequestAuthorizationHeader(nonAdminMemberUserId);

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
          'completed-at': certificationCourse.completedAt,
          'created-at': certificationCourse.createdAt,
          'ended-at': null,
          'is-rejected-for-fraud': false,
          'is-cancelled': false,
          'pix-score': assessmentResult.pixScore,
          'number-of-challenges': 10,
          'assessment-state': 'completed',
          'assessment-result-status': 'validated',
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
});
