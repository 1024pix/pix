const { expect, knex, databaseBuilder, generateValidRequestAuthorizationHeader, insertUserWithRolePixMaster } = require('../../../test-helper');
const createServer = require('../../../../server');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');

const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Acceptance | Controller | assessment-results-controller', function() {
  let server;

  describe('POST /admin/assessment-results', () => {

    let certificationCourseId;
    let options;

    beforeEach(async () => {
      certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
      const assessmentId = databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourseId,
        type: Assessment.types.CERTIFICATION,
      }).id;
      server = await createServer();

      options = {
        method: 'POST', url: '/api/admin/assessment-results',
        headers: { authorization: generateValidRequestAuthorizationHeader() },
        payload: {
          data: {
            type: 'assessment-results',
            attributes: {
              'assessment-id': assessmentId,
              'certification-id': certificationCourseId,
              level: 3,
              'pix-score': 27,
              status: 'validated',
              emitter: 'Jury',
              'comment-for-jury': 'Parce que',
              'comment-for-candidate': 'Voilà',
              'comment-for-organization': 'Je suis sûr que vous etes ok avec nous',
              'competences-with-mark': [
                {
                  level: 2,
                  score: 18,
                  'area_code': 2,
                  'competence_code': 2.1,
                  'competence-id': '2.1',
                }, {
                  level: 3,
                  score: 27,
                  'area_code': 3,
                  'competence_code': 3.2,
                  'competence-id': '3.2',
                }, {
                  level: 1,
                  score: 9,
                  'area_code': 1,
                  'competence_code': 1.3,
                  'competence-id': '1.3',
                },
              ],
            },
          },
        },
      };
      return insertUserWithRolePixMaster();
    });

    afterEach(async () => {
      await cache.flushAll();

      await knex('authentication-methods').delete();
      await knex('competence-marks').delete();
      await knex('assessment-results').delete();
      await knex('assessments').delete();
      await knex('certification-courses').delete();
      await knex('users_pix_roles').delete();
      await knex('users').delete();
    });

    it('should respond with a 403 - forbidden access - if user has not role PIX_MASTER', async () => {
      // given
      const nonPixMAsterUserId = 9999;
      options.headers.authorization = generateValidRequestAuthorizationHeader(nonPixMAsterUserId);

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('should return a 204 after saving in database', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should save a assessment-results and 3 marks', async () => {
      // when
      await server.inject(options);

      // then
      const assessmentResults = await knex('assessment-results').select();
      const marks = await knex('competence-marks').select();

      expect(assessmentResults).to.have.lengthOf(1);
      expect(marks).to.have.lengthOf(3);
    });

    context('when assessment has already the assessment-result compute', () => {
      before(async () => {
        const results = await knex('assessment-results')
          .insert({
            level: -1,
            pixScore: 0,
            status: 'rejected',
            emitter: 'PIX-ALGO',
            commentForJury: 'Computed',
          }, 'id');

        const resultId = results[0];
        await knex('competence-marks')
          .insert({
            assessmentResultId: resultId,
            level: -1,
            score: 0,
            area_code: 2,
            competence_code: 2.1,
          });
      });

      it('should save a assessment-results and 3 marks', async () => {
        // when
        await server.inject(options);

        // then
        const assessmentResults = await knex('assessment-results').select();
        const marks = await knex('competence-marks').select();

        expect(assessmentResults).to.have.lengthOf(2);
        expect(marks).to.have.lengthOf(4);
      });
    });

    context('when the correction to be applied has a mistake', () => {

      it('should return a 422 error', async () => {
        const wrongScore = 9999999999;

        const options = {
          method: 'POST', url: '/api/admin/assessment-results',
          headers: { authorization: generateValidRequestAuthorizationHeader() },
          payload: {
            data: {
              type: 'assessment-results',
              attributes: {
                'assessment-id': 1,
                'certification-id': certificationCourseId,
                level: 3,
                'pix-score': 27,
                status: 'validated',
                emitter: 'Jury',
                'comment-for-jury': 'Parce que',
                'comment-for-candidate': 'Voilà',
                'comment-for-organization': 'Je suis sûr que vous etes ok avec nous',
                'competences-with-mark': [
                  {
                    level: 2,
                    score: 18,
                    'area_code': 2,
                    'competence_code': 2.1,
                  }, {
                    level: 3,
                    score: wrongScore,
                    'area_code': 3,
                    'competence_code': 3.2,
                  }, {
                    level: 1,
                    score: 218158186,
                    'area_code': 1,
                    'competence_code': 1.3,
                  },
                ],
              },
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(422);
        expect(response.result.errors[0]).to.deep.equal({
          'title': 'Unprocessable entity',
          'detail': 'ValidationError: "score" must be less than or equal to 64',
          'status': '422',
        });
      });
    });
  });
});
