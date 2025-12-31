import * as serializer from '../../../../../../src/certification/configuration/infrastructure/serializers/certification-version-serializer.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { expect } from '../../../../../test-helper.js';

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
            },
          },
        },
      });
    });
  });

  describe('#deserialize()', function () {
    it('should convert JSON API format into a Version entity', function () {
      const json = {
        data: {
          id: '123',
          type: 'certification-versions',
          attributes: {
            scope: SCOPES.PIX_PLUS_DROIT,
            'start-date': '2024-01-01T00:00:00Z',
            'expiration-date': '2025-12-31T23:59:59Z',
            'assessment-duration': 120,
            'global-scoring-configuration': [{ meshLevel: 0, bounds: { min: -8, max: -1.4 } }],
            'competences-scoring-configuration': [
              { competence: '1.1', values: [{ bounds: { max: -2, min: -10 }, competenceLevel: 0 }] },
            ],
            'challenges-configuration': {
              maximumAssessmentLength: 32,
              defaultCandidateCapacity: -3,
              challengesBetweenSameCompetence: 0,
              variationPercent: 1,
              defaultProbabilityToPickChallenge: 51,
            },
          },
        },
      };

      const result = serializer.deserialize(json);

      expect(result.id).to.equal('123');
      expect(result.scope).to.equal(SCOPES.PIX_PLUS_DROIT);
      expect(result.startDate).to.deep.equal(new Date('2024-01-01T00:00:00Z'));
      expect(result.expirationDate).to.deep.equal(new Date('2025-12-31T23:59:59Z'));
      expect(result.assessmentDuration).to.equal(120);
      expect(result.globalScoringConfiguration).to.deep.equal([{ meshLevel: 0, bounds: { min: -8, max: -1.4 } }]);
      expect(result.competencesScoringConfiguration).to.deep.equal([
        { competence: '1.1', values: [{ bounds: { max: -2, min: -10 }, competenceLevel: 0 }] },
      ]);
      expect(result.challengesConfiguration).to.deep.equal({
        maximumAssessmentLength: 32,
        limitToOneQuestionPerTube: false,
        enablePassageByAllCompetences: false,
        defaultCandidateCapacity: -3,
        challengesBetweenSameCompetence: 0,
        variationPercent: 1,
        defaultProbabilityToPickChallenge: 51,
      });
    });
  });
});
