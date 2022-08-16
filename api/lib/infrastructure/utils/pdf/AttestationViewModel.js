const sortBy = require('lodash/sortBy');
const moment = require('moment');
const getImagePathByBadgeKey = require('./get-image-path-by-badge-key');
const { toArrayOfFixedLengthStringsConservingWords } = require('../string-utils');

const PROFESSIONALIZING_VALIDITY_START_DATE = new Date('2022-01-01');

class AttestationViewModel {
  constructor({
    pixScore,
    maxReachableScore,
    maxLevel,
    absoluteMaxLevelIndication,
    maxReachableLevelIndication,
    fullName,
    birthplace,
    birth,
    certificationCenter,
    deliveredAt,
    verificationCode,
    maxReachableLevelOnCertificationDate,
    hasAcquiredAnyComplementaryCertifications,
    cleaCertificationImagePath,
    hasAcquiredPixPlusDroitCertification,
    hasAcquiredCleaCertification,
    pixPlusDroitCertificationImagePath,
    hasAcquiredPixPlusEduCertification,
    pixPlusEduCertificationImagePath,
    pixPlusEduBadgeMessage,
    competenceDetailViewModels,
    isFrenchDomainExtension,
  }) {
    this.pixScore = pixScore;
    this.maxReachableScore = maxReachableScore;
    this.maxLevel = maxLevel;
    this.absoluteMaxLevelIndication = absoluteMaxLevelIndication;
    this.maxReachableLevelIndication = maxReachableLevelIndication;
    this.fullName = fullName;
    this.birthplace = birthplace;
    this.birth = birth;
    this.certificationCenter = certificationCenter;
    this._deliveredAt = deliveredAt;
    this.cleaCertificationImagePath = cleaCertificationImagePath;
    this.pixPlusDroitCertificationImagePath = pixPlusDroitCertificationImagePath;
    this.pixPlusEduCertificationImagePath = pixPlusEduCertificationImagePath;
    this.pixPlusEduBadgeMessage = pixPlusEduBadgeMessage;
    this.competenceDetailViewModels = competenceDetailViewModels;
    this.verificationCode = verificationCode;
    this._maxReachableLevelOnCertificationDate = maxReachableLevelOnCertificationDate;
    this._hasAcquiredAnyComplementaryCertifications = hasAcquiredAnyComplementaryCertifications;
    this._hasAcquiredPixPlusDroitCertification = hasAcquiredPixPlusDroitCertification;
    this._hasAcquiredCleaCertification = hasAcquiredCleaCertification;
    this._hasAcquiredPixPlusEduCertification = hasAcquiredPixPlusEduCertification;
    this._isFrenchDomainExtension = isFrenchDomainExtension;
  }

  get certificationDate() {
    return _formatDate(this._deliveredAt);
  }

  shouldDisplayComplementaryCertifications() {
    return this._hasAcquiredAnyComplementaryCertifications;
  }

  shouldDisplayAbsoluteMaxLevelIndication() {
    return this._maxReachableLevelOnCertificationDate < 8;
  }

  shouldDisplayCleaCertification() {
    return Boolean(this._hasAcquiredCleaCertification);
  }

  shouldDisplayPixPlusDroitCertification() {
    return Boolean(this._hasAcquiredPixPlusDroitCertification);
  }

  shouldDisplayPixPlusEduCertification() {
    return Boolean(this._hasAcquiredPixPlusEduCertification);
  }

  shouldDisplayProfessionalizingCertificationMessage() {
    if (!this._isFrenchDomainExtension) return false;
    if (!this._deliveredAt) return false;
    return this._deliveredAt.getTime() >= PROFESSIONALIZING_VALIDITY_START_DATE.getTime();
  }

  static from(certificate, isFrenchDomainExtension) {
    const pixScore = certificate.pixScore.toString();
    const maxReachableScore = certificate.maxReachableScore.toString() + '*';

    const maxLevel = `(niveaux sur ${certificate.maxReachableLevelOnCertificationDate})`;
    const maxReachableLevelIndication = `* À la date d’obtention de cette certification, le nombre maximum de pix atteignable était de ${certificate.maxReachableScore}, correspondant au niveau ${certificate.maxReachableLevelOnCertificationDate}.`;
    const absoluteMaxLevelIndication =
      'Lorsque les 8 niveaux du référentiel Pix seront disponibles, ce nombre maximum sera de 1024 pix.';

    const verificationCode = certificate.verificationCode;

    const fullName = `${certificate.firstName} ${certificate.lastName}`;
    const birthplace = certificate.birthplace ? ` à ${certificate.birthplace}` : '';
    const birth = _formatDate(certificate.birthdate) + birthplace;
    const certificationCenter = certificate.certificationCenter;
    const deliveredAt = certificate.deliveredAt;

    const maxReachableLevelOnCertificationDate = certificate.maxReachableLevelOnCertificationDate < 8;
    const hasAcquiredAnyComplementaryCertifications = certificate.hasAcquiredAnyComplementaryCertifications();

    let hasAcquiredCleaCertification = false;
    let cleaCertificationImagePath;
    if (certificate.getAcquiredCleaCertification()) {
      hasAcquiredCleaCertification = true;
      cleaCertificationImagePath = getImagePathByBadgeKey(certificate.getAcquiredCleaCertification());
    }

    let hasAcquiredPixPlusDroitCertification = false;
    let pixPlusDroitCertificationImagePath;
    if (certificate.getAcquiredPixPlusDroitCertification()) {
      hasAcquiredPixPlusDroitCertification = true;
      pixPlusDroitCertificationImagePath = getImagePathByBadgeKey(certificate.getAcquiredPixPlusDroitCertification());
    }

    let hasAcquiredPixPlusEduCertification = false;
    let pixPlusEduCertificationImagePath;
    let pixPlusEduBadgeMessage;
    if (certificate.getAcquiredPixPlusEduCertification()) {
      hasAcquiredPixPlusEduCertification = true;
      const { partnerKey, isTemporaryBadge, label } = certificate.getAcquiredPixPlusEduCertification();
      const levelName = label.replace(/Pix\+ Édu (1er|2nd) degré /, '');
      const message = isTemporaryBadge
        ? `Vous avez obtenu le niveau “${levelName}” dans le cadre du volet 1 de la certification Pix+Édu. Votre niveau final sera déterminé à l’issue du volet 2`
        : `Vous avez obtenu la certification Pix+Edu niveau "${levelName}"`;
      pixPlusEduCertificationImagePath = getImagePathByBadgeKey(partnerKey);
      pixPlusEduBadgeMessage = toArrayOfFixedLengthStringsConservingWords(message, 45);
    }

    const sortedCompetenceTree = sortBy(certificate.resultCompetenceTree.areas, 'code');
    const competenceDetailViewModels = sortedCompetenceTree.flatMap((area) => {
      return area.resultCompetences.map((competence) => {
        return CompetenceDetailViewModel.from(competence);
      });
    });

    return new AttestationViewModel({
      pixScore,
      maxReachableScore,
      maxLevel,
      verificationCode,
      maxReachableLevelIndication,
      absoluteMaxLevelIndication,
      fullName,
      birthplace,
      birth,
      certificationCenter,
      deliveredAt,
      maxReachableLevelOnCertificationDate,
      hasAcquiredAnyComplementaryCertifications,
      cleaCertificationImagePath,
      pixPlusDroitCertificationImagePath,
      pixPlusEduCertificationImagePath,
      pixPlusEduBadgeMessage,
      hasAcquiredPixPlusDroitCertification,
      hasAcquiredCleaCertification,
      hasAcquiredPixPlusEduCertification,
      competenceDetailViewModels,
      isFrenchDomainExtension,
    });
  }
}

class CompetenceDetailViewModel {
  constructor({ level, levelValue }) {
    this.level = level;
    this._levelValue = levelValue;
  }

  shouldBeDisplayed() {
    return this._levelValue > 0;
  }

  static from(competence) {
    return new CompetenceDetailViewModel({
      level: competence.level.toString(),
      levelValue: competence.level,
    });
  }
}

function _formatDate(date) {
  return moment(date).locale('fr').format('LL');
}

module.exports = AttestationViewModel;
