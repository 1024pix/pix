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

const pixEduCertificationLabels = {
  [PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE]: 'Pix+ Édu Initié (entrée dans le métier)',
  [PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME]: 'Pix+ Édu Confirmé',
  [PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME]: 'Pix+ Édu Confirmé',
  [PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE]: 'Pix+ Édu Avancé',
  [PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT]: 'Pix+ Édu Expert',
  [PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE]: 'Pix+ Édu Initié (entrée dans le métier)',
  [PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME]: 'Pix+ Édu Confirmé',
  [PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME]: 'Pix+ Édu Confirmé',
  [PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE]: 'Pix+ Édu Avancé',
  [PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT]: 'Pix+ Édu Expert',
};

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

class ComplementaryCertificationCourseResultsForJuryCertificationWithExternal {
  constructor({
    complementaryCertificationCourseId,
    pixPartnerKey,
    pixAcquired,
    externalPartnerKey,
    externalAcquired,
  }) {
    this.complementaryCertificationCourseId = complementaryCertificationCourseId;
    this.pixSection = new PixEduSection({ partnerKey: pixPartnerKey, acquired: pixAcquired });
    this.externalSection = new PixEduSection({ partnerKey: externalPartnerKey, acquired: externalAcquired });
  }

  static from(complementaryCertificationCourseResultsWithExternal) {
    if (!complementaryCertificationCourseResultsWithExternal.length) {
      return;
    }
    const pixComplementaryCertificationCourseResult = complementaryCertificationCourseResultsWithExternal.find(
      ({ source }) => source === 'PIX'
    );
    const externalComplementaryCertificationCourseResult = complementaryCertificationCourseResultsWithExternal.find(
      ({ source }) => source === 'EXTERNAL'
    );

    return new ComplementaryCertificationCourseResultsForJuryCertificationWithExternal({
      complementaryCertificationCourseId:
        complementaryCertificationCourseResultsWithExternal[0].complementaryCertificationCourseId,
      pixPartnerKey: pixComplementaryCertificationCourseResult?.partnerKey,
      pixAcquired: pixComplementaryCertificationCourseResult?.acquired,
      externalPartnerKey: externalComplementaryCertificationCourseResult?.partnerKey,
      externalAcquired: externalComplementaryCertificationCourseResult?.acquired,
    });
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

  _getLowestPartnerKeyLabelForPixEdu2ndDegreBadge() {
    const firstIndexOf = pixEdu2ndDegreeBadges.indexOf(this.pixSection.partnerKey);
    const secondIndexOf = pixEdu2ndDegreeBadges.indexOf(this.externalSection.partnerKey);

    return firstIndexOf <= secondIndexOf
      ? pixEduCertificationLabels[this.pixSection.partnerKey]
      : pixEduCertificationLabels[this.externalSection.partnerKey];
  }

  _getLowestPartnerKeyLabelForPixEdu1erDegreBadge() {
    const firstIndexOf = pixEdu1stDegreeBadges.indexOf(this.pixSection.partnerKey);
    const secondIndexOf = pixEdu1stDegreeBadges.indexOf(this.externalSection.partnerKey);

    return firstIndexOf <= secondIndexOf
      ? pixEduCertificationLabels[this.pixSection.partnerKey]
      : pixEduCertificationLabels[this.externalSection.partnerKey];
  }
}

class PixEduSection {
  constructor({ partnerKey, acquired }) {
    this.partnerKey = partnerKey;
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

ComplementaryCertificationCourseResultsForJuryCertificationWithExternal.labels = pixEduCertificationLabels;

module.exports = ComplementaryCertificationCourseResultsForJuryCertificationWithExternal;
