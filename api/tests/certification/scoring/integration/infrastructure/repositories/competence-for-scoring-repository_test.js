import { expect, mockLearningContent } from '../../../../../test-helper.js';
import { buildArea, buildCompetence, buildFramework } from '../../../../../tooling/domain-builder/factory/index.js';
import { buildLearningContent } from '../../../../../tooling/learning-content-builder/index.js';
import { competenceLevelIntervals } from '../../../../../../src/certification/flash-certification/domain/constants/competence-level-intervals.js';
import _ from 'lodash';
import { listByLocale } from '../../../../../../src/certification/scoring/infrastructure/repositories/competence-for-scoring-repository.js';
import { CompetenceForScoring } from '../../../../../../src/certification/scoring/domain/models/CompetenceForScoring.js';

describe('Unit | Repository | competence-for-scoring-repository', function () {
  beforeEach(function () {
    const frameworkId = 'frameworkId';

    const getAreaCode = (competenceCode) => competenceCode.split('.').shift();
    const competenceLevelIntervalsWithAreaCode = competenceLevelIntervals.map((competenceLevelInterval) => ({
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
  });

  describe('#listByLocale', function () {
    it('should return a list of competences for scoring', async function () {
      // when
      const resultList = await listByLocale({ locale: 'fr-fr' });

      // then
      resultList.map((result) => {
        expect(result).to.be.instanceOf(CompetenceForScoring);
      });
      expect(resultList.length).to.equal(16);
    });
  });
});
