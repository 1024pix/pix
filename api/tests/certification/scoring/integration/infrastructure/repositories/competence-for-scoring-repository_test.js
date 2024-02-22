import { databaseBuilder, expect, mockLearningContent } from '../../../../../test-helper.js';
import { buildArea, buildCompetence, buildFramework } from '../../../../../tooling/domain-builder/factory/index.js';
import { buildLearningContent } from '../../../../../tooling/learning-content-builder/index.js';
import _ from 'lodash';
import {
  listByLocale,
  save,
} from '../../../../../../src/certification/scoring/infrastructure/repositories/competence-for-scoring-repository.js';
import { CompetenceForScoring } from '../../../../../../src/certification/scoring/domain/models/CompetenceForScoring.js';
import { knex } from '../../../../../../db/knex-database-connection.js';

describe('Unit | Repository | competence-for-scoring-repository', function () {
  describe('#listByLocale', function () {
    it('should return a list of competences for scoring', async function () {
      // given
      const frameworkId = 'frameworkId';

      const configuration = [
        {
          competence: '1.1',
          values: [
            {
              bounds: {
                max: -2.2,
                min: -9.8,
              },
              competenceLevel: 0,
            },
          ],
        },
      ];
      const getAreaCode = (competenceCode) => competenceCode.split('.').shift();
      const competenceLevelIntervalsWithAreaCode = configuration.map((competenceLevelInterval) => ({
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

      databaseBuilder.factory.buildCompetenceScoringConfiguration({ configuration });

      await databaseBuilder.commit();

      // when
      const resultList = await listByLocale({ locale: 'fr-fr' });

      // then
      resultList.map((result) => {
        expect(result).to.be.instanceOf(CompetenceForScoring);
      });
      expect(resultList.length).to.equal(1);
    });
  });

  describe('#save', function () {
    it('should save a configuration for competence scoring', async function () {
      // given
      const data = { some: 'data' };

      // when
      await save(data);

      // then
      const configurations = await knex('competence-scoring-configurations');
      expect(configurations.length).to.equal(1);
      expect(configurations[0].configuration).to.deep.equal({ some: 'data' });
    });
  });
});
