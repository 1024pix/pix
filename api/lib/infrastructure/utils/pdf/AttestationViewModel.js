const sortBy = require('lodash/sortBy');
const moment = require('moment');

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
    certificationDate,
    verificationCode,
    maxReachableLevelOnCertificationDate,
    hasAcquiredAnyComplementaryCertifications,
    cleaCertificationImagePath,
    hasAcquiredPixPlusDroitCertification,
    hasAcquiredCleaCertification,
    pixPlusDroitCertificationImagePath,
    competenceDetailViewModels,
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
    this.certificationDate = certificationDate;
    this.cleaCertificationImagePath = cleaCertificationImagePath;
    this.pixPlusDroitCertificationImagePath = pixPlusDroitCertificationImagePath;
    this.competenceDetailViewModels = competenceDetailViewModels;
    this.verificationCode = verificationCode;
    this._maxReachableLevelOnCertificationDate = maxReachableLevelOnCertificationDate;
    this._hasAcquiredAnyComplementaryCertifications = hasAcquiredAnyComplementaryCertifications;
    this._hasAcquiredPixPlusDroitCertification = hasAcquiredPixPlusDroitCertification;
    this._hasAcquiredCleaCertification = hasAcquiredCleaCertification;
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

  static from(certificate) {
    const pixScore = certificate.pixScore.toString();
    const maxReachableScore = certificate.maxReachableScore.toString() + '*';

    const maxLevel = `(niveaux sur ${certificate.maxReachableLevelOnCertificationDate})`;
    const maxReachableLevelIndication = `* À la date d’obtention de cette certification, le nombre maximum de pix atteignable était de ${certificate.maxReachableScore}, correspondant au niveau ${certificate.maxReachableLevelOnCertificationDate}.`;
    const absoluteMaxLevelIndication = 'Lorsque les 8 niveaux du référentiel Pix seront disponibles, ce nombre maximum sera de 1024 pix.';

    const verificationCode = certificate.verificationCode;

    const fullName = `${certificate.firstName} ${certificate.lastName}`;
    const birthplace = certificate.birthplace ? ` à ${certificate.birthplace}` : '';
    const birth = _formatDate(certificate.birthdate) + birthplace;
    const certificationCenter = certificate.certificationCenter;
    const certificationDate = _formatDate(certificate.deliveredAt);

    const maxReachableLevelOnCertificationDate = certificate.maxReachableLevelOnCertificationDate < 8;
    const hasAcquiredAnyComplementaryCertifications = certificate.hasAcquiredAnyComplementaryCertifications();
    const cleaCertificationImagePath = certificate.cleaCertificationImagePath;
    const hasAcquiredPixPlusDroitCertification = certificate.hasAcquiredPixPlusDroitCertification();
    const hasAcquiredCleaCertification = certificate.hasAcquiredCleaCertification();
    const pixPlusDroitCertificationImagePath = certificate.pixPlusDroitCertificationImagePath;

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
      certificationDate,
      maxReachableLevelOnCertificationDate,
      hasAcquiredAnyComplementaryCertifications,
      cleaCertificationImagePath,
      pixPlusDroitCertificationImagePath,
      hasAcquiredPixPlusDroitCertification,
      hasAcquiredCleaCertification,
      competenceDetailViewModels,
    });
  }
}

class CompetenceDetailViewModel {
  constructor({
    level,
    levelValue,
  }) {
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
