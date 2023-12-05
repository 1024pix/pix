import { databaseBuilder, domainBuilder, expect, knex } from '../../../../../test-helper.js';
import * as flashAlgorithmConfigurationRepository from '../../../../../../../api/src/certification/flash-certification/infrastructure/repositories/flash-algorithm-configuration-repository.js';
import { FlashAssessmentAlgorithmConfiguration } from '../../../../../../src/certification/flash-certification/domain/model/FlashAssessmentAlgorithmConfiguration.js';

describe('Integration | Infrastructure | Repository | FlashAlgorithmConfigurationRepository', function () {
  describe('#save', function () {
    it('should create a flash algorithm configuration', async function () {
      // given
      const flashAlgorithmConfiguration = domainBuilder.buildFlashAlgorithmConfiguration({
        warmUpLength: 1,
        maximumAssessmentLength: 2,
        challengesBetweenSameCompetence: 3,
        variationPercent: 4,
        variationPercentUntil: 3,
        doubleMeasuresUntil: 5,
        forcedCompetences: ['comp1', 'comp2'],
        minimumEstimatedSuccessRateRanges: [
          { type: 'fixed', startingChallengeIndex: 0, endingChallengeIndex: 7, value: 0.8 },
        ],
        limitToOneQuestionPerTube: true,
        enablePassageByAllCompetences: false,
      });

      // when
      await flashAlgorithmConfigurationRepository.save(flashAlgorithmConfiguration);

      // then
      const createdConfiguration = await knex('flash-algorithm-configurations').first();
      expect(createdConfiguration).to.deep.contains({
        warmUpLength: 1,
        forcedCompetences: ['comp1', 'comp2'],
        minimumEstimatedSuccessRateRanges: [
          { type: 'fixed', startingChallengeIndex: 0, endingChallengeIndex: 7, value: 0.8 },
        ],
        maximumAssessmentLength: 2,
        challengesBetweenSameCompetence: 3,
        limitToOneQuestionPerTube: true,
        enablePassageByAllCompetences: false,
        variationPercent: 4,
        variationPercentUntil: 3,
        doubleMeasuresUntil: 5,
      });
    });

    it('should create a flash algorithm configuration without forced competences', async function () {
      // given
      const flashAlgorithmConfiguration = domainBuilder.buildFlashAlgorithmConfiguration({
        warmUpLength: 1,
        maximumAssessmentLength: 2,
        challengesBetweenSameCompetence: 3,
        variationPercent: 4,
        variationPercentUntil: 3,
        doubleMeasuresUntil: 5,
        minimumEstimatedSuccessRateRanges: [
          { type: 'fixed', startingChallengeIndex: 0, endingChallengeIndex: 7, value: 0.8 },
        ],
        limitToOneQuestionPerTube: true,
        enablePassageByAllCompetences: false,
      });

      // when
      await flashAlgorithmConfigurationRepository.save(flashAlgorithmConfiguration);

      // then
      const createdConfiguration = await knex('flash-algorithm-configurations').first();
      expect(createdConfiguration).to.deep.contains({
        warmUpLength: 1,
        forcedCompetences: [],
        minimumEstimatedSuccessRateRanges: [
          { type: 'fixed', startingChallengeIndex: 0, endingChallengeIndex: 7, value: 0.8 },
        ],
        maximumAssessmentLength: 2,
        challengesBetweenSameCompetence: 3,
        limitToOneQuestionPerTube: true,
        enablePassageByAllCompetences: false,
        variationPercent: 4,
        variationPercentUntil: 3,
        doubleMeasuresUntil: 5,
      });
    });

    it('should create a flash algorithm configuration without minimum estimated success rate ranges', async function () {
      // given
      const flashAlgorithmConfiguration = domainBuilder.buildFlashAlgorithmConfiguration({
        warmUpLength: 1,
        maximumAssessmentLength: 2,
        challengesBetweenSameCompetence: 3,
        variationPercent: 4,
        variationPercentUntil: 3,
        doubleMeasuresUntil: 5,
        forcedCompetences: ['comp1', 'comp2'],
        limitToOneQuestionPerTube: true,
        enablePassageByAllCompetences: false,
      });

      // when
      await flashAlgorithmConfigurationRepository.save(flashAlgorithmConfiguration);

      // then
      const createdConfiguration = await knex('flash-algorithm-configurations').first();
      expect(createdConfiguration).to.deep.contains({
        warmUpLength: 1,
        forcedCompetences: ['comp1', 'comp2'],
        minimumEstimatedSuccessRateRanges: [],
        maximumAssessmentLength: 2,
        challengesBetweenSameCompetence: 3,
        limitToOneQuestionPerTube: true,
        enablePassageByAllCompetences: false,
        variationPercent: 4,
        variationPercentUntil: 3,
        doubleMeasuresUntil: 5,
      });
    });
  });

  describe('#get', function () {
    describe('when there is a saved configuration', function () {
      it('should return a flash algorithm configuration', async function () {
        // given
        const flashAlgorithmConfiguration = databaseBuilder.factory.buildFlashAlgorithmConfiguration({
          warmUpLength: 1,
          maximumAssessmentLength: 2,
          challengesBetweenSameCompetence: 3,
          variationPercent: 4,
          variationPercentUntil: 3,
          doubleMeasuresUntil: 5,
          forcedCompetences: ['comp1', 'comp2'],
          minimumEstimatedSuccessRateRanges: [
            { type: 'fixed', startingChallengeIndex: 0, endingChallengeIndex: 7, value: 0.8 },
          ],
          limitToOneQuestionPerTube: true,
          enablePassageByAllCompetences: false,
        });

        const expectedFlashAlgorithmConfiguration = domainBuilder.buildFlashAlgorithmConfiguration({
          ...flashAlgorithmConfiguration,
          forcedCompetences: JSON.parse(flashAlgorithmConfiguration.forcedCompetences),
          minimumEstimatedSuccessRateRanges: JSON.parse(flashAlgorithmConfiguration.minimumEstimatedSuccessRateRanges),
        });

        await databaseBuilder.commit();

        // when
        const configResult = await flashAlgorithmConfigurationRepository.get();

        // then
        expect(configResult.toDTO()).to.deep.equal(expectedFlashAlgorithmConfiguration.toDTO());
      });
    });

    describe('when there is no saved configuration', function () {
      it('should return default configuration', async function () {
        // when
        const configResult = await flashAlgorithmConfigurationRepository.get();

        // then
        expect(configResult).to.be.instanceOf(FlashAssessmentAlgorithmConfiguration);
      });
    });
  });
});
