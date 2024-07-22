import * as url from 'node:url';

import _ from 'lodash';

import { CertificationCandidate } from '../../../../../../lib/domain/models/index.js';
import * as readOdsUtils from '../../../../../shared/infrastructure/utils/ods/read-ods-utils.js';
import * as writeOdsUtils from '../../../../../shared/infrastructure/utils/ods/write-ods-utils.js';
import { CandidateData } from './CandidateData.js';
import {
  EXTRA_EMPTY_CANDIDATE_ROWS,
  IMPORT_CANDIDATES_SESSION_TEMPLATE_HEADERS,
  IMPORT_CANDIDATES_SESSION_TEMPLATE_VALUES,
  IMPORT_CANDIDATES_TEMPLATE_VALUES,
} from './candidates-import-placeholders.js';
import { SessionData } from './SessionData.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const INFORMATIVE_HEADER_ROW = 8;
const HEADER_ROW_SPAN = 3;
const CANDIDATE_TABLE_HEADER_ROW = 11;
const CANDIDATE_TABLE_FIRST_ROW = 12;

const fillCandidatesImportSheet = async function ({
  session,
  certificationCenterHabilitations,
  isScoCertificationCenter,
  i18n,
}) {
  const locale = i18n.getLocale();
  const translate = i18n.__;
  const template = await _getCandidatesImportTemplate({ locale });

  const odsBuilder = new writeOdsUtils.OdsUtilsBuilder({ template, translate });

  odsBuilder.headersTranslation({ headersValues: IMPORT_CANDIDATES_SESSION_TEMPLATE_HEADERS, translate });

  _addSession(odsBuilder, session);
  _addColumns({
    odsBuilder,
    certificationCenterHabilitations,
    isScoCertificationCenter,
    translate,
  });
  _addCandidateRows({ odsBuilder, certificationCandidates: session.certificationCandidates, i18n });

  return odsBuilder.build({ templateFilePath: _getCandidatesImportTemplatePath() });
};

export { fillCandidatesImportSheet };

async function _getCandidatesImportTemplate() {
  const templatePath = _getCandidatesImportTemplatePath();
  return readOdsUtils.getContentXml({ odsFilePath: templatePath });
}

function _addSession(odsBuilder, session) {
  const sessionData = SessionData.fromSession(session);
  return odsBuilder.withData(sessionData, IMPORT_CANDIDATES_SESSION_TEMPLATE_VALUES);
}

function _addColumns({ odsBuilder, certificationCenterHabilitations, isScoCertificationCenter, translate }) {
  if (!isScoCertificationCenter) {
    const title = translate('candidate-list-template.headers.candidates-list');

    const billingValidatorList = Object.values(CertificationCandidate.BILLING_MODES).map((value) =>
      translate(`candidate-list-template.billing-mode.${value.toLowerCase()}`),
    );

    odsBuilder
      .withTooltipOnCell({
        targetCellAddress: `${title}.O13`,
        tooltipName: 'val-prepayment-code',
        tooltipTitle: translate('candidate-list-template.prepayment'),
        tooltipContentLines: [
          translate('candidate-list-template.tooltip-line-1'),
          translate('candidate-list-template.tooltip-line-2'),
          translate('candidate-list-template.tooltip-line-3'),
        ],
      })
      .withValidatorRestrictedList({
        validatorName: 'billingModeValidator',
        restrictedList: billingValidatorList,
        allowEmptyCell: false,
        tooltipTitle: translate('candidate-list-template.pricing-pix'),
        tooltipContentLines: [
          translate('candidate-list-template.options'),
          ...billingValidatorList.map((option) => `- ${option}`),
        ],
      })
      .withColumnGroup({
        groupHeaderLabels: [translate('candidate-list-template.pricing')],
        columns: [
          {
            headerLabel: [translate('candidate-list-template.pricing-pix')],
            placeholder: ['billingMode'],
          },
          {
            headerLabel: [translate('candidate-list-template.prepayment')],
            placeholder: ['prepaymentCode'],
          },
        ],
        startsAt: INFORMATIVE_HEADER_ROW,
        headerRowSpan: HEADER_ROW_SPAN,
        tableHeaderRow: CANDIDATE_TABLE_HEADER_ROW,
        tableFirstRow: CANDIDATE_TABLE_FIRST_ROW,
      });
  }
  odsBuilder = _addComplementaryCertificationColumns({ odsBuilder, certificationCenterHabilitations, translate });

  return odsBuilder;
}

function _addComplementaryCertificationColumns({ odsBuilder, certificationCenterHabilitations, translate }) {
  if (!_.isEmpty(certificationCenterHabilitations)) {
    const habilitationColumns = certificationCenterHabilitations.map(({ key, label }) => ({
      headerLabel: [label, translate('candidate-list-template.yes-or-empty')],
      placeholder: [key],
    }));
    odsBuilder.withColumnGroup({
      groupHeaderLabels: [
        translate('candidate-list-template.certification'),
        translate('candidate-list-template.complementary'),
        translate('candidate-list-template.one-per-candidate'),
      ],
      columns: habilitationColumns,
      startsAt: INFORMATIVE_HEADER_ROW,
      headerRowSpan: HEADER_ROW_SPAN,
      tableHeaderRow: CANDIDATE_TABLE_HEADER_ROW,
      tableFirstRow: CANDIDATE_TABLE_FIRST_ROW,
    });
  }
  return odsBuilder;
}

function _addCandidateRows({ odsBuilder, certificationCandidates, i18n }) {
  const CANDIDATE_ROW_MARKER_PLACEHOLDER = 'COUNT';
  const candidatesData = _getCandidatesData({ certificationCandidates, i18n });
  return odsBuilder.updateXmlRows({
    rowMarkerPlaceholder: CANDIDATE_ROW_MARKER_PLACEHOLDER,
    rowTemplateValues: IMPORT_CANDIDATES_TEMPLATE_VALUES,
    dataToInject: candidatesData,
  });
}

function _getCandidatesData({ certificationCandidates, i18n }) {
  const enrolledCandidatesData = _certificationCandidatesToCandidatesData({ certificationCandidates, i18n });

  const emptyCandidatesData = _emptyCandidatesData({ numberOfEnrolledCandidates: enrolledCandidatesData.length, i18n });

  return enrolledCandidatesData.concat(emptyCandidatesData);
}

function _getCandidatesImportTemplatePath() {
  return __dirname + '/1.5/candidates_import_template.ods';
}

function _certificationCandidatesToCandidatesData({ certificationCandidates, i18n }) {
  return _.map(certificationCandidates, (candidate, index) => {
    return CandidateData.fromCertificationCandidateAndCandidateNumber({
      certificationCandidate: candidate,
      number: index + 1,
      i18n,
    });
  });
}

function _emptyCandidatesData({ numberOfEnrolledCandidates, i18n }) {
  const emptyCandidates = [];
  _.times(EXTRA_EMPTY_CANDIDATE_ROWS, (index) => {
    const emptyCandidateData = CandidateData.empty({
      number: numberOfEnrolledCandidates + (index + 1),
      i18n,
    });

    emptyCandidates.push(emptyCandidateData);
  });

  return emptyCandidates;
}
