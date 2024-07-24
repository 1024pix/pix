import { CertificationResultsCsvHeaders } from './CertificationResultsCsvHeaders.js';
import { CertificationResultsCsvValues } from './CertificationResultsCsvValues.js';

class DivisionCertificationResultsCsvBuilder {
  #certificationResults = [];
  #csvHeaders;
  #csvValues;

  constructor({ i18n, certificationResults = [] }) {
    this.#certificationResults = certificationResults;
    this.#csvHeaders = new CertificationResultsCsvHeaders(i18n);
    this.#csvValues = new CertificationResultsCsvValues(i18n);
  }

  #buildFileHeaders() {
    const headersGenerator = this.#csvHeaders.generateHeaders();
    headersGenerator.next();

    [
      'CERTIFICATION_NUMBER',
      'FIRSTNAME',
      'LASTNAME',
      'BIRTHDATE',
      'BIRTHPLACE',
      'EXTERNAL_ID',
      'STATUS',
      'PIX_SCORE',
    ].forEach((headerKey) => headersGenerator.next({ headerKey }));

    CertificationResultsCsvHeaders.COMPETENCE_INDEXES.forEach((skillIndex) =>
      headersGenerator.next({
        headerKey: 'SKILL_LABEL',
        headerParams: { skillIndex },
      }),
    );

    ['JURY_COMMENT_FOR_ORGANIZATION', 'SESSION_ID', 'CERTIFICATION_DATE'].forEach((headerKey) =>
      headersGenerator.next({ headerKey }),
    );

    return headersGenerator.next({ done: true }).value;
  }

  #buildData() {
    return this.#certificationResults.map((certificationResult) => {
      const rowGenerator = this.#csvValues.generateRowValues();
      rowGenerator.next();

      rowGenerator.next({ value: certificationResult.id });
      rowGenerator.next({ value: certificationResult.firstName });
      rowGenerator.next({ value: certificationResult.lastName });
      rowGenerator.next({ value: this.#csvValues.formatDate(certificationResult.birthdate) });
      rowGenerator.next({ value: certificationResult.birthplace });
      rowGenerator.next({ value: certificationResult.externalId });
      rowGenerator.next({ value: this.#csvValues.formatStatus(certificationResult) });
      rowGenerator.next({ value: this.#csvValues.formatPixScore(certificationResult) });
      CertificationResultsCsvHeaders.COMPETENCE_INDEXES.forEach((competenceIndex) =>
        rowGenerator.next({
          value: this.#csvValues.getCompetenceLevel({
            competenceIndex,
            certificationResult,
          }),
        }),
      );
      rowGenerator.next({ value: this.#csvValues.getCommentForOrganization(certificationResult) });
      rowGenerator.next({ value: certificationResult.sessionId });
      rowGenerator.next({ value: this.#csvValues.formatDate(certificationResult.createdAt) });

      return rowGenerator.next({ done: true }).value;
    });
  }

  build() {
    return {
      fileHeaders: this.#buildFileHeaders(),
      data: this.#buildData(),
    };
  }
}

export { DivisionCertificationResultsCsvBuilder };
