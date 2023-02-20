import { expect, knex, databaseBuilder } from '../../../test-helper';
import flashAssessmentResultRepository from '../../../../lib/infrastructure/repositories/flash-assessment-result-repository';

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

    context('when assessment has no assessment results yet', function () {
      it('should return undefined', async function () {
        // when
        const result = await flashAssessmentResultRepository.getLatestByAssessmentId(assessmentId);

        // then
        expect(result).to.be.undefined;
      });
    });

    context('when assessment has several assessment results', function () {
      let expectedResult;

      beforeEach(async function () {
        expectedResult = databaseBuilder.factory.buildFlashAssessmentResult({
          id: 125,
          estimatedLevel: 1,
          errorRate: 2,
          assessmentId,
        });
        databaseBuilder.factory.buildFlashAssessmentResult({
          id: 124,
          estimatedLevel: 3,
          errorRate: 4,
          assessmentId,
        });
        databaseBuilder.factory.buildFlashAssessmentResult({
          id: 123,
          estimatedLevel: 5,
          errorRate: 6,
          assessmentId,
        });
        await databaseBuilder.commit();
      });

      it('should return the latest flash result', async function () {
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
    it('should create a result with estimated level and error rate', async function () {
      // given
      const answerId = databaseBuilder.factory.buildAnswer().id;
      databaseBuilder.factory.buildAssessment({ id: 99 });
      await databaseBuilder.commit();

      // when
      await flashAssessmentResultRepository.save({
        answerId,
        estimatedLevel: 1.9,
        errorRate: 1.3,
        assessmentId: 99,
      });

      // then
      const createdResult = await knex('flash-assessment-results').select().where({ answerId }).first();
      expect(createdResult).to.contain({
        answerId,
        estimatedLevel: 1.9,
        errorRate: 1.3,
        assessmentId: 99,
      });
    });
  });
});
