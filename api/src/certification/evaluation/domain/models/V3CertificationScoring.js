import { CompetenceForScoring } from './CompetenceForScoring.js';

export class V3CertificationScoring {
  constructor({
    competencesForScoring,
    certificationScoringConfiguration,
    minimumAnswersRequiredToValidateACertification,
    maxReachableLevel,
    maxReachablePixScore,
    versionId,
  }) {
    this._competencesForScoring = competencesForScoring;
    this._certificationScoringConfiguration = certificationScoringConfiguration;
    this.minimumAnswersRequiredToValidateACertification = minimumAnswersRequiredToValidateACertification;
    this.maxReachableLevel = maxReachableLevel;
    this.maxReachablePixScore = maxReachablePixScore;
    this.versionId = versionId;
  }

  getCompetencesScore(capacity) {
    return this._competencesForScoring.map((competenceForScoring) => competenceForScoring.getCompetenceMark(capacity));
  }

  get intervals() {
    return this._certificationScoringConfiguration;
  }

  get competencesForScoring() {
    return this._competencesForScoring;
  }

  static fromConfigurations({
    competenceForScoringConfiguration,
    certificationScoringConfiguration,
    allAreas,
    competenceList,
    minimumAnswersRequiredToValidateACertification,
    maxReachableLevel,
    maxReachablePixScore,
    versionId,
  }) {
    const competencesForScoring =
      competenceForScoringConfiguration?.map(({ competenceId, values }) => {
        const competence = competenceList.find(({ id }) => id === competenceId);
        const area = allAreas.find((area) => area.id === competence.areaId);
        return new CompetenceForScoring({
          competenceId: competence.id,
          areaCode: area.code,
          competenceCode: competence.index,
          intervals: values,
        });
      }) || [];

    return new V3CertificationScoring({
      competencesForScoring,
      certificationScoringConfiguration,
      minimumAnswersRequiredToValidateACertification,
      maxReachableLevel,
      maxReachablePixScore,
      versionId,
    });
  }
}
