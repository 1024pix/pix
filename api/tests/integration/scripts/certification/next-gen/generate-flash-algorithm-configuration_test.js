import { expect, knex } from '../../../../test-helper.js';
import { main } from '../../../../../scripts/certification/next-gen/generate-flash-algorithm-configuration.js';
import _ from 'lodash';

describe('Integration | Scripts | Certification | generate-flash-algorithm-configuration', function () {
  const TABLE_NAME = 'flash-algorithm-configurations';

  it('should create a flash algorithm configuration', async function () {
    // when
    await main();

    // then
    const expectedFlashAlgorithmConfiguration = {
      warmUpLength: null,
      forcedCompetences: [],
      maximumAssessmentLength: 32,
      challengesBetweenSameCompetence: null,
      minimumEstimatedSuccessRateRanges: [],
      limitToOneQuestionPerTube: true,
      enablePassageByAllCompetences: true,
      doubleMeasuresUntil: null,
      variationPercent: 0.5,
      variationPercentUntil: null,
    };
    const flashAlgorithmConfiguration = await knex(TABLE_NAME).first();
    expect(_.omit(flashAlgorithmConfiguration, ['id', 'createdAt'])).to.deep.equal(expectedFlashAlgorithmConfiguration);
  });
});
