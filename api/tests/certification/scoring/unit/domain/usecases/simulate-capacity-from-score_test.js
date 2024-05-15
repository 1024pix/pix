import { simulateCapacityFromScore } from '../../../../../../src/certification/scoring/domain/usecases/simulate-capacity-from-score.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | simulate-capacity-from-score', function () {
  let scoringConfigurationRepository;

  beforeEach(function () {
    scoringConfigurationRepository = {
      getLatestByDateAndLocale: sinon.stub(),
    };
  });

  it('should return a capacity', async function () {
    // given
    const date = new Date();
    const score = 767;

    const v3CertificationScoring = domainBuilder.buildV3CertificationScoring({
      competencesForScoring: [
        domainBuilder.buildCompetenceForScoring({
          competenceId: 'recCompetenceId',
          areaCode: '1',
          competenceCode: '1.1',
          intervals: [
            {
              bounds: {
                max: 4,
                min: -4,
              },
              competenceLevel: 0,
            },
          ],
        }),
      ],
      certificationScoringConfiguration: [
        {
          bounds: { max: 4, min: -4 },
          meshLevel: 0,
        },
      ],
    });

    scoringConfigurationRepository.getLatestByDateAndLocale
      .withArgs({ date, locale: 'fr-fr' })
      .resolves(v3CertificationScoring);

    // when
    const result = await simulateCapacityFromScore({
      score,
      date,
      scoringConfigurationRepository,
    });

    // then
    expect(result).to.deepEqualInstance(
      domainBuilder.buildScoringAndCapacitySimulatorReport({
        capacity: 2,
        score,
        competences: [
          {
            level: 0,
            competenceCode: '1.1',
          },
        ],
      }),
    );
  });
});
