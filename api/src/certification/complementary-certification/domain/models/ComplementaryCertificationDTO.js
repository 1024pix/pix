class ComplementaryCertificationDTO {
  constructor({
    id,
    label,
    key,
    createdAt,
    minimumReproducibilityRate,
    hasComplementaryReferential,
    hasExternalJury,
    certificationExtraTime,
  }) {
    this.id = id;
    this.label = label;
    this.key = key;
    this.createdAt = createdAt;
    this.minimumReproducibilityRate = parseFloat(minimumReproducibilityRate);
    this.hasComplementaryReferential = hasComplementaryReferential;
    this.hasExternalJury = hasExternalJury;
    this.certificationExtraTime = certificationExtraTime;
  }
}
export { ComplementaryCertificationDTO };
