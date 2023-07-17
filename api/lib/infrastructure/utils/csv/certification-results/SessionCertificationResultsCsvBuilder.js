import { CertificationResultsCsvHeaders } from './CertificationResultsCsvHeaders.js';
import { CertificationResultsCsvValues } from './CertificationResultsCsvValues.js';

class SessionCertificationResultsCsvBuilder {
  #session = {};
  #certificationResults = [];
  #csvHeaders;
  #csvValues;

  constructor({ i18n, session = {}, certificationResults = [] }) {
    this.#session = session;
    this.#certificationResults = certificationResults;
    this.#csvHeaders = new CertificationResultsCsvHeaders(i18n);
    this.#csvValues = new CertificationResultsCsvValues(i18n);
  }

  #getComplementaryCertificationResultsLabels() {
    return [
      ...new Set(
        this.#certificationResults.flatMap((certificationResult) =>
          certificationResult.getUniqComplementaryCertificationCourseResultLabels(),
        ),
      ),
    ];
  }

  #buildFileHeaders() {
    const headersGenerator = this.#csvHeaders.generateHeaders();
    headersGenerator.next();

    ['CERTIFICATION_NUMBER', 'FIRSTNAME', 'LASTNAME', 'BIRTHDATE', 'BIRTHPLACE', 'EXTERNAL_ID', 'STATUS'].forEach(
      (headerKey) => headersGenerator.next({ headerKey }),
    );

    this.#getComplementaryCertificationResultsLabels().forEach((label) =>
      headersGenerator.next({
        headerKey: 'CERTIFICATION_LABEL',
        headerParams: { label },
      }),
    );

    headersGenerator.next({ headerKey: 'PIX_SCORE' });

    CertificationResultsCsvHeaders.COMPETENCE_INDEXES.forEach((skillIndex) =>
      headersGenerator.next({
        headerKey: 'SKILL_LABEL',
        headerParams: { skillIndex },
      }),
    );

    ['JURY_COMMENT_FOR_ORGANIZATION', 'SESSION_ID', 'CERTIFICATION_CENTER', 'CERTIFICATION_DATE'].forEach((headerKey) =>
      headersGenerator.next({ headerKey }),
    );

    return headersGenerator.next({ done: true }).value;
  }

  #buildData() {
    const complementaryCertificationResultsLabels = this.#getComplementaryCertificationResultsLabels();

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

      complementaryCertificationResultsLabels.forEach((sessionComplementaryCertificationsLabel) =>
        rowGenerator.next({
          value: this.#csvValues.getComplementaryCertificationStatus({
            certificationResult,
            sessionComplementaryCertificationsLabel,
          }),
        }),
      );

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
      rowGenerator.next({ value: this.#session.id });
      rowGenerator.next({ value: this.#session.certificationCenter });
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

export { SessionCertificationResultsCsvBuilder };
