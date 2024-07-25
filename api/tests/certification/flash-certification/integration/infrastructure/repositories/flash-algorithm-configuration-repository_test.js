import dayjs from 'dayjs';

import * as flashAlgorithmConfigurationRepository from '../../../../../../../api/src/certification/flash-certification/infrastructure/repositories/flash-algorithm-configuration-repository.js';
import { FlashAssessmentAlgorithmConfiguration } from '../../../../../../src/certification/flash-certification/domain/models/FlashAssessmentAlgorithmConfiguration.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, domainBuilder, expect, knex } from '../../../../../test-helper.js';

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

  describe('#getMostRecent', function () {
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
        const configResult = await flashAlgorithmConfigurationRepository.getMostRecent();

        // then
        expect(configResult.toDTO()).to.deep.equal(expectedFlashAlgorithmConfiguration.toDTO());
      });
    });

    describe('when there are multiple saved configurations', function () {
      it('should return the latest', async function () {
        // given
        const latestFlashAlgorithmConfiguration = databaseBuilder.factory.buildFlashAlgorithmConfiguration({
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
          createdAt: new Date('2021-01-01'),
        });

        databaseBuilder.factory.buildFlashAlgorithmConfiguration({
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
          createdAt: new Date('2020-01-01'),
        });

        const expectedFlashAlgorithmConfiguration = domainBuilder.buildFlashAlgorithmConfiguration({
          ...latestFlashAlgorithmConfiguration,
          forcedCompetences: JSON.parse(latestFlashAlgorithmConfiguration.forcedCompetences),
          minimumEstimatedSuccessRateRanges: JSON.parse(
            latestFlashAlgorithmConfiguration.minimumEstimatedSuccessRateRanges,
          ),
        });

        await databaseBuilder.commit();

        // when
        const configResult = await flashAlgorithmConfigurationRepository.getMostRecent();

        // then
        expect(configResult.toDTO()).to.deep.equal(expectedFlashAlgorithmConfiguration.toDTO());
      });
    });

    describe('when there is no saved configuration', function () {
      it('should return default configuration', async function () {
        // when
        const configResult = await flashAlgorithmConfigurationRepository.getMostRecent();

        // then
        expect(configResult).to.be.instanceOf(FlashAssessmentAlgorithmConfiguration);
      });
    });
  });

  describe('#getMostRecentBeforeDate', function () {
    const firstConfigDate = new Date('2020-01-01T08:00:00Z');
    const firstConfigVariationPercent = 0.1;

    const secondConfigDate = new Date('2021-01-01T08:00:00Z');
    const secondConfigVariationPercent = 0.2;

    const thirdConfigDate = new Date('2022-01-01T08:00:00Z');
    const thirdConfigVariationPercent = 0.3;

    describe('when there are saved configurations', function () {
      let firstConfiguration;
      let thirdConfiguration;

      beforeEach(async function () {
        firstConfiguration = databaseBuilder.factory.buildFlashAlgorithmConfiguration({
          createdAt: firstConfigDate,
          variationPercent: firstConfigVariationPercent,
        });
        databaseBuilder.factory.buildFlashAlgorithmConfiguration({
          createdAt: secondConfigDate,
          variationPercent: secondConfigVariationPercent,
        });
        thirdConfiguration = databaseBuilder.factory.buildFlashAlgorithmConfiguration({
          createdAt: thirdConfigDate,
          variationPercent: thirdConfigVariationPercent,
        });
        await databaseBuilder.commit();
      });

      describe('when date is more recent than the latest configuration', function () {
        it('should return the latest configuration', async function () {
          // given
          const date = dayjs(thirdConfigDate).add(7, 'day').toDate();

          // when
          const configResult = await flashAlgorithmConfigurationRepository.getMostRecentBeforeDate(date);

          // then
          expect(configResult.toDTO()).to.deep.equal(thirdConfiguration);
        });
      });

      describe('when date is between the first and second configuration', function () {
        it('should return the first configuration', async function () {
          // given
          const date = dayjs(firstConfigDate).add(7, 'day').toDate();

          // when
          const configResult = await flashAlgorithmConfigurationRepository.getMostRecentBeforeDate(date);

          // then
          expect(configResult.toDTO()).to.deep.equal(firstConfiguration);
        });
      });

      describe('when date is older than the first configuration', function () {
        it('should return the first configuration', async function () {
          // given
          const date = dayjs(firstConfigDate).subtract(7, 'day').toDate();

          // when
          const configResult = await flashAlgorithmConfigurationRepository.getMostRecentBeforeDate(date);

          // then
          expect(configResult.toDTO()).to.deep.equal(firstConfiguration);
        });
      });
    });

    describe('when there is no saved configuration', function () {
      it('should throw a not found error', async function () {
        // given
        const configDate = new Date('2020-01-01T08:00:00Z');

        // when
        const error = await catchErr(flashAlgorithmConfigurationRepository.getMostRecentBeforeDate)(configDate);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });
});
