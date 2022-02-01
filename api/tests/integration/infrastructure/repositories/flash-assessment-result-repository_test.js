const { expect, knex, databaseBuilder } = require('../../../test-helper');
const flashAssessmentResultRepository = require('../../../../lib/infrastructure/repositories/flash-assessment-result-repository');

describe('Integration | Infrastructure | Repository | FlashAssessmentResultRepository', function () {
  describe('#updateEstimatedLevelAndErrorRate', function () {
    let assessmentWithoutResultId;
    let assessmentWithResultId;

    beforeEach(async function () {
      assessmentWithoutResultId = databaseBuilder.factory.buildAssessment({ method: 'FLASH' }).id;
      assessmentWithResultId = databaseBuilder.factory.buildFlashAssessmentResult().assessmentId;
      await databaseBuilder.commit();
    });

    afterEach(async function () {
      await knex('flash-assessment-results').delete();
    });

    context("if a result doesn't already exist for assessment", function () {
      it('should create a result with estimated level and error rate', async function () {
        // given
        const assessmentId = assessmentWithoutResultId;

        // when
        await flashAssessmentResultRepository.updateEstimatedLevelAndErrorRate({
          assessmentId,
          estimatedLevel: 1.9,
          errorRate: 1.3,
        });

        // then
        const createdResult = await knex('flash-assessment-results').select().where({ assessmentId }).first();
        expect(createdResult.estimatedLevel).to.equal(1.9);
        expect(createdResult.errorRate).to.equal(1.3);
      });
    });

    context('if a result already exists for assessment', function () {
      it("should update the result's estimated level and error rate", async function () {
        // given
        const assessmentId = assessmentWithResultId;

        // when
        await flashAssessmentResultRepository.updateEstimatedLevelAndErrorRate({
          assessmentId,
          estimatedLevel: -2.8,
          errorRate: 0.44,
        });

        // then
        const updatedResult = await knex('flash-assessment-results').select().where({ assessmentId }).first();
        expect(updatedResult.estimatedLevel).to.equal(-2.8);
        expect(updatedResult.errorRate).to.equal(0.44);
      });
    });
  });
});
