export class ParticipationDataset {
  constructor({
    schoolUai,
    schoolYear,
    academieName,
    schoolName,
    provinceCode,
    schoolYearGroup,
    competenceCode,
    competenceName,
    participantCount,
    standardDeviation,
    firstDecileLevel,
    firstQuartileLevel,
    medianLevel,
    thirdQuartileLevel,
    ninthDecileLevel,
    averageMaxLevelReached,
    averageMaxLevelReachable,
    coverage,
    updatedAt,
  }) {
    this.schoolUai = schoolUai;
    this.schoolYear = schoolYear;
    this.academieName = academieName;
    this.schoolName = schoolName;
    this.provinceCode = provinceCode;
    this.schoolYearGroup = schoolYearGroup;
    this.competenceCode = competenceCode;
    this.competenceName = competenceName;
    this.participantCount = participantCount;
    this.standardDeviation = standardDeviation;
    this.firstDecileLevel = firstDecileLevel;
    this.firstQuartileLevel = firstQuartileLevel;
    this.medianLevel = medianLevel;
    this.thirdQuartileLevel = thirdQuartileLevel;
    this.ninthDecileLevel = ninthDecileLevel;
    this.averageMaxLevelReached = averageMaxLevelReached;
    this.averageMaxLevelReachable = averageMaxLevelReachable;
    this.coverage = coverage;
    this.updatedAt = updatedAt;
  }
}
