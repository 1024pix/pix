const I18N_HEADERS_PREFIX = 'certification-results-csv.headers';

class CertificationResultsCsvHeaders {
  static HEADERS = {
    CERTIFICATION_NUMBER: `${I18N_HEADERS_PREFIX}.CERTIFICATION_NUMBER`,
    FIRSTNAME: `${I18N_HEADERS_PREFIX}.FIRSTNAME`,
    LASTNAME: `${I18N_HEADERS_PREFIX}.LASTNAME`,
    BIRTHDATE: `${I18N_HEADERS_PREFIX}.BIRTHDATE`,
    BIRTHPLACE: `${I18N_HEADERS_PREFIX}.BIRTHPLACE`,
    EXTERNAL_ID: `${I18N_HEADERS_PREFIX}.EXTERNAL_ID`,
    STATUS: `${I18N_HEADERS_PREFIX}.STATUS`,
    CERTIFICATION_LABEL: `${I18N_HEADERS_PREFIX}.CERTIFICATION_LABEL`,
    SKILL_LABEL: `${I18N_HEADERS_PREFIX}.SKILL_LABEL`,
    PIX_SCORE: `${I18N_HEADERS_PREFIX}.PIX_SCORE`,
    JURY_COMMENT_FOR_ORGANIZATION: `${I18N_HEADERS_PREFIX}.JURY_COMMENT_FOR_ORGANIZATION`,
    SESSION_ID: `${I18N_HEADERS_PREFIX}.SESSION_ID`,
    CERTIFICATION_CENTER: `${I18N_HEADERS_PREFIX}.CERTIFICATION_CENTER`,
    CERTIFICATION_DATE: `${I18N_HEADERS_PREFIX}.CERTIFICATION_DATE`,
  };

  static COMPETENCE_INDEXES = [
    '1.1',
    '1.2',
    '1.3',
    '2.1',
    '2.2',
    '2.3',
    '2.4',
    '3.1',
    '3.2',
    '3.3',
    '3.4',
    '4.1',
    '4.2',
    '4.3',
    '5.1',
    '5.2',
  ];

  constructor(i18n) {
    this.translate = i18n.__;
  }

  getColumn(columnIndex, headerKey, headerParams = {}) {
    return {
      value: `col${columnIndex}`,
      label: this.translate(CertificationResultsCsvHeaders.HEADERS[headerKey], headerParams),
    };
  }

  *generateHeaders() {
    const headers = [];
    let index = 0;
    let state = { done: false };

    do {
      state = yield;

      // usage: generator.next({ headerKey, headerParams })
      if (state?.headerKey) {
        headers.push(this.getColumn(index, state.headerKey, state.headerParams));
        index++;
      }
    } while (!state?.done);

    return headers;
  }
}

export { CertificationResultsCsvHeaders };
