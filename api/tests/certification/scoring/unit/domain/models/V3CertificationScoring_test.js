import { V3CertificationScoring } from '../../../../../../src/certification/scoring/domain/models/V3CertificationScoring.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Certification | V3CertificationScoring', function () {
  describe('#getCompetencesScore', function () {
    it('should return the competences score', function () {
      // Given
      const capacity = 3;
      const competence1Score = 1;
      const competence2Score = 2;
      const competenceForScoring1 = {
        getCompetenceMark: sinon.stub(),
      };
      const competenceForScoring2 = {
        getCompetenceMark: sinon.stub(),
      };

      const competence1Mark = domainBuilder.buildCompetenceMark({ score: competence1Score });
      const competence2Mark = domainBuilder.buildCompetenceMark({ score: competence2Score });

      competenceForScoring1.getCompetenceMark.withArgs(capacity).returns(competence1Mark);
      competenceForScoring2.getCompetenceMark.withArgs(capacity).returns(competence2Mark);
      const competencesForScoring = [competenceForScoring1, competenceForScoring2];
      const certificationScoringConfiguration = {};

      const v3CertificationScoring = new V3CertificationScoring({
        competencesForScoring,
        certificationScoringConfiguration,
      });

      // When
      const competencesScore = v3CertificationScoring.getCompetencesScore(capacity);

      // Then
      expect(competencesScore).to.deep.equal([competence1Mark, competence2Mark]);
    });
  });

  describe('#fromConfigurations', function () {
    it('should return a valid V3CertificationScoring', function () {
      const area = domainBuilder.buildArea();
      const competence = domainBuilder.buildCompetence({ areaId: area.id });
      const competenceForScoringConfiguration = [
        {
          competence: competence.index,
          values: [
            {
              competenceLevel: 0,
              bounds: { min: -1, max: 0 },
            },
            {
              competenceLevel: 1,
              bounds: { min: 0, max: 1 },
            },
          ],
        },
      ];

      const v3CertificationScoring = V3CertificationScoring.fromConfigurations({
        competenceForScoringConfiguration,
        certificationScoringConfiguration: {},
        allAreas: [area],
        competenceList: [competence],
      });

      expect(v3CertificationScoring.getCompetencesScore(0.5)).to.deep.equal([
        domainBuilder.buildCompetenceMark({
          competenceId: competence.id,
          area_code: area.code,
          competence_code: competence.index,
          level: 1,
          score: 0,
        }),
      ]);
    });
  });
});
