const {
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
} = require('../models/Badge').keys;

const { getLabelByBadgeKey } = require('../read-models/CertifiableBadgeLabels');

const pixEdu1stDegreeBadges = [
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
];

const pixEdu2ndDegreeBadges = [
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
];

const { EXTERNAL, PIX } = require('../models/ComplementaryCertificationCourseResult').sources;

class ComplementaryCertificationCourseResultsForJuryCertificationWithExternal {
  constructor({
    complementaryCertificationCourseId,
    pixPartnerKey,
    pixLabel,
    pixAcquired,
    externalPartnerKey,
    externalLabel,
    externalAcquired,
  }) {
    this.complementaryCertificationCourseId = complementaryCertificationCourseId;
    this.pixSection = new PixEduSection({ partnerKey: pixPartnerKey, label: pixLabel, acquired: pixAcquired });
    this.externalSection = new PixEduSection({
      partnerKey: externalPartnerKey,
      label: externalLabel,
      acquired: externalAcquired,
    });
  }

  static from(complementaryCertificationCourseResultsWithExternal) {
    if (!complementaryCertificationCourseResultsWithExternal.length) {
      return;
    }
    const pixComplementaryCertificationCourseResult = complementaryCertificationCourseResultsWithExternal.find(
      ({ source }) => source === PIX
    );
    const externalComplementaryCertificationCourseResult = complementaryCertificationCourseResultsWithExternal.find(
      ({ source }) => source === EXTERNAL
    );

    return new ComplementaryCertificationCourseResultsForJuryCertificationWithExternal({
      complementaryCertificationCourseId:
        complementaryCertificationCourseResultsWithExternal[0].complementaryCertificationCourseId,
      pixPartnerKey: pixComplementaryCertificationCourseResult?.partnerKey,
      pixLabel: pixComplementaryCertificationCourseResult?.label,
      pixAcquired: pixComplementaryCertificationCourseResult?.acquired,
      externalPartnerKey: externalComplementaryCertificationCourseResult?.partnerKey,
      externalLabel: externalComplementaryCertificationCourseResult?.label,
      externalAcquired: externalComplementaryCertificationCourseResult?.acquired,
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
    if (this.pixSection._isPixEdu1erDegre() && this.externalSection._isPixEdu1erDegre())
      return this._getLowestPartnerKeyLabelForPixEdu1erDegreBadge();
    if (this.pixSection._isPixEdu2ndDegre() && this.externalSection._isPixEdu2ndDegre())
      return this._getLowestPartnerKeyLabelForPixEdu2ndDegreBadge();
    throw new Error(`Badges edu incoherent !!! ${this.pixSection.partnerKey} et ${this.externalSection.partnerKey}`);
  }

  get allowedExternalLevels() {
    const partnerKey = this.pixSection.partnerKey;
    let filteredBadges;
    if (this._isInitial1stDegree(partnerKey)) {
      filteredBadges = pixEdu1stDegreeBadges.filter(this._isInitial1stDegree);
    }
    if (this._isContinue1stDegree(partnerKey)) {
      filteredBadges = pixEdu1stDegreeBadges.filter(this._isContinue1stDegree);
    }
    if (this._isInitial2ndDegree(partnerKey)) {
      filteredBadges = pixEdu2ndDegreeBadges.filter(this._isInitial2ndDegree);
    }
    if (this._isContinue2ndDegree(partnerKey)) {
      filteredBadges = pixEdu2ndDegreeBadges.filter(this._isContinue2ndDegree);
    }

    if (!filteredBadges.length) {
      throw new Error('Unknown pix level');
    }

    return filteredBadges.map((badge) => {
      return {
        label: getLabelByBadgeKey(badge),
        value: badge,
      };
    });
  }

  _isInitial1stDegree(partnerKey) {
    return partnerKey.startsWith('PIX_EDU_FORMATION_INITIALE_1ER_DEGRE');
  }
  _isContinue1stDegree(partnerKey) {
    return partnerKey.startsWith('PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE');
  }
  _isInitial2ndDegree(partnerKey) {
    return partnerKey.startsWith('PIX_EDU_FORMATION_INITIALE_2ND_DEGRE');
  }
  _isContinue2ndDegree(partnerKey) {
    return partnerKey.startsWith('PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE');
  }

  _getLowestPartnerKeyLabelForPixEdu2ndDegreBadge() {
    const firstIndexOf = pixEdu2ndDegreeBadges.indexOf(this.pixSection.partnerKey);
    const secondIndexOf = pixEdu2ndDegreeBadges.indexOf(this.externalSection.partnerKey);

    return firstIndexOf <= secondIndexOf ? this.pixSection.label : this.externalSection.label;
  }

  _getLowestPartnerKeyLabelForPixEdu1erDegreBadge() {
    const firstIndexOf = pixEdu1stDegreeBadges.indexOf(this.pixSection.partnerKey);
    const secondIndexOf = pixEdu1stDegreeBadges.indexOf(this.externalSection.partnerKey);

    return firstIndexOf <= secondIndexOf ? this.pixSection.label : this.externalSection.label;
  }
}

class PixEduSection {
  constructor({ partnerKey, label, acquired }) {
    this.partnerKey = partnerKey;
    this.label = label;
    this.acquired = acquired ?? false;
  }

  get isEvaluated() {
    return Boolean(this.partnerKey);
  }

  _isPixEdu2ndDegre() {
    return pixEdu2ndDegreeBadges.includes(this.partnerKey);
  }

  _isPixEdu1erDegre() {
    return pixEdu1stDegreeBadges.includes(this.partnerKey);
  }
}

module.exports = ComplementaryCertificationCourseResultsForJuryCertificationWithExternal;
