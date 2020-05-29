const { expect, knex, databaseBuilder, domainBuilder } = require('../../../test-helper');

const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const assessmentResultRepository = require('../../../../lib/infrastructure/repositories/assessment-result-repository');

describe('Integration | Repository | AssessmentResult', function() {

  describe('#save', () => {
    let assessmentResultToSave;
    let assessmentResult;

    afterEach(() => {
      return knex('assessment-results').where('id', assessmentResult.id).delete();
    });

    beforeEach(async () => {
      const juryId = databaseBuilder.factory.buildUser().id;
      const assessmentId = databaseBuilder.factory.buildAssessment().id;
      assessmentResultToSave = domainBuilder.buildAssessmentResult({ juryId, assessmentId });
      assessmentResultToSave.id = undefined;
      await databaseBuilder.commit();
    });

    it('should persist the assessment result in db', async () => {
      // when
      assessmentResult = await assessmentResultRepository.save(assessmentResultToSave);

      // then
      const result = await knex('assessment-results').where('id', assessmentResult.id);

      expect(result).to.have.lengthOf(1);
    });

    it('should return the saved assessment result', async () => {
      // when
      assessmentResult = await assessmentResultRepository.save(assessmentResultToSave);

      // then
      expect(assessmentResult).to.be.an.instanceOf(AssessmentResult);

      expect(assessmentResult).to.have.property('id').and.not.to.be.null;
    });
  });

  describe('#findLatestByAssessmentId', () => {

    let assessmentWithResultsId;
    let assessmentWithoutResultsId;
    let expectedAssessmentResultId;
    let expectedAssessmentResultWithinLimitDateId;

    beforeEach(() => {
      assessmentWithResultsId = databaseBuilder.factory.buildAssessment().id;
      assessmentWithoutResultsId = databaseBuilder.factory.buildAssessment().id;
      expectedAssessmentResultId = databaseBuilder.factory.buildAssessmentResult({ assessmentId: assessmentWithResultsId, createdAt: new Date('2019-02-01T00:00:00Z') }).id;
      expectedAssessmentResultWithinLimitDateId = databaseBuilder.factory.buildAssessmentResult({ assessmentId: assessmentWithResultsId, createdAt: new Date('2019-01-01T00:00:00Z') }).id;
      databaseBuilder.factory.buildCompetenceMark({ assessmentResultId: expectedAssessmentResultId });
      databaseBuilder.factory.buildCompetenceMark({ assessmentResultId: expectedAssessmentResultId });
      databaseBuilder.factory.buildCompetenceMark({ assessmentResultId: expectedAssessmentResultWithinLimitDateId });

      return databaseBuilder.commit();
    });

    it('should return the most recent assessment result when assessment has some', async () => {
      // when
      const mostRecentAssessmentResult = await assessmentResultRepository.findLatestByAssessmentId({ assessmentId: assessmentWithResultsId });

      // then
      expect(mostRecentAssessmentResult).to.be.instanceOf(AssessmentResult);
      expect(mostRecentAssessmentResult.id).to.equal(expectedAssessmentResultId);
      expect(mostRecentAssessmentResult.competenceMarks).to.have.length(2);
    });

    it('should return the most recent assessment result within limit date when assessment has some', async () => {
      // when
      const mostRecentAssessmentResult = await assessmentResultRepository.findLatestByAssessmentId({ assessmentId: assessmentWithResultsId, limitDate: new Date('2019-01-05T00:00:00Z') });

      // then
      expect(mostRecentAssessmentResult).to.be.instanceOf(AssessmentResult);
      expect(mostRecentAssessmentResult.id).to.equal(expectedAssessmentResultWithinLimitDateId);
      expect(mostRecentAssessmentResult.competenceMarks).to.have.length(1);
    });

    it('should return null when assessment has no results', async () => {
      // when
      const mostRecentAssessmentResult = await assessmentResultRepository.findLatestByAssessmentId({ assessmentId: assessmentWithoutResultsId });

      // then
      expect(mostRecentAssessmentResult).to.be.null;
    });
  });
});
