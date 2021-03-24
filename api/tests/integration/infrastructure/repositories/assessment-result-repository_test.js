const { expect, knex, databaseBuilder, domainBuilder, catchErr } = require('../../../test-helper');

const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const assessmentResultRepository = require('../../../../lib/infrastructure/repositories/assessment-result-repository');
const { MissingAssessmentId, AssessmentResultNotCreatedError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | AssessmentResult', function() {

  describe('#save', function() {
    let assessmentResultToSave;
    let assessmentResult;

    describe('when entries are corrects', function() {

      afterEach(function() {
        return knex('assessment-results').where('id', assessmentResult.id).delete();
      });

      beforeEach(async function() {
        const juryId = databaseBuilder.factory.buildUser().id;
        const assessmentId = databaseBuilder.factory.buildAssessment().id;
        assessmentResultToSave = domainBuilder.buildAssessmentResult({ juryId, assessmentId });
        assessmentResultToSave.id = undefined;
        await databaseBuilder.commit();
      });

      it('should persist the assessment result in db', async function() {
        // when
        assessmentResult = await assessmentResultRepository.save(assessmentResultToSave);

        // then
        const assessmentResultSaved = await knex('assessment-results').where('id', assessmentResult.id);
        expect(assessmentResultSaved).to.have.lengthOf(1);
      });

      it('should return the saved assessment result', async function() {
        // when
        assessmentResult = await assessmentResultRepository.save(assessmentResultToSave);

        // then
        expect(assessmentResult).to.be.an.instanceOf(AssessmentResult);

        expect(assessmentResult).to.have.property('id').and.not.to.be.null;
      });
    });

    describe('when entries are incorrects', function() {

      beforeEach(async function() {
        const juryId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildAssessment().id;
        assessmentResultToSave = domainBuilder.buildAssessmentResult({ juryId });
        await databaseBuilder.commit();
      });

      it('should throw a MissingAssessmentId error if assessmentId is null or undefined', async function() {
        // when
        assessmentResultToSave.assessmentId = null;
        const result = await catchErr(assessmentResultRepository.save)(assessmentResultToSave);

        // then
        expect(result).to.be.instanceOf(MissingAssessmentId);
      });

      it('should throw an error in others cases', async function() {
        // when
        const result = await catchErr(assessmentResultRepository.save)({ assessmentId: 1 });

        // then
        expect(result).to.be.instanceOf(AssessmentResultNotCreatedError);
      });
    });

  });

  describe('#findLatestLevelAndPixScoreByAssessmentId', function() {

    let assessmentWithResultsId;
    let assessmentWithoutResultsId;
    const expectedAssessmentResultLevel = 3;
    const expectedAssessmentResultPixScore = 10;
    const expectedAssessmentResultWithinLimitDateLevel = 4;
    const expectedAssessmentResultWithinLimitDatePixScore = 20;

    beforeEach(function() {
      assessmentWithResultsId = databaseBuilder.factory.buildAssessment().id;
      assessmentWithoutResultsId = databaseBuilder.factory.buildAssessment().id;
      databaseBuilder.factory.buildAssessmentResult({ assessmentId: assessmentWithResultsId, createdAt: new Date('2019-02-01T00:00:00Z'), level: expectedAssessmentResultLevel, pixScore: expectedAssessmentResultPixScore }).id;
      databaseBuilder.factory.buildAssessmentResult({ assessmentId: assessmentWithResultsId, createdAt: new Date('2019-01-01T00:00:00Z'), level: expectedAssessmentResultWithinLimitDateLevel, pixScore: expectedAssessmentResultWithinLimitDatePixScore }).id;

      return databaseBuilder.commit();
    });

    it('should return the most recent assessment result level and pixScore when assessment has some', async function() {
      // when
      const { level, pixScore } = await assessmentResultRepository.findLatestLevelAndPixScoreByAssessmentId({ assessmentId: assessmentWithResultsId });

      // then
      expect(level).to.equal(expectedAssessmentResultLevel);
      expect(pixScore).to.equal(expectedAssessmentResultPixScore);
    });

    it('should return the most recent assessment result level and pixScore within limit date when assessment has some', async function() {
      // when
      const { level, pixScore } = await assessmentResultRepository.findLatestLevelAndPixScoreByAssessmentId({ assessmentId: assessmentWithResultsId, limitDate: new Date('2019-01-05T00:00:00Z') });

      // then
      expect(level).to.equal(expectedAssessmentResultWithinLimitDateLevel);
      expect(pixScore).to.equal(expectedAssessmentResultWithinLimitDatePixScore);
    });

    it('should return null when assessment has no results', async function() {
      // when
      const { level, pixScore } = await assessmentResultRepository.findLatestLevelAndPixScoreByAssessmentId({ assessmentId: assessmentWithoutResultsId });

      // then
      expect(level).to.equal(0);
      expect(pixScore).to.equal(0);
    });
  });

  describe('#findLatestByCertificationCourseIdWithCompetenceMarks', function() {

    let ccWithResultsId;
    let ccWithoutResultsId;
    let expectedAssessmentResultId;

    beforeEach(function() {
      ccWithResultsId = databaseBuilder.factory.buildCertificationCourse().id;
      ccWithoutResultsId = databaseBuilder.factory.buildCertificationCourse().id;
      const assessmentWithResultsId = databaseBuilder.factory.buildAssessment({ certificationCourseId: ccWithResultsId }).id;
      databaseBuilder.factory.buildAssessment({ certificationCourseId: ccWithoutResultsId }).id;
      expectedAssessmentResultId = databaseBuilder.factory.buildAssessmentResult({ assessmentId: assessmentWithResultsId, createdAt: new Date('2019-02-01T00:00:00Z') }).id;
      databaseBuilder.factory.buildCompetenceMark({ assessmentResultId: expectedAssessmentResultId });
      databaseBuilder.factory.buildCompetenceMark({ assessmentResultId: expectedAssessmentResultId });

      return databaseBuilder.commit();
    });

    it('should return the most recent assessment result when certification course has some', async function() {
      // when
      const mostRecentAssessmentResult = await assessmentResultRepository.findLatestByCertificationCourseIdWithCompetenceMarks({ certificationCourseId: ccWithResultsId });

      // then
      expect(mostRecentAssessmentResult).to.be.instanceOf(AssessmentResult);
      expect(mostRecentAssessmentResult.id).to.equal(expectedAssessmentResultId);
      expect(mostRecentAssessmentResult.competenceMarks).to.have.length(2);
    });

    it('should return null when certification course has no results', async function() {
      // when
      const mostRecentAssessmentResult = await assessmentResultRepository.findLatestByCertificationCourseIdWithCompetenceMarks({ certificationCourseId: ccWithoutResultsId });

      // then
      expect(mostRecentAssessmentResult).to.be.null;
    });
  });
});
