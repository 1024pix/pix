import { expect } from 'chai';
import sinon from 'sinon';

import { V3CertificationScoring } from '../../../../../../src/certification/evaluation/domain/models/V3CertificationScoring.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Evaluation | Unit | Domain | Models | V3CertificationScoring', function () {
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

  describe('#getter maxReachableLevel', function () {
    it('should return the competences score', function () {
      const certificationScoringConfiguration = ['someMeshForLevel0', 'someMeshForLevel1', 'someMeshForLevel2'];
      const v3CertificationScoring = new V3CertificationScoring({
        competencesForScoring: [],
        certificationScoringConfiguration,
      });

      expect(v3CertificationScoring.maxReachableLevel).to.equal(2);
    });
  });

  describe('#versionId', function () {
    it('should return the versionId', function () {
      const v3CertificationScoring = new V3CertificationScoring({
        competencesForScoring: [],
        certificationScoringConfiguration: [],
        versionId: 42,
      });

      expect(v3CertificationScoring.versionId).to.equal(42);
    });
  });

  describe('#fromConfigurations', function () {
    it('should return a valid V3CertificationScoring', function () {
      const area = domainBuilder.buildArea();
      const competence = domainBuilder.buildCompetence({ id: 'myCompetenceId', areaId: area.id });

      const competenceForScoringConfiguration = [
        {
          competenceId: competence.id,
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
        versionId: 99,
      });

      expect(v3CertificationScoring.versionId).to.equal(99);
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
