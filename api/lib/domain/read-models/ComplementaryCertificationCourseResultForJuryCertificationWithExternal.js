import lodash from 'lodash';

const { minBy } = lodash;

import { juryOptions, sources } from '../models/ComplementaryCertificationCourseResult.js';

const { EXTERNAL, PIX } = sources;

class ComplementaryCertificationCourseResultForJuryCertificationWithExternal {
  constructor({
    complementaryCertificationCourseId,
    pixComplementaryCertificationBadgeId,
    pixLabel,
    pixAcquired,
    pixLevel,
    externalComplementaryCertificationBadgeId,
    externalLabel,
    externalAcquired,
    externalLevel,
    allowedExternalLevels,
  }) {
    this.complementaryCertificationCourseId = complementaryCertificationCourseId;
    this.pixSection = new Section({
      complementaryCertificationBadgeId: pixComplementaryCertificationBadgeId,
      label: pixLabel,
      acquired: pixAcquired,
      level: pixLevel,
    });
    this.externalSection = new Section({
      complementaryCertificationBadgeId: externalComplementaryCertificationBadgeId,
      label: externalLabel,
      acquired: externalAcquired,
      level: externalLevel,
    });
    this.allowedExternalLevels = allowedExternalLevels;
    this.defaultJuryOptions = Object.values(juryOptions);
  }

  static from(complementaryCertificationCourseResultWithExternal, badgesIdAndLabels) {
    if (!complementaryCertificationCourseResultWithExternal.length) {
      return;
    }
    const pixComplementaryCertificationCourseResult = complementaryCertificationCourseResultWithExternal.find(
      ({ source }) => source === PIX,
    );
    const externalComplementaryCertificationCourseResult = complementaryCertificationCourseResultWithExternal.find(
      ({ source }) => source === EXTERNAL,
    );

    const allowedExternalLevels = badgesIdAndLabels.map(({ id, label }) => ({ label, value: id }));

    return new ComplementaryCertificationCourseResultForJuryCertificationWithExternal({
      complementaryCertificationCourseId:
        complementaryCertificationCourseResultWithExternal[0].complementaryCertificationCourseId,
      pixComplementaryCertificationBadgeId:
        pixComplementaryCertificationCourseResult?.complementaryCertificationBadgeId,
      pixLabel: pixComplementaryCertificationCourseResult?.label,
      pixAcquired: pixComplementaryCertificationCourseResult?.acquired,
      pixLevel: pixComplementaryCertificationCourseResult?.level,
      externalComplementaryCertificationBadgeId:
        externalComplementaryCertificationCourseResult?.complementaryCertificationBadgeId,
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
  constructor({ complementaryCertificationBadgeId, label, acquired, level }) {
    this.complementaryCertificationBadgeId = complementaryCertificationBadgeId;
    this.label = label;
    this.acquired = acquired ?? false;
    this.level = level;
  }

  get isEvaluated() {
    return Boolean(this.complementaryCertificationBadgeId);
  }
}

export { ComplementaryCertificationCourseResultForJuryCertificationWithExternal };
