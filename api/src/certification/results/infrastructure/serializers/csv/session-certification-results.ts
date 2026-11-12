import { I18n } from 'i18n';
import papa from 'papaparse';

import { Frameworks } from '../../../../shared/domain/models/Frameworks.js';
import { CERTIFICATION_RESULT_STATUSES } from '../../../domain/constants.ts';
import type { CertificationResultForCsv } from '../../../domain/read-models/CertificationResultForCsv.ts';

const I18N_VALUES_PREFIX = 'certification-results-csv.values';
const I18N_HEADERS_PREFIX = 'certification-results-csv.headers';

const allFrameworks = [
  Frameworks.CORE,
  Frameworks.CLEA,
  Frameworks.PRO_SANTE,
  Frameworks.DROIT,
  Frameworks.EDU_2ND_DEGRE,
  Frameworks.EDU_1ER_DEGRE,
  Frameworks.EDU_CPE,
];
const ALL_HEADERS = [
  {
    key: 'certificationId',
    label: `${I18N_HEADERS_PREFIX}.CERTIFICATION_NUMBER`,
    toTranslate: true,
    frameworks: allFrameworks,
  },
  {
    key: 'firstName',
    label: `${I18N_HEADERS_PREFIX}.FIRSTNAME`,
    toTranslate: true,
    frameworks: allFrameworks,
  },
  {
    key: 'lastName',
    label: `${I18N_HEADERS_PREFIX}.LASTNAME`,
    toTranslate: true,
    frameworks: allFrameworks,
  },
  {
    key: 'birthdate',
    label: `${I18N_HEADERS_PREFIX}.BIRTHDATE`,
    toTranslate: true,
    frameworks: allFrameworks,
  },
  {
    key: 'birthplace',
    label: `${I18N_HEADERS_PREFIX}.BIRTHPLACE`,
    toTranslate: true,
    frameworks: allFrameworks,
  },
  {
    key: 'externalId',
    label: `${I18N_HEADERS_PREFIX}.EXTERNAL_ID`,
    toTranslate: true,
    frameworks: allFrameworks,
  },
  {
    key: 'framework',
    label: `${I18N_HEADERS_PREFIX}.TYPE`,
    toTranslate: true,
    frameworks: allFrameworks,
  },
  {
    key: 'status',
    label: `${I18N_HEADERS_PREFIX}.STATUS`,
    toTranslate: true,
    frameworks: allFrameworks,
  },
  {
    key: 'cleaStatus',
    label: `${I18N_HEADERS_PREFIX}.CERTIFICATION_CLEA`,
    toTranslate: true,
    frameworks: [Frameworks.CLEA],
  },
  {
    key: 'reachedMeshIndex',
    label: `${I18N_HEADERS_PREFIX}.REACHED_LEVEL`,
    toTranslate: true,
    frameworks: allFrameworks,
  },
  {
    key: 'pixScore',
    label: `${I18N_HEADERS_PREFIX}.SCORE`,
    toTranslate: true,
    frameworks: [Frameworks.CORE, Frameworks.CLEA],
  },
  {
    key: '1.1',
    label: '1.1',
    toTranslate: false,
    frameworks: [Frameworks.CORE, Frameworks.CLEA],
  },
  {
    key: '1.2',
    label: '1.2',
    toTranslate: false,
    frameworks: [Frameworks.CORE, Frameworks.CLEA],
  },
  {
    key: '1.3',
    label: '1.3',
    toTranslate: false,
    frameworks: [Frameworks.CORE, Frameworks.CLEA],
  },
  {
    key: '2.1',
    label: '2.1',
    toTranslate: false,
    frameworks: [Frameworks.CORE, Frameworks.CLEA],
  },
  {
    key: '2.2',
    label: '2.2',
    toTranslate: false,
    frameworks: [Frameworks.CORE, Frameworks.CLEA],
  },
  {
    key: '2.3',
    label: '2.3',
    toTranslate: false,
    frameworks: [Frameworks.CORE, Frameworks.CLEA],
  },
  {
    key: '2.4',
    label: '2.4',
    toTranslate: false,
    frameworks: [Frameworks.CORE, Frameworks.CLEA],
  },
  {
    key: '3.1',
    label: '3.1',
    toTranslate: false,
    frameworks: [Frameworks.CORE, Frameworks.CLEA],
  },
  {
    key: '3.2',
    label: '3.2',
    toTranslate: false,
    frameworks: [Frameworks.CORE, Frameworks.CLEA],
  },
  {
    key: '3.3',
    label: '3.3',
    toTranslate: false,
    frameworks: [Frameworks.CORE, Frameworks.CLEA],
  },
  {
    key: '3.4',
    label: '3.4',
    toTranslate: false,
    frameworks: [Frameworks.CORE, Frameworks.CLEA],
  },
  {
    key: '4.1',
    label: '4.1',
    toTranslate: false,
    frameworks: [Frameworks.CORE, Frameworks.CLEA],
  },
  {
    key: '4.2',
    label: '4.2',
    toTranslate: false,
    frameworks: [Frameworks.CORE, Frameworks.CLEA],
  },
  {
    key: '4.3',
    label: '4.3',
    toTranslate: false,
    frameworks: [Frameworks.CORE, Frameworks.CLEA],
  },
  {
    key: '5.1',
    label: '5.1',
    toTranslate: false,
    frameworks: [Frameworks.CORE, Frameworks.CLEA],
  },
  {
    key: '5.2',
    label: '5.2',
    toTranslate: false,
    frameworks: [Frameworks.CORE, Frameworks.CLEA],
  },
  {
    key: 'commentForOrganization',
    label: `${I18N_HEADERS_PREFIX}.JURY_COMMENT_FOR_ORGANIZATION`,
    toTranslate: true,
    frameworks: allFrameworks,
  },
  {
    key: 'sessionId',
    label: `${I18N_HEADERS_PREFIX}.SESSION_ID`,
    toTranslate: true,
    frameworks: allFrameworks,
  },
  {
    key: 'certificationCenter',
    label: `${I18N_HEADERS_PREFIX}.CERTIFICATION_CENTER`,
    toTranslate: true,
    frameworks: allFrameworks,
  },
  {
    key: 'startedAt',
    label: `${I18N_HEADERS_PREFIX}.CERTIFICATION_DATE`,
    toTranslate: true,
    frameworks: allFrameworks,
  },
];

type Row = (string | number | null | undefined)[];

export function serialize(certificationResults: CertificationResultForCsv[], i18n: I18n): string {
  const data: Row[] = [];
  const frameworksInCertification = new Set(certificationResults.map(({ framework }) => framework));
  const headersToKeep = structuredClone(ALL_HEADERS).filter(
    ({ frameworks }) => frameworksInCertification.intersection(new Set(frameworks)).size > 0,
  );
  data.push(
    headersToKeep.map((header) => {
      if (header.toTranslate) {
        return i18n.__(header.label);
      }
      return header.label;
    }),
  );

  const competenceCodeRegex = /^\d\.\d$/;
  for (const certificationResult of certificationResults) {
    const row: Row = [];
    for (const header of headersToKeep) {
      if (header.key === 'certificationId') {
        row.push(certificationResult.certificationId);
      }
      if (header.key === 'firstName') {
        row.push(certificationResult.firstName);
      }
      if (header.key === 'lastName') {
        row.push(certificationResult.lastName);
      }
      if (header.key === 'birthdate') {
        row.push(formatDate(certificationResult.birthdate, i18n));
      }
      if (header.key === 'birthplace') {
        row.push(certificationResult.birthplace);
      }
      if (header.key === 'externalId') {
        row.push(certificationResult.externalId);
      }
      if (header.key === 'framework') {
        row.push(i18n.__(`certification.labels.${certificationResult.framework}`));
      }
      if (header.key === 'status') {
        row.push(formatStatus(certificationResult, i18n));
      }
      if (header.key === 'cleaStatus') {
        row.push(formatCleaStatus(certificationResult, i18n));
      }
      if (header.key === 'reachedMeshIndex') {
        row.push(formatReachedLevel(certificationResult, i18n));
      }
      if (header.key === 'pixScore') {
        row.push(formatPixScore(certificationResult));
      }
      if (competenceCodeRegex.test(header.key)) {
        row.push(formatCompetenceLevel(certificationResult, header.key));
      }
      if (header.key === 'commentForOrganization') {
        row.push(certificationResult.getCommentForOrganization((key) => i18n.__(key)));
      }
      if (header.key === 'sessionId') {
        row.push(certificationResult.sessionId);
      }
      if (header.key === 'certificationCenter') {
        row.push(certificationResult.certificationCenter);
      }
      if (header.key === 'startedAt') {
        row.push(formatDate(certificationResult.startedAt, i18n));
      }
    }
    data.push(row);
  }
  // '\uFEFF' character is UTF-8 BOM (Byte Order Mark). Its here for compatibility reasons with spreadsheet applications, to help
  // such applications understanding the character encoding
  return (
    '\uFEFF' +
    papa.unparse(data, {
      quotes: true,
      quoteChar: '"',
      delimiter: ';',
      header: true,
      newline: '\n',
    })
  );
}

function formatStatus(certificationResult: CertificationResultForCsv, i18n: I18n) {
  if (certificationResult.status === CERTIFICATION_RESULT_STATUSES.CANCELLED) {
    return i18n.__(`${I18N_VALUES_PREFIX}.CERTIFICATION_CANCELLED`);
  }
  if (certificationResult.status === CERTIFICATION_RESULT_STATUSES.REJECTED) {
    return i18n.__(`${I18N_VALUES_PREFIX}.CERTIFICATION_REJECTED`);
  }
  if (certificationResult.status === CERTIFICATION_RESULT_STATUSES.VALIDATED) {
    return i18n.__(`${I18N_VALUES_PREFIX}.CERTIFICATION_VALIDATED`);
  }
}

function formatCleaStatus(certificationResult: CertificationResultForCsv, i18n: I18n) {
  if (certificationResult.framework !== Frameworks.CLEA) {
    return i18n.__(`${I18N_VALUES_PREFIX}.COMPLEMENTARY_CERTIFICATION_NOT_DONE`);
  }
  if (certificationResult.status === CERTIFICATION_RESULT_STATUSES.CANCELLED) {
    return i18n.__(`${I18N_VALUES_PREFIX}.COMPLEMENTARY_CERTIFICATION_CANCELLED`);
  }
  if (certificationResult.status === CERTIFICATION_RESULT_STATUSES.REJECTED) {
    return i18n.__(`${I18N_VALUES_PREFIX}.COMPLEMENTARY_CERTIFICATION_REJECTED`);
  }
  if (certificationResult.status === CERTIFICATION_RESULT_STATUSES.VALIDATED) {
    if (certificationResult.hasAcquiredClea) {
      return i18n.__(`${I18N_VALUES_PREFIX}.COMPLEMENTARY_CERTIFICATION_VALIDATED`);
    }
    return i18n.__(`${I18N_VALUES_PREFIX}.COMPLEMENTARY_CERTIFICATION_REJECTED`);
  }
}

function formatDate(date: Date | string, i18n: I18n) {
  return new Intl.DateTimeFormat(i18n.getLocale()).format(new Date(date));
}

function formatReachedLevel(certificationResult: CertificationResultForCsv, i18n: I18n) {
  if (certificationResult.status === CERTIFICATION_RESULT_STATUSES.CANCELLED) {
    return '-';
  }
  if (certificationResult.status === CERTIFICATION_RESULT_STATUSES.REJECTED) {
    return i18n.__(`${I18N_VALUES_PREFIX}.meshLevels.${certificationResult.framework}.BELOW_MINIMUM`);
  }
  if (certificationResult.status === CERTIFICATION_RESULT_STATUSES.VALIDATED) {
    return i18n.__(
      `${I18N_VALUES_PREFIX}.meshLevels.${certificationResult.framework}.${certificationResult.reachedMeshIndex}`,
    );
  }
}

function formatPixScore(certificationResult: CertificationResultForCsv) {
  if (certificationResult.status === CERTIFICATION_RESULT_STATUSES.CANCELLED) {
    return '-';
  }
  if (certificationResult.status === CERTIFICATION_RESULT_STATUSES.REJECTED) {
    return 0;
  }
  if (certificationResult.status === CERTIFICATION_RESULT_STATUSES.VALIDATED) {
    return certificationResult.pixScore;
  }
}

function formatCompetenceLevel(certificationResult: CertificationResultForCsv, competenceCode: string) {
  if (certificationResult.status === CERTIFICATION_RESULT_STATUSES.CANCELLED) {
    return '-';
  }
  if (certificationResult.status === CERTIFICATION_RESULT_STATUSES.REJECTED) {
    return '-';
  }
  const competenceMark = certificationResult.competenceMarks.find(
    (currentCompetenceMark) => currentCompetenceMark.competenceCode === competenceCode,
  );
  return competenceMark ? Math.max(competenceMark.level, 0) : '-';
}
