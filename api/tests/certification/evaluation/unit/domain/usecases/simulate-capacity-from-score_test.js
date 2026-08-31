import { expect } from 'chai';
import sinon from 'sinon';

import { simulateCapacityFromScore } from '../../../../../../src/certification/evaluation/domain/usecases/simulate-capacity-from-score.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Evaluation | Unit | Domain | Usecase | simulate-capacity-from-score', function () {
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
      const error = await catchErr(simulateCapacityFromScore)({
        score: 767,
        date,
        scoringConfigurationRepository,
      });

      // then
      expect(error).to.deepEqualInstance(
        new NotFoundError(`No certification scoring configuration found for date ${date.toISOString()}`),
      );
    });
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
