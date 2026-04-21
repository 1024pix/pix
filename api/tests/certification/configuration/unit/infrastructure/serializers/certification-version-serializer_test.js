import * as serializer from '../../../../../../src/certification/configuration/infrastructure/serializers/certification-version-serializer.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';

describe('Unit | Certification | Configuration | Serializer | certification-version-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a Version entity into JSON API format', function () {
      const certificationVersion = {
        id: 123,
        scope: SCOPES.CORE,
        startDate: new Date('2024-01-01T00:00:00Z'),
        expirationDate: new Date('2025-12-31T23:59:59Z'),
        assessmentDuration: 120,
        globalScoringConfiguration: [{ meshLevel: 0, bounds: { min: -8, max: -1.4 } }],
        competencesScoringConfiguration: [
          { competence: '1.1', values: [{ bounds: { max: -2, min: -10 }, competenceLevel: 0 }] },
        ],
        challengesConfiguration: {
          maximumAssessmentLength: 32,
          limitToOneQuestionPerTube: true,
          defaultCandidateCapacity: -3,
          defaultProbabilityToPickChallenge: 51,
          variationPercent: 0.5,
          enablePassageByAllCompetences: false,
        },
      };

      const result = serializer.serialize(certificationVersion);

      expect(result).to.deep.equal({
        data: {
          id: '123',
          type: 'certification-versions',
          attributes: {
            scope: SCOPES.CORE,
            'start-date': new Date('2024-01-01T00:00:00Z'),
            'expiration-date': new Date('2025-12-31T23:59:59Z'),
            'assessment-duration': 120,
            'global-scoring-configuration': [{ meshLevel: 0, bounds: { min: -8, max: -1.4 } }],
            'competences-scoring-configuration': [
              { competence: '1.1', values: [{ bounds: { max: -2, min: -10 }, competenceLevel: 0 }] },
            ],
            'challenges-configuration': {
              maximumAssessmentLength: 32,
              limitToOneQuestionPerTube: true,
              defaultCandidateCapacity: -3,
              defaultProbabilityToPickChallenge: 51,
              variationPercent: 0.5,
              enablePassageByAllCompetences: false,
            },
          },
        },
      });
    });
  });
});
