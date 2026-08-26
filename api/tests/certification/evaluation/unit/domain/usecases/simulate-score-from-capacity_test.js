import sinon from 'sinon';

import { simulateScoreFromCapacity } from '../../../../../../src/certification/evaluation/domain/usecases/simulate-score-from-capacity.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Evaluation | Unit | Domain | Usecase | simulate-score-from-capacity', function () {
  let scoringConfigurationRepository;

  beforeEach(function () {
    scoringConfigurationRepository = {
      getLatestByDateAndLocale: sinon.stub(),
    };
  });

  context('when there is no scoring configuration for that date', function () {
    it('should throw a NotFoundError', async function () {
      // given
      const date = new Date();
      scoringConfigurationRepository.getLatestByDateAndLocale.withArgs({ date, locale: 'fr-fr' }).resolves(null);

      // when
      const error = await catchErr(simulateScoreFromCapacity)({
        capacity: 2,
        date,
        scoringConfigurationRepository,
      });

      // then
      expect(error).to.deepEqualInstance(
        new NotFoundError(`No certification scoring configuration found for date ${date.toISOString()}`),
      );
    });
  });

  it('should return a score', async function () {
    // given
    const date = new Date();
    const capacity = 2;

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
        {
          bounds: { max: 8, min: 4 },
          meshLevel: 1,
        },
      ],
    });

    scoringConfigurationRepository.getLatestByDateAndLocale
      .withArgs({ date, locale: 'fr-fr' })
      .resolves(v3CertificationScoring);

    // when
    const result = await simulateScoreFromCapacity({
      capacity,
      date,
      scoringConfigurationRepository,
    });

    // then
    expect(result).to.deepEqualInstance(
      domainBuilder.buildScoringAndCapacitySimulatorReport({
        capacity,
        score: 48,
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
