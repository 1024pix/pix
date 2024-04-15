import { simulateScoreFromCapacity } from '../../../../../../src/certification/scoring/domain/usecases/simulate-score-from-capacity.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | simulate-score-from-capacity', function () {
  let scoringConfigurationRepository;

  beforeEach(function () {
    scoringConfigurationRepository = {
      getLatestByDateAndLocale: sinon.stub(),
    };
  });

  it('should return a score', async function () {
    // given
    const date = new Date();

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
    const result = await simulateScoreFromCapacity({
      capacity: 2,
      date,
      scoringConfigurationRepository,
    });

    // then
    expect(result).to.deepEqualInstance(
      domainBuilder.buildScoringAndCapacitySimulatorReport({
        capacity: undefined,
        score: 768,
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
