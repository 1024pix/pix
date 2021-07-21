const { expect, knex, databaseBuilder, domainBuilder } = require('../../../test-helper');

const AssessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository-trx');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Integration | Infrastructure | Repositories | assessment-repository', function() {
  let assessmentRepository;
  beforeEach(function() {
    assessmentRepository = new AssessmentRepository(knex);
  });

  describe('#save', function() {
    let userId;
    let certificationCourseId;
    let assessmentToBeSaved;

    beforeEach(function() {
      userId = databaseBuilder.factory.buildUser().id;
      certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ userId }).id;

      assessmentToBeSaved = domainBuilder.buildAssessment({
        userId,
        courseId: certificationCourseId,
        type: Assessment.types.CERTIFICATION,
        state: Assessment.states.COMPLETED,
      });

      return databaseBuilder.commit();
    });

    afterEach(function() {
      knex('assessment-results').delete();
      return knex('assessments').delete();
    });

    it('should save new assessment if not already existing', async function() {
      // when
      await assessmentRepository.save({ assessment: assessmentToBeSaved });

      // then
      const assessmentsInDb = await knex('assessments').where({ userId }).first();
      expect(parseInt(assessmentsInDb.userId)).to.equal(userId);
      expect(parseInt(assessmentsInDb.courseId)).to.equal(certificationCourseId);
      expect(assessmentsInDb.type).to.equal(Assessment.types.CERTIFICATION);
      expect(assessmentsInDb.state).to.equal(Assessment.states.COMPLETED);
    });
  });
});
