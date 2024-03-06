import dayjs from 'dayjs';

const I18N_VALUES_PREFIX = 'certification-results-csv.values';

class CertificationResultsCsvValues {
  static VALUES = {
    REJECTED_AUTOMATICALLY_COMMENT: `${I18N_VALUES_PREFIX}.REJECTED_AUTOMATICALLY_COMMENT`,
    CERTIFICATION_CANCELLED: `${I18N_VALUES_PREFIX}.CERTIFICATION_CANCELLED`,
    CERTIFICATION_IN_ERROR: `${I18N_VALUES_PREFIX}.CERTIFICATION_IN_ERROR`,
    CERTIFICATION_REJECTED: `${I18N_VALUES_PREFIX}.CERTIFICATION_REJECTED`,
    CERTIFICATION_STARTED: `${I18N_VALUES_PREFIX}.CERTIFICATION_STARTED`,
    CERTIFICATION_VALIDATED: `${I18N_VALUES_PREFIX}.CERTIFICATION_VALIDATED`,
    COMPLEMENTARY_CERTIFICATION_CANCELLED: `${I18N_VALUES_PREFIX}.COMPLEMENTARY_CERTIFICATION_CANCELLED`,
    COMPLEMENTARY_CERTIFICATION_NOT_DONE: `${I18N_VALUES_PREFIX}.COMPLEMENTARY_CERTIFICATION_NOT_DONE`,
    COMPLEMENTARY_CERTIFICATION_REJECTED: `${I18N_VALUES_PREFIX}.COMPLEMENTARY_CERTIFICATION_REJECTED`,
    COMPLEMENTARY_CERTIFICATION_VALIDATED: `${I18N_VALUES_PREFIX}.COMPLEMENTARY_CERTIFICATION_VALIDATED`,
  };

  constructor(i18n) {
    this.translate = i18n.__;
  }

  getTranslation(headerKey, params = {}) {
    return this.translate(headerKey, params);
  }

  formatDate(date) {
    return dayjs(date).format('DD/MM/YYYY');
  }

  formatStatus(certificationResult) {
    if (certificationResult.isCancelled()) {
      return this.getTranslation(CertificationResultsCsvValues.VALUES.CERTIFICATION_CANCELLED);
    }
    if (certificationResult.isValidated()) {
      return this.getTranslation(CertificationResultsCsvValues.VALUES.CERTIFICATION_VALIDATED);
    }
    if (certificationResult.isRejected()) {
      return this.getTranslation(CertificationResultsCsvValues.VALUES.CERTIFICATION_REJECTED);
    }
    if (certificationResult.isInError()) {
      return this.getTranslation(CertificationResultsCsvValues.VALUES.CERTIFICATION_IN_ERROR);
    }
    if (certificationResult.isStarted()) {
      return this.getTranslation(CertificationResultsCsvValues.VALUES.CERTIFICATION_STARTED);
    }
  }

  formatPixScore(certificationResult) {
    if (certificationResult.isCancelled() || certificationResult.isInError()) {
      return '-';
    }
    if (certificationResult.isRejected()) {
      return '0';
    }
    return certificationResult.pixScore;
  }

  #isCompetenceFailed(competence) {
    return competence.level <= 0;
  }

  #getLevelByCompetenceCode({ competencesWithMark }) {
    return competencesWithMark.reduce((result, competence) => {
      const competenceCode = competence.competence_code;
      result[competenceCode] = { level: competence.level };
      return result;
    }, {});
  }

  getCompetenceLevel({ certificationResult, competenceIndex }) {
    const competencesWithMark = certificationResult.competencesWithMark;
    const levelByCompetenceCode = this.#getLevelByCompetenceCode({ competencesWithMark });
    const competence = levelByCompetenceCode[competenceIndex];
    const notTestedCompetence = !competence;

    if (notTestedCompetence || certificationResult.isCancelled() || certificationResult.isInError()) {
      return '-';
    }
    if (certificationResult.isRejected() || this.#isCompetenceFailed(competence)) {
      return 0;
    }
    return competence.level;
  }

  getCommentForOrganization(certificationResult) {
    return certificationResult.commentForOrganization?.getComment(this.translate);
  }

  getComplementaryCertificationStatus({ certificationResult, sessionComplementaryCertificationsLabel }) {
    if (certificationResult.isCancelled()) {
      return this.getTranslation(CertificationResultsCsvValues.VALUES.COMPLEMENTARY_CERTIFICATION_CANCELLED);
    }
    const complementaryCertificationCourseResult = certificationResult.complementaryCertificationCourseResults.find(
      ({ label }) => label === sessionComplementaryCertificationsLabel,
    );

    let status = this.getTranslation(CertificationResultsCsvValues.VALUES.COMPLEMENTARY_CERTIFICATION_NOT_DONE);
    if (complementaryCertificationCourseResult) {
      status = this.getTranslation(
        complementaryCertificationCourseResult.acquired
          ? CertificationResultsCsvValues.VALUES.COMPLEMENTARY_CERTIFICATION_VALIDATED
          : CertificationResultsCsvValues.VALUES.COMPLEMENTARY_CERTIFICATION_REJECTED,
      );
    }
    return status;
  }

  *generateRowValues() {
    const row = {};
    let index = 0;
    let state = { done: false };

    do {
      state = yield;

      if (state && 'value' in state) {
        row[`col${index}`] = state.value;
        index++;
      }
    } while (!state?.done);

    return row;
  }
}

export { CertificationResultsCsvValues };
