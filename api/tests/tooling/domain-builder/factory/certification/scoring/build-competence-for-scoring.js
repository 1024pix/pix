import { CompetenceForScoring } from '../../../../../../src/certification/scoring/domain/models/CompetenceForScoring.js';

export const buildCompetenceForScoring = ({
  competenceId = 'recCompetenceId',
  areaCode = '1',
  competenceCode = '1.1',
  intervals = [
    {
      bounds: {
        max: -1,
        min: Number.MIN_SAFE_INTEGER,
      },
      competenceLevel: 0,
    },
    {
      bounds: {
        max: 1,
        min: -1,
      },
      competenceLevel: 1,
    },
    {
      bounds: {
        max: Number.MAX_SAFE_INTEGER,
        min: 1,
      },
      competenceLevel: 2,
    },
  ],
} = {}) => {
  return new CompetenceForScoring({
    competenceId,
    areaCode,
    competenceCode,
    intervals,
  });
};
