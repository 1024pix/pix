import lodash from 'lodash';

const { minBy } = lodash;

import { juryOptions, sources } from '../models/ComplementaryCertificationCourseResult.js';

const { EXTERNAL, PIX } = sources;

class ComplementaryCertificationCourseResultForJuryCertificationWithExternal {
  constructor({
    complementaryCertificationCourseId,
    pixPartnerKey,
    pixLabel,
    pixAcquired,
    pixLevel,
    externalPartnerKey,
    externalLabel,
    externalAcquired,
    externalLevel,
    allowedExternalLevels,
  }) {
    this.complementaryCertificationCourseId = complementaryCertificationCourseId;
    this.pixSection = new Section({
      partnerKey: pixPartnerKey,
      label: pixLabel,
      acquired: pixAcquired,
      level: pixLevel,
    });
    this.externalSection = new Section({
      partnerKey: externalPartnerKey,
      label: externalLabel,
      acquired: externalAcquired,
      level: externalLevel,
    });
    this.allowedExternalLevels = allowedExternalLevels;
    this.defaultJuryOptions = Object.values(juryOptions);
  }

  static from(complementaryCertificationCourseResultWithExternal, badgesKeyAndLabel) {
    if (!complementaryCertificationCourseResultWithExternal.length) {
      return;
    }
    const pixComplementaryCertificationCourseResult = complementaryCertificationCourseResultWithExternal.find(
      ({ source }) => source === PIX,
    );
    const externalComplementaryCertificationCourseResult = complementaryCertificationCourseResultWithExternal.find(
      ({ source }) => source === EXTERNAL,
    );

    const allowedExternalLevels = badgesKeyAndLabel.map(({ key, label }) => ({ label, value: key }));

    return new ComplementaryCertificationCourseResultForJuryCertificationWithExternal({
      complementaryCertificationCourseId:
        complementaryCertificationCourseResultWithExternal[0].complementaryCertificationCourseId,
      pixPartnerKey: pixComplementaryCertificationCourseResult?.partnerKey,
      pixLabel: pixComplementaryCertificationCourseResult?.label,
      pixAcquired: pixComplementaryCertificationCourseResult?.acquired,
      pixLevel: pixComplementaryCertificationCourseResult?.level,
      externalPartnerKey: externalComplementaryCertificationCourseResult?.partnerKey,
      externalLabel: externalComplementaryCertificationCourseResult?.label,
      externalAcquired: externalComplementaryCertificationCourseResult?.acquired,
      externalLevel: externalComplementaryCertificationCourseResult?.level,
      allowedExternalLevels,
    });
  }

  get pixResult() {
    if (!this.pixSection.isEvaluated) return null;
    if (!this.pixSection.acquired) return 'Rejetée';
    return this.pixSection.label;
  }

  get externalResult() {
    if (!this.pixSection.acquired) return '-';
    if (!this.externalSection.isEvaluated) return 'En attente';
    if (!this.externalSection.acquired) return 'Rejetée';
    return this.externalSection.label;
  }

  get finalResult() {
    if (!this.pixSection.acquired) return 'Rejetée';
    if (!this.externalSection.isEvaluated) return 'En attente volet jury';
    if (!this.externalSection.acquired) return 'Rejetée';
    return minBy([this.pixSection, this.externalSection], ({ level }) => level).label;
  }
}

class Section {
  constructor({ partnerKey, label, acquired, level }) {
    this.partnerKey = partnerKey;
    this.label = label;
    this.acquired = acquired ?? false;
    this.level = level;
  }

  get isEvaluated() {
    return Boolean(this.partnerKey);
  }
}

export { ComplementaryCertificationCourseResultForJuryCertificationWithExternal };
