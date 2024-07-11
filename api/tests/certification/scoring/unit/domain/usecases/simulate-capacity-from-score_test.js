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
        { bounds: { max: -2.6789, min: -5.12345 }, meshLevel: 0 },
        { bounds: { max: -0.23456, min: -2.6789 }, meshLevel: 1 },
        { bounds: { max: 0.78901, min: -0.23456 }, meshLevel: 2 },
        { bounds: { max: 1.34567, min: 0.78901 }, meshLevel: 3 },
        { bounds: { max: 2.89012, min: 1.34567 }, meshLevel: 4 },
        { bounds: { max: 2.45678, min: 2.89012 }, meshLevel: 5 },
        { bounds: { max: 4.90123, min: 2.45678 }, meshLevel: 6 },
        { bounds: { max: 6.56789, min: 4.90123 }, meshLevel: 7 },
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
        capacity: 4.882132734375,
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
