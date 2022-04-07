const {
  PIX_EMPLOI_CLEA,
  PIX_EMPLOI_CLEA_V2,
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
} = require('./Badge').keys;

const PIX_COUNT_BY_LEVEL = 8;
const COMPETENCE_COUNT = 16;

class CertificationAttestation {
  constructor({
    id,
    firstName,
    lastName,
    birthdate,
    birthplace,
    isPublished,
    userId,
    date,
    deliveredAt,
    certificationCenter,
    pixScore,
    acquiredComplementaryCertifications,
    resultCompetenceTree = null,
    verificationCode,
    maxReachableLevelOnCertificationDate,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthdate = birthdate;
    this.birthplace = birthplace;
    this.isPublished = isPublished;
    this.userId = userId;
    this.date = date;
    this.deliveredAt = deliveredAt;
    this.certificationCenter = certificationCenter;
    this.pixScore = pixScore;
    this.acquiredComplementaryCertifications = acquiredComplementaryCertifications;
    this.resultCompetenceTree = resultCompetenceTree;
    this.verificationCode = verificationCode;
    this.maxReachableLevelOnCertificationDate = maxReachableLevelOnCertificationDate;
    this.maxReachableScore = this.maxReachableLevelOnCertificationDate * PIX_COUNT_BY_LEVEL * COMPETENCE_COUNT;
  }

  setResultCompetenceTree(resultCompetenceTree) {
    this.resultCompetenceTree = resultCompetenceTree;
  }

  getAcquiredCleaCertification() {
    return this.acquiredComplementaryCertifications.find(
      ({ partnerKey }) => partnerKey === PIX_EMPLOI_CLEA || partnerKey === PIX_EMPLOI_CLEA_V2
    )?.partnerKey;
  }

  getAcquiredPixPlusDroitCertification() {
    return this.acquiredComplementaryCertifications.find(
      ({ partnerKey }) => partnerKey === PIX_DROIT_MAITRE_CERTIF || partnerKey === PIX_DROIT_EXPERT_CERTIF
    )?.partnerKey;
  }

  getAcquiredPixPlusEduCertification() {
    return (
      this._findByPartnerKeyOrTemporaryPartnerKey(PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE) ||
      this._findByPartnerKeyOrTemporaryPartnerKey(PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME) ||
      this._findByPartnerKeyOrTemporaryPartnerKey(PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME) ||
      this._findByPartnerKeyOrTemporaryPartnerKey(PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE) ||
      this._findByPartnerKeyOrTemporaryPartnerKey(PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT)
    );
  }

  getPixPlusEduBadgeDisplayName() {
    const acquiredPixPlusEduCertification = this.getAcquiredPixPlusEduCertification();
    if (!acquiredPixPlusEduCertification) {
      return null;
    }

    const { partnerKey, temporaryPartnerKey } = acquiredPixPlusEduCertification;
    if (
      partnerKey === PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE ||
      temporaryPartnerKey === PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE
    ) {
      return 'Initié (entrée dans le métier)';
    }
    if (
      [PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME, PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME].includes(
        partnerKey
      ) ||
      [PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME, PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME].includes(
        temporaryPartnerKey
      )
    ) {
      return 'Confirmé';
    }
    if (
      partnerKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE ||
      temporaryPartnerKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE
    ) {
      return 'Avancé';
    }
    if (
      partnerKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT ||
      temporaryPartnerKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT
    ) {
      return 'Expert';
    }
  }

  hasAcquiredAnyComplementaryCertifications() {
    return this.acquiredComplementaryCertifications.length > 0;
  }

  _findByPartnerKeyOrTemporaryPartnerKey(key) {
    return this.acquiredComplementaryCertifications.find(
      ({ partnerKey, temporaryPartnerKey }) => partnerKey === key || temporaryPartnerKey === key
    );
  }
}

module.exports = CertificationAttestation;
