import {
  expect,
  knex,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../../test-helper.js';

import { createServer } from '../../../../../server.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';

describe('Acceptance | Controller | assessment-results-controller', function () {
  let server;

  describe('POST /api/admin/certification-courses/{certificationCourseId}/assessment-results', function () {
    let certificationCourseId;
    let options;

    beforeEach(async function () {
      certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
      const assessmentId = databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourseId,
        type: Assessment.types.CERTIFICATION,
      }).id;
      const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
      }).id;
      databaseBuilder.factory.buildCompetenceMark({ assessmentResultId });

      server = await createServer();

      options = {
        method: 'POST',
        url: `/api/admin/certification-courses/${certificationCourseId}/assessment-results`,
        headers: { authorization: generateValidRequestAuthorizationHeader() },
        payload: {
          data: {
            type: 'assessment-results',
            attributes: {
              'assessment-id': assessmentId,
              'pix-score': 27,
              status: 'validated',
              emitter: 'Jury',
              'comment-for-jury': 'Parce que',
              'comment-for-candidate': 'Voilà',
              'comment-for-organization': 'Je suis sûr que vous etes ok avec nous',
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

    it('should return a 204 after saving in database', async function () {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should save an assessment-results and 1 mark', async function () {
      // when
      await server.inject(options);

      // then
      const assessmentResults = await knex('assessment-results').orderBy('createdAt', 'desc');
      expect(assessmentResults).to.have.lengthOf(2);
      const competenceMarks = await knex('competence-marks').where({ assessmentResultId: assessmentResults[0].id });
      expect(competenceMarks).to.have.lengthOf(1);
    });
  });
});
