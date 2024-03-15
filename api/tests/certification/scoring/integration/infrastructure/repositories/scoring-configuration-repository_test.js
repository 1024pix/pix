import _ from 'lodash';

import { knex } from '../../../../../../db/knex-database-connection.js';
import {
  listByLocale,
  save,
} from '../../../../../../src/certification/scoring/infrastructure/repositories/scoring-configuration-repository.js';
import { databaseBuilder, expect, mockLearningContent } from '../../../../../test-helper.js';
import { buildArea, buildCompetence, buildFramework } from '../../../../../tooling/domain-builder/factory/index.js';
import { buildLearningContent } from '../../../../../tooling/learning-content-builder/index.js';
import { V3CertificationScoring } from '../../../../../../src/certification/scoring/domain/models/V3CertificationScoring.js';

describe('Unit | Repository | scoring-configuration-repository', function () {
  describe('#listByLocale', function () {
    it('should return a list of competences for scoring', async function () {
      // given
      const frameworkId = 'frameworkId';

      const competenceScoringConfiguration = [
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
      const certificationScoringConfiguration = [
        {
          start: -1.399264,
          end: -0.519812,
        },
      ];

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

      databaseBuilder.factory.buildCompetenceScoringConfiguration({ configuration: competenceScoringConfiguration });
      databaseBuilder.factory.buildScoringConfiguration({ configuration: certificationScoringConfiguration });

      await databaseBuilder.commit();

      // when
      const result = await listByLocale({ locale: 'fr-fr' });

      // then
      expect(result).to.be.instanceOf(V3CertificationScoring);
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
