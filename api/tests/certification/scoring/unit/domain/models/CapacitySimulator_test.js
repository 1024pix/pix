import {
  CapacitySimulator,
  findIntervalIndexFromScore,
} from '../../../../../../src/certification/scoring/domain/models/CapacitySimulator.js';
import { CertificationAssessmentScoreV3 } from '../../../../../../src/certification/scoring/domain/models/CertificationAssessmentScoreV3.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Domain | Models | CapacitySimulator', function () {
  const certificationScoringIntervals = [
    { bounds: { max: -2, min: -8 }, meshLevel: 0 }, // Score de 0 à 63
    { bounds: { max: -0.5, min: -2 }, meshLevel: 1 }, // Score de 64 à 127
    { bounds: { max: 0.6, min: -0.5 }, meshLevel: 2 }, // score de 128 à 255
    { bounds: { max: 1.5, min: 0.6 }, meshLevel: 3 }, // score de 256 à 383
    { bounds: { max: 2.25, min: 1.5 }, meshLevel: 4 }, // score de 384 à 511
    { bounds: { max: 3.1, min: 2.25 }, meshLevel: 5 }, // score de 512 à 639
    { bounds: { max: 4, min: 3.1 }, meshLevel: 6 }, // score de 640 à 767
    { bounds: { max: 8, min: 4 }, meshLevel: 7 }, // score de 768 à 895
  ];

  const competencesForScoring = [
    {
      intervals: [
        { bounds: { max: -2, min: -8 }, competenceLevel: 0 },
        { bounds: { max: -0.5, min: -2 }, competenceLevel: 1 },
        { bounds: { max: 0.6, min: -0.5 }, competenceLevel: 2 },
        { bounds: { max: 1.5, min: 0.6 }, competenceLevel: 3 },
        { bounds: { max: 2.25, min: 1.5 }, competenceLevel: 4 },
        { bounds: { max: 3.1, min: 2.25 }, competenceLevel: 5 },
        { bounds: { max: 4, min: 3.1 }, competenceLevel: 6 },
        { bounds: { max: 8, min: 4 }, competenceLevel: 7 },
      ],
      competenceCode: '1.1',
    },
    {
      intervals: [
        { bounds: { max: -4, min: -8 }, competenceLevel: 0 },
        { bounds: { max: -3, min: -4 }, competenceLevel: 1 },
        { bounds: { max: 1, min: -3 }, competenceLevel: 2 },
        { bounds: { max: 3, min: 1 }, competenceLevel: 3 },
        { bounds: { max: 4, min: 3 }, competenceLevel: 4 },
        { bounds: { max: 5, min: 4 }, competenceLevel: 5 },
        { bounds: { max: 7, min: 5 }, competenceLevel: 6 },
        { bounds: { max: 8, min: 7 }, competenceLevel: 7 },
      ],
      competenceCode: '1.2',
    },
    {
      intervals: [
        { bounds: { max: -5, min: -8 }, competenceLevel: 0 },
        { bounds: { max: -2, min: -5 }, competenceLevel: 1 },
        { bounds: { max: 0, min: -2 }, competenceLevel: 2 },
        { bounds: { max: 1.5, min: 0 }, competenceLevel: 3 },
        { bounds: { max: 2.25, min: 1.5 }, competenceLevel: 4 },
        { bounds: { max: 3, min: 2.25 }, competenceLevel: 5 },
        { bounds: { max: 6, min: 3 }, competenceLevel: 6 },
        { bounds: { max: 8, min: 6 }, competenceLevel: 7 },
      ],
      competenceCode: '2.1',
    },
    {
      intervals: [
        { bounds: { max: -7, min: -8 }, competenceLevel: 0 },
        { bounds: { max: -5, min: -7 }, competenceLevel: 1 },
        { bounds: { max: -1, min: -5 }, competenceLevel: 2 },
        { bounds: { max: 1.5, min: -1 }, competenceLevel: 3 },
        { bounds: { max: 2, min: 1.5 }, competenceLevel: 4 },
        { bounds: { max: 3.6, min: 2 }, competenceLevel: 5 },
        { bounds: { max: 6, min: 3.6 }, competenceLevel: 6 },
        { bounds: { max: 8, min: 8 }, competenceLevel: 7 },
      ],
      competenceCode: '2.2',
    },
    {
      intervals: [
        { bounds: { max: -5.8, min: -8 }, competenceLevel: 0 },
        { bounds: { max: -2.7, min: -5.8 }, competenceLevel: 1 },
        { bounds: { max: 0.6, min: -2.7 }, competenceLevel: 2 },
        { bounds: { max: 1.7, min: 0.6 }, competenceLevel: 3 },
        { bounds: { max: 3.28, min: 1.7 }, competenceLevel: 4 },
        { bounds: { max: 5.12, min: 3.28 }, competenceLevel: 5 },
        { bounds: { max: 6.34, min: 5.12 }, competenceLevel: 6 },
        { bounds: { max: 8, min: 6.34 }, competenceLevel: 7 },
      ],
      competenceCode: '2.3',
    },
  ];

  describe('#compute', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      {
        score: 111,
        expectedCapacity: -0.8984375,
        expectedCompetences: [
          { competenceCode: '1.1', level: 1 },
          { competenceCode: '1.2', level: 2 },
          { competenceCode: '2.1', level: 2 },
          { competenceCode: '2.2', level: 3 },
          { competenceCode: '2.3', level: 2 },
        ],
      },
      {
        score: 116,
        expectedCapacity: -0.78125,
        expectedCompetences: [
          { competenceCode: '1.1', level: 1 },
          { competenceCode: '1.2', level: 2 },
          { competenceCode: '2.1', level: 2 },
          { competenceCode: '2.2', level: 3 },
          { competenceCode: '2.3', level: 2 },
        ],
      },
      {
        score: 122,
        expectedCapacity: -0.640625,
        expectedCompetences: [
          { competenceCode: '1.1', level: 1 },
          { competenceCode: '1.2', level: 2 },
          { competenceCode: '2.1', level: 2 },
          { competenceCode: '2.2', level: 3 },
          { competenceCode: '2.3', level: 2 },
        ],
      },
      {
        score: 127,
        expectedCapacity: -0.5234375,
        expectedCompetences: [
          { competenceCode: '1.1', level: 1 },
          { competenceCode: '1.2', level: 2 },
          { competenceCode: '2.1', level: 2 },
          { competenceCode: '2.2', level: 3 },
          { competenceCode: '2.3', level: 2 },
        ],
      },
      {
        score: 223,
        expectedCapacity: 0.3164062500000001,
        expectedCompetences: [
          { competenceCode: '1.1', level: 2 },
          { competenceCode: '1.2', level: 2 },
          { competenceCode: '2.1', level: 3 },
          { competenceCode: '2.2', level: 3 },
          { competenceCode: '2.3', level: 2 },
        ],
      },
      {
        score: 326,
        expectedCapacity: 1.0921875,
        expectedCompetences: [
          { competenceCode: '1.1', level: 3 },
          { competenceCode: '1.2', level: 3 },
          { competenceCode: '2.1', level: 3 },
          { competenceCode: '2.2', level: 3 },
          { competenceCode: '2.3', level: 3 },
        ],
      },
      {
        score: 452,
        expectedCapacity: 1.8984375,
        expectedCompetences: [
          { competenceCode: '1.1', level: 4 },
          { competenceCode: '1.2', level: 3 },
          { competenceCode: '2.1', level: 4 },
          { competenceCode: '2.2', level: 4 },
          { competenceCode: '2.3', level: 4 },
        ],
      },
      {
        score: 590,
        expectedCapacity: 2.76796875,
        expectedCompetences: [
          { competenceCode: '1.1', level: 5 },
          { competenceCode: '1.2', level: 3 },
          { competenceCode: '2.1', level: 5 },
          { competenceCode: '2.2', level: 5 },
          { competenceCode: '2.3', level: 4 },
        ],
      },
      {
        score: 751,
        expectedCapacity: 3.88046875,
        expectedCompetences: [
          { competenceCode: '1.1', level: 6 },
          { competenceCode: '1.2', level: 4 },
          { competenceCode: '2.1', level: 6 },
          { competenceCode: '2.2', level: 6 },
          { competenceCode: '2.3', level: 5 },
        ],
      },
      {
        score: 895,
        expectedCapacity: 7.96875,
        expectedCompetences: [
          { competenceCode: '1.1', level: 7 },
          { competenceCode: '1.2', level: 7 },
          { competenceCode: '2.1', level: 7 },
          { competenceCode: '2.2', level: 7 },
          { competenceCode: '2.3', level: 7 },
        ],
      },
      {
        score: 896,
        expectedCapacity: 8,
        expectedCompetences: [
          { competenceCode: '1.1', level: 7 },
          { competenceCode: '1.2', level: 7 },
          { competenceCode: '2.1', level: 7 },
          { competenceCode: '2.2', level: 7 },
          { competenceCode: '2.3', level: 7 },
        ],
      },
    ].forEach(({ score, expectedCapacity, expectedCompetences }) => {
      it(`returns the capacity ${expectedCapacity} and ${expectedCompetences} when score is ${score}`, function () {
        // when
        const result = CapacitySimulator.compute({ certificationScoringIntervals, competencesForScoring, score });

        // then
        expect(result).to.deepEqualInstance(
          domainBuilder.buildScoringAndCapacitySimulatorReport({
            score,
            capacity: expectedCapacity,
            competences: expectedCompetences,
          }),
        );
      });
    });
  });

  describe('#findIntervalIndexFromScore', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      {
        score: 0,
        expectedInterval: 0,
      },
      {
        score: 64,
        expectedInterval: 1,
      },
      {
        score: 200,
        expectedInterval: 2,
      },
      {
        score: 896,
        expectedInterval: 7,
      },
    ].forEach(({ score, expectedInterval }) => {
      it(`returns the interval ${expectedInterval} when score is ${score}`, function () {
        // when
        const weights = CertificationAssessmentScoreV3.weightsAndCoefficients.map(({ weight }) => weight);
        const result = findIntervalIndexFromScore({
          score,
          weights,
          scoringIntervalsLength: certificationScoringIntervals.length,
        });

        // then
        expect(result).to.equal(expectedInterval);
      });
    });
  });
});
