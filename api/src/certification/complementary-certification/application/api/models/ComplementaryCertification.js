export class ComplementaryCertification {
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
    this.minimumReproducibilityRate = minimumReproducibilityRate;
    this.hasComplementaryReferential = hasComplementaryReferential;
    this.hasExternalJury = hasExternalJury;
    this.certificationExtraTime = certificationExtraTime;
  }
}
