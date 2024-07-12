import _ from 'lodash';

import { knex } from '../../../../../../db/knex-database-connection.js';
import { V3CertificationScoring } from '../../../../../../src/certification/scoring/domain/models/V3CertificationScoring.js';
import {
  getLatestByDateAndLocale,
  saveCertificationScoringConfiguration,
  saveCompetenceForScoringConfiguration,
} from '../../../../../../src/certification/scoring/infrastructure/repositories/scoring-configuration-repository.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, expect, mockLearningContent } from '../../../../../test-helper.js';
import { buildArea, buildCompetence, buildFramework } from '../../../../../tooling/domain-builder/factory/index.js';
import { buildLearningContent } from '../../../../../tooling/learning-content-builder/index.js';

describe('Integration | Repository | scoring-configuration-repository', function () {
  describe('#getLatestByDateAndLocale', function () {
    beforeEach(async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      const frameworkId = 'frameworkId';

      const competenceScoringConfiguration = [
        {
          competence: '1.1',
          values: [],
        },
      ];

      const secondCompetenceScoringConfiguration = [
        {
          competence: '1.1',
          values: [
            {
              bounds: {
                max: -4,
                min: -6,
              },
              competenceLevel: 1,
            },
          ],
        },
      ];

      const firstConfigurationDate = new Date('2019-01-01T08:00:00Z');
      const secondConfigurationDate = new Date('2020-01-01T08:00:00Z');
      const thirdConfigurationDate = new Date('2021-01-01T08:00:00Z');

      const getAreaCode = (competenceCode) => competenceCode.split('.').shift();
      const competenceLevelIntervalsWithAreaCode = competenceScoringConfiguration.map((competenceLevelInterval) => ({
        ...competenceLevelInterval,
        areaCode: getAreaCode(competenceLevelInterval.competence),
      }));
      const competenceLevelIntervalsByArea = _.groupBy(competenceLevelIntervalsWithAreaCode, 'areaCode');
      const areas = Object.entries(competenceLevelIntervalsByArea).map(([areaCode, competenceLevelIntervals]) => {
        const areaId = `recArea${areaCode}`;

        const competences = competenceLevelIntervals.map((competenceLevelInterval) => {
          const competenceIndex = competenceLevelInterval.competence;
          const competenceId = `recCompetence${competenceIndex}`;

          return buildCompetence({ id: competenceId, areaId, index: competenceIndex });
        });

        return buildArea({ id: areaId, frameworkId, code: areaCode, competences });
      });
      const framework = buildFramework({ id: frameworkId, name: 'someFramework', areas });
      const learningContent = buildLearningContent([framework]);

      mockLearningContent(learningContent);

      databaseBuilder.factory.buildCompetenceScoringConfiguration({
        configuration: competenceScoringConfiguration,
        createdAt: firstConfigurationDate,
        createdByUserId: userId,
      });
      databaseBuilder.factory.buildScoringConfiguration({
        createdAt: firstConfigurationDate,
        createdByUserId: userId,
      });

      databaseBuilder.factory.buildCompetenceScoringConfiguration({
        configuration: secondCompetenceScoringConfiguration,
        createdAt: secondConfigurationDate,
        createdByUserId: userId,
      });
      databaseBuilder.factory.buildScoringConfiguration({
        createdAt: secondConfigurationDate,
        createdByUserId: userId,
      });

      databaseBuilder.factory.buildCompetenceScoringConfiguration({
        configuration: competenceScoringConfiguration,
        createdAt: thirdConfigurationDate,
        createdByUserId: userId,
      });
      databaseBuilder.factory.buildScoringConfiguration({
        createdAt: thirdConfigurationDate,
        createdByUserId: userId,
      });

      await databaseBuilder.commit();
    });

    describe('when the date is before the competence scoring configurations', function () {
      it('should throw a NotFoundError', async function () {
        // given
        const date = new Date('2018-06-01T08:00:00Z');

        // when
        const error = await catchErr(getLatestByDateAndLocale)({ locale: 'fr-fr', date });

        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal('No competence scoring configuration found for date 2018-06-01T08:00:00.000Z');
      });
    });

    describe('when the date is before the certification scoring configurations', function () {
      it('should throw a NotFoundError', async function () {
        // given
        const date = new Date('2018-06-01T08:00:00Z');

        databaseBuilder.factory.buildCompetenceScoringConfiguration({
          configuration: { competence: '1.1', values: [] },
          createdAt: new Date('2018-01-01T08:00:00Z'),
          createdByUserId: databaseBuilder.factory.buildUser().id,
        });
        await databaseBuilder.commit();

        // when
        const error = await catchErr(getLatestByDateAndLocale)({ locale: 'fr-fr', date });

        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal(
          'No certification scoring configuration found for date 2018-06-01T08:00:00.000Z',
        );
      });
    });

    it('should return a list of competences for scoring', async function () {
      // given
      const date = new Date('2020-07-01T08:00:00Z');

      // when
      const result = await getLatestByDateAndLocale({ locale: 'fr-fr', date });

      // then
      expect(result).to.be.instanceOf(V3CertificationScoring);
      expect(result._competencesForScoring[0].intervals.length).not.to.be.equal(0);
      expect(result._certificationScoringConfiguration[0].bounds.min).to.be.equal(-5.12345);
      expect(result._certificationScoringConfiguration[7].bounds.max).to.be.equal(6.56789);
    });
  });

  describe('#saveCompetenceForScoringConfiguration', function () {
    it('should save a configuration for competence scoring', async function () {
      // given
      const userId = 1000;
      databaseBuilder.factory.buildUser({ id: userId });
      const configuration = { some: 'data' };
      await databaseBuilder.commit();

      // when
      await saveCompetenceForScoringConfiguration({ configuration, userId });

      // then
      const configurations = await knex('competence-scoring-configurations');
      expect(configurations.length).to.equal(1);
      expect(configurations[0].configuration).to.deep.equal({ some: 'data' });
      expect(configurations[0].createdByUserId).to.equal(userId);
    });
  });

  describe('#saveCertificationScoringConfiguration', function () {
    it('should save a configuration for competence scoring', async function () {
      // given
      const userId = 1000;
      databaseBuilder.factory.buildUser({ id: userId }).id;
      const data = { some: 'data' };
      await databaseBuilder.commit();

      // when
      await saveCertificationScoringConfiguration({ configuration: data, userId });

      // then
      const configurations = await knex('certification-scoring-configurations');
      expect(configurations.length).to.equal(1);
      expect(configurations[0].configuration).to.deep.equal({ some: 'data' });
      expect(configurations[0].createdByUserId).to.equal(userId);
    });
  });
});
