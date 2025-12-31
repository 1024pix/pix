import { DEFAULT_SESSION_DURATION_MINUTES } from '../../../src/certification/shared/domain/constants.js';
import { SCOPES } from '../../../src/certification/shared/domain/models/Scopes.js';
import { databaseBuffer } from '../database-buffer.js';

const defaultChallengesConfiguration = {
  maximumAssessmentLength: 32,
  challengesBetweenSameCompetence: 2,
  limitToOneQuestionPerTube: true,
  enablePassageByAllCompetences: true,
  variationPercent: 0.5,
  defaultCandidateCapacity: -3,
  defaultProbabilityToPickChallenge: 51,
};

const defaultGlobalScoringConfiguration = [
  {
    meshLevel: 0,
    bounds: {
      min: -8,
      max: -1.4,
    },
  },
  {
    meshLevel: 1,
    bounds: {
      min: -1.4,
      max: -0.519,
    },
  },
  {
    meshLevel: 2,
    bounds: {
      min: -0.519,
      max: 0.6,
    },
  },
  {
    meshLevel: 3,
    bounds: {
      min: 0.6,
      max: 1.5,
    },
  },
  {
    meshLevel: 4,
    bounds: {
      min: 1.5,
      max: 2.25,
    },
  },
  {
    meshLevel: 5,
    bounds: {
      min: 2.25,
      max: 3.1,
    },
  },
  {
    meshLevel: 6,
    bounds: {
      min: 3.1,
      max: 4,
    },
  },
  {
    meshLevel: 7,
    bounds: {
      min: 4,
      max: 8,
    },
  },
];

const defaultCompetencesScoringConfiguration = [
  {
    competence: '1.1',
    values: [
      {
        bounds: {
          max: -2,
          min: Number.MIN_SAFE_INTEGER,
        },
        competenceLevel: 0,
      },
      {
        bounds: {
          max: -1,
          min: -2,
        },
        competenceLevel: 1,
      },
      {
        bounds: {
          max: 0.5,
          min: -1,
        },
        competenceLevel: 2,
      },
      {
        bounds: {
          max: 1,
          min: 0.5,
        },
        competenceLevel: 3,
      },
      {
        bounds: {
          max: 2,
          min: 1,
        },
        competenceLevel: 4,
      },
      {
        bounds: {
          max: 3,
          min: 2,
        },
        competenceLevel: 5,
      },
      {
        bounds: {
          max: 4,
          min: 3,
        },
        competenceLevel: 6,
      },
      {
        bounds: {
          max: Number.MAX_SAFE_INTEGER,
          min: 4,
        },
        competenceLevel: 7,
      },
    ],
  },
];

export const buildCertificationVersion = function ({
  id = databaseBuffer.getNextId(),
  scope = SCOPES.CORE,
  startDate = new Date('1977-10-19'),
  expirationDate = null,
  assessmentDuration = DEFAULT_SESSION_DURATION_MINUTES,
  globalScoringConfiguration = defaultGlobalScoringConfiguration,
  competencesScoringConfiguration = defaultCompetencesScoringConfiguration,
  challengesConfiguration = defaultChallengesConfiguration,
} = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'certification_versions',
    values: {
      id,
      scope,
      startDate,
      expirationDate,
      assessmentDuration,
      globalScoringConfiguration: JSON.stringify(globalScoringConfiguration),
      competencesScoringConfiguration: JSON.stringify(competencesScoringConfiguration),
      challengesConfiguration: JSON.stringify(challengesConfiguration),
    },
  });
};
