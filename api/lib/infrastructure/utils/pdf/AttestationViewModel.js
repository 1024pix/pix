const sortBy = require('lodash/sortBy');
const dayjs = require('dayjs');
dayjs.extend(require('dayjs/plugin/customParseFormat'));
const { toArrayOfFixedLengthStringsConservingWords } = require('../string-utils.js');

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
    stickers,
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
    this.competenceDetailViewModels = competenceDetailViewModels;
    this.verificationCode = verificationCode;
    this._maxReachableLevelOnCertificationDate = maxReachableLevelOnCertificationDate;
    this._hasAcquiredAnyComplementaryCertifications = hasAcquiredAnyComplementaryCertifications;
    this.stickers = stickers;
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
    const stickers = certificate.certifiedBadges.map(({ stickerUrl, message }) => {
      return {
        url: stickerUrl,
        messageParts: message ? toArrayOfFixedLengthStringsConservingWords(message, 45) : null,
      };
    });

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
      stickers,
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
  return dayjs(date).locale('fr').format('LL');
}

module.exports = AttestationViewModel;
