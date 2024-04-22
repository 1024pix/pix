import { ScoringSimulator } from '../../../../../../src/certification/scoring/domain/models/ScoringSimulator.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Domain | Models | ScoringSimulator', function () {
  describe('#compute', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      {
        capacity: -8,
        expectedScore: 0,
        expectedCompetences: [
          { competenceCode: '1.1', level: 0 },
          { competenceCode: '1.2', level: 0 },
          { competenceCode: '2.1', level: 0 },
          { competenceCode: '2.2', level: 0 },
          { competenceCode: '2.3', level: 0 },
        ],
      },
      {
        capacity: -3.25390625,
        expectedScore: 101,
        expectedCompetences: [
          { competenceCode: '1.1', level: 0 },
          { competenceCode: '1.2', level: 1 },
          { competenceCode: '2.1', level: 1 },
          { competenceCode: '2.2', level: 2 },
          { competenceCode: '2.3', level: 1 },
        ],
      },
      {
        capacity: -2.99609375,
        expectedScore: 107,
        expectedCompetences: [
          { competenceCode: '1.1', level: 0 },
          { competenceCode: '1.2', level: 2 },
          { competenceCode: '2.1', level: 1 },
          { competenceCode: '2.2', level: 2 },
          { competenceCode: '2.3', level: 1 },
        ],
      },
      {
        capacity: -2.75,
        expectedScore: 112,
        expectedCompetences: [
          { competenceCode: '1.1', level: 0 },
          { competenceCode: '1.2', level: 2 },
          { competenceCode: '2.1', level: 1 },
          { competenceCode: '2.2', level: 2 },
          { competenceCode: '2.3', level: 1 },
        ],
      },
      {
        capacity: -2.50390625,
        expectedScore: 117,
        expectedCompetences: [
          { competenceCode: '1.1', level: 0 },
          { competenceCode: '1.2', level: 2 },
          { competenceCode: '2.1', level: 1 },
          { competenceCode: '2.2', level: 2 },
          { competenceCode: '2.3', level: 2 },
        ],
      },
      {
        capacity: -2.24609375,
        expectedScore: 123,
        expectedCompetences: [
          { competenceCode: '1.1', level: 0 },
          { competenceCode: '1.2', level: 2 },
          { competenceCode: '2.1', level: 1 },
          { competenceCode: '2.2', level: 2 },
          { competenceCode: '2.3', level: 2 },
        ],
      },
      {
        capacity: -2,
        expectedScore: 128,
        expectedCompetences: [
          { competenceCode: '1.1', level: 1 },
          { competenceCode: '1.2', level: 2 },
          { competenceCode: '2.1', level: 2 },
          { competenceCode: '2.2', level: 2 },
          { competenceCode: '2.3', level: 2 },
        ],
      },
      {
        capacity: -0.8695312500000002,
        expectedScore: 224,
        expectedCompetences: [
          { competenceCode: '1.1', level: 1 },
          { competenceCode: '1.2', level: 2 },
          { competenceCode: '2.1', level: 2 },
          { competenceCode: '2.2', level: 3 },
          { competenceCode: '2.3', level: 2 },
        ],
      },
      {
        capacity: 0.10781249999999987,
        expectedScore: 327,
        expectedCompetences: [
          { competenceCode: '1.1', level: 2 },
          { competenceCode: '1.2', level: 2 },
          { competenceCode: '2.1', level: 3 },
          { competenceCode: '2.2', level: 3 },
          { competenceCode: '2.3', level: 2 },
        ],
      },
      {
        capacity: 1.083984375,
        expectedScore: 453,
        expectedCompetences: [
          { competenceCode: '1.1', level: 3 },
          { competenceCode: '1.2', level: 3 },
          { competenceCode: '2.1', level: 3 },
          { competenceCode: '2.2', level: 3 },
          { competenceCode: '2.3', level: 3 },
        ],
      },
      {
        capacity: 1.964453125,
        expectedScore: 591,
        expectedCompetences: [
          { competenceCode: '1.1', level: 4 },
          { competenceCode: '1.2', level: 3 },
          { competenceCode: '2.1', level: 4 },
          { competenceCode: '2.2', level: 4 },
          { competenceCode: '2.3', level: 4 },
        ],
      },
      {
        capacity: 2.99453125,
        expectedScore: 752,
        expectedCompetences: [
          { competenceCode: '1.1', level: 5 },
          { competenceCode: '1.2', level: 3 },
          { competenceCode: '2.1', level: 5 },
          { competenceCode: '2.2', level: 5 },
          { competenceCode: '2.3', level: 4 },
        ],
      },
      {
        capacity: 4.03125,
        expectedScore: 896,
        expectedCompetences: [
          { competenceCode: '1.1', level: 7 },
          { competenceCode: '1.2', level: 5 },
          { competenceCode: '2.1', level: 6 },
          { competenceCode: '2.2', level: 6 },
          { competenceCode: '2.3', level: 5 },
        ],
      },
    ].forEach(({ capacity, expectedScore, expectedCompetences }) => {
      it(`returns the score ${expectedScore} and competences ${expectedCompetences}  when capacity is ${capacity}`, function () {
        // given
        const certificationScoringIntervals = [
          { bounds: { max: -2, min: -8 }, meshLevel: 0 },
          { bounds: { max: -0.5, min: -2 }, meshLevel: 1 },
          { bounds: { max: 0.6, min: -0.5 }, meshLevel: 2 },
          { bounds: { max: 1.5, min: 0.6 }, meshLevel: 3 },
          { bounds: { max: 2.25, min: 1.5 }, meshLevel: 4 },
          { bounds: { max: 3.1, min: 2.25 }, meshLevel: 5 },
          { bounds: { max: 4, min: 3.1 }, meshLevel: 6 },
          { bounds: { max: 8, min: 4 }, meshLevel: 7 },
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
              { bounds: { max: 8, min: 6 }, competenceLevel: 7 },
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

        // when
        const result = ScoringSimulator.compute({ capacity, certificationScoringIntervals, competencesForScoring });

        // then
        expect(result).to.deepEqualInstance(
          domainBuilder.buildScoringAndCapacitySimulatorReport({
            capacity,
            score: expectedScore,
            competences: expectedCompetences,
          }),
        );
      });
    });
  });
});
