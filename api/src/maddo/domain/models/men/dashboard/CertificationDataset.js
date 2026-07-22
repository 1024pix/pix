export class CertificationDataset {
  constructor({
    schoolUai,
    schoolYear,
    academieName,
    schoolName,
    provinceCode,
    schoolYearGroup,
    validatedCertificationCount,
    certificationCount,
    averagePixScore,
    competenceCode,
    avgCompetenceLevel,
    updatedAt,
  }) {
    this.schoolUai = schoolUai;
    this.schoolYear = schoolYear;
    this.academieName = academieName;
    this.schoolName = schoolName;
    this.provinceCode = provinceCode;
    this.schoolYearGroup = schoolYearGroup;
    this.validatedCertificationCount = validatedCertificationCount;
    this.certificationCount = certificationCount;
    this.averagePixScore = averagePixScore;
    this.competenceCode = competenceCode;
    this.avgCompetenceLevel = avgCompetenceLevel;
    this.updatedAt = updatedAt;
  }
}
