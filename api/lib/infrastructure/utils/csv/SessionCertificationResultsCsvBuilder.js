import { CertificationResultsCsvHeaders } from './CertificationResultsCsvHeaders.js';

class SessionCertificationResultsCsvBuilder {
  #certificationResults = [];
  #csvHeaders = [];

  constructor(i18n) {
    this.#certificationResults = [];
    this.#csvHeaders = new CertificationResultsCsvHeaders(i18n);
  }

  #getComplementaryCertificationResultsLabels() {
    return [
      ...new Set(
        this.#certificationResults.flatMap((certificationResult) =>
          certificationResult.getUniqComplementaryCertificationCourseResultLabels()
        )
      ),
    ];
  }

  withCertificationResults(certificationResults) {
    this.#certificationResults = certificationResults;
    return this;
  }

  buildFileHeaders() {
    const headersGenerator = this.#csvHeaders.generateHeaders();
    headersGenerator.next();

    ['CERTIFICATION_NUMBER', 'FIRSTNAME', 'LASTNAME', 'BIRTHDATE', 'BIRTHPLACE', 'EXTERNAL_ID', 'STATUS'].forEach(
      (headerKey) => headersGenerator.next({ headerKey })
    );

    this.#getComplementaryCertificationResultsLabels().forEach((label) =>
      headersGenerator.next({
        headerKey: 'CERTIFICATION_LABEL',
        headerParams: { label },
      })
    );

    headersGenerator.next({ headerKey: 'PIX_SCORE' });

    CertificationResultsCsvHeaders.COMPETENCE_INDEXES.forEach((skillIndex) =>
      headersGenerator.next({
        headerKey: 'SKILL_LABEL',
        headerParams: { skillIndex },
      })
    );

    ['JURY_COMMENT_FOR_ORGANIZATION', 'SESSION_ID', 'CERTIFICATION_CENTER', 'CERTIFICATION_DATE'].forEach((headerKey) =>
      headersGenerator.next({ headerKey })
    );

    return headersGenerator.next({ done: true }).value;
  }
}

export { SessionCertificationResultsCsvBuilder };
