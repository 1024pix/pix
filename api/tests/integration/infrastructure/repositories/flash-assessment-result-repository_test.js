const { expect, knex, databaseBuilder } = require('../../../test-helper');
const flashAssessmentResultRepository = require('../../../../lib/infrastructure/repositories/flash-assessment-result-repository');

describe('Integration | Infrastructure | Repository | FlashAssessmentResultRepository', function () {
  afterEach(async function () {
    await knex('flash-assessment-results').delete();
  });

  describe('#getLatestByAssessmentId', function () {
    let assessmentId;

    beforeEach(async function () {
      assessmentId = databaseBuilder.factory.buildAssessment({ method: 'FLASH' }).id;
      await databaseBuilder.commit();
    });

    context('when assessment has no answers yet', function () {
      it('should return undefined', async function () {
        // when
        const result = await flashAssessmentResultRepository.getLatestByAssessmentId(assessmentId);

        // then
        expect(result).to.be.undefined;
      });
    });

    context('when assessment has one answer', function () {
      let expectedResult;

      beforeEach(async function () {
        expectedResult = databaseBuilder.factory.buildFlashAssessmentResult({ assessmentId });
        await databaseBuilder.commit();
      });

      it('should return flash result for this answer', async function () {
        // when
        const result = await flashAssessmentResultRepository.getLatestByAssessmentId(assessmentId);

        // then
        expect(result).to.contain({
          id: expectedResult.id,
          estimatedLevel: expectedResult.estimatedLevel,
          errorRate: expectedResult.errorRate,
        });
      });
    });

    context('when assessment has several answers', function () {
      let expectedResult;

      beforeEach(async function () {
        const thirdAnswer = databaseBuilder.factory.buildAnswer({ assessmentId, createdAt: new Date('2022-01-03') });
        const secondAnswer = databaseBuilder.factory.buildAnswer({ assessmentId, createdAt: new Date('2022-01-02') });
        const firstAnswer = databaseBuilder.factory.buildAnswer({ assessmentId, createdAt: new Date('2022-01-01') });
        expectedResult = databaseBuilder.factory.buildFlashAssessmentResult({
          answerId: thirdAnswer.id,
          estimatedLevel: 1,
          errorRate: 2,
        });
        databaseBuilder.factory.buildFlashAssessmentResult({
          answerId: secondAnswer.id,
          estimatedLevel: 3,
          errorRate: 4,
        });
        databaseBuilder.factory.buildFlashAssessmentResult({
          answerId: firstAnswer.id,
          estimatedLevel: 5,
          errorRate: 6,
        });
        await databaseBuilder.commit();
      });

      it('should return flash result for the latest answer', async function () {
        // when
        const result = await flashAssessmentResultRepository.getLatestByAssessmentId(assessmentId);

        // then
        expect(result).to.contain({
          id: expectedResult.id,
          estimatedLevel: expectedResult.estimatedLevel,
          errorRate: expectedResult.errorRate,
        });
      });
    });
  });

  describe('#save', function () {
    let answerId;

    beforeEach(async function () {
      answerId = databaseBuilder.factory.buildAnswer().id;
      await databaseBuilder.commit();
    });

    it('should create a result with estimated level and error rate', async function () {
      // when
      await flashAssessmentResultRepository.save({
        answerId,
        estimatedLevel: 1.9,
        errorRate: 1.3,
      });

      // then
      const createdResult = await knex('flash-assessment-results').select().where({ answerId }).first();
      expect(createdResult).to.contain({
        answerId,
        estimatedLevel: 1.9,
        errorRate: 1.3,
      });
    });
  });
});
