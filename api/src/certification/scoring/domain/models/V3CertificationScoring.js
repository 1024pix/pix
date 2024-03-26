import { CompetenceForScoring } from './CompetenceForScoring.js';

export class V3CertificationScoring {
  constructor({ competencesForScoring, certificationScoringConfiguration }) {
    this._competencesForScoring = competencesForScoring;
    this._certificationScoringConfiguration = certificationScoringConfiguration;
  }

  getCompetencesScore(capacity) {
    return this._competencesForScoring.map((competenceForScoring) => competenceForScoring.getCompetenceMark(capacity));
  }

  getNumberOfIntervals() {
    return this._certificationScoringConfiguration.length;
  }

  getIntervals() {
    return this._certificationScoringConfiguration;
  }

  static fromConfigurations({
    competenceForScoringConfiguration,
    certificationScoringConfiguration,
    allAreas,
    competenceList,
  }) {
    const competencesForScoring = competenceForScoringConfiguration.map(({ competence: competenceCode, values }) => {
      const competence = competenceList.find(({ index: code }) => code === competenceCode);
      const area = allAreas.find((area) => area.id === competence.areaId);
      return new CompetenceForScoring({
        competenceId: competence.id,
        areaCode: area.code,
        competenceCode,
        intervals: values,
      });
    });

    return new V3CertificationScoring({
      competencesForScoring,
      certificationScoringConfiguration,
    });
  }
}
