const writeOdsUtils = require('../../utils/ods/write-ods-utils.js');
const readOdsUtils = require('../../utils/ods/read-ods-utils.js');
const {
  EXTRA_EMPTY_CANDIDATE_ROWS,
  IMPORT_CANDIDATES_TEMPLATE_VALUES,
  IMPORT_CANDIDATES_SESSION_TEMPLATE_VALUES,
} = require('./candidates-import-placeholders.js');
const CertificationCandidate = require('../../../domain/models/CertificationCandidate.js');

const _ = require('lodash');
const CandidateData = require('./CandidateData.js');
const SessionData = require('./SessionData.js');

const INFORMATIVE_HEADER_ROW = 8;
const HEADER_ROW_SPAN = 3;
const CANDIDATE_TABLE_HEADER_ROW = 11;
const CANDIDATE_TABLE_FIRST_ROW = 12;

module.exports = async function fillCandidatesImportSheet({
  session,
  certificationCenterHabilitations,
  isScoCertificationCenter,
  i18n,
}) {
  const locale = i18n.getLocale();
  const translate = i18n.__;
  const template = await _getCandidatesImportTemplate({ locale });

  const odsBuilder = new writeOdsUtils.OdsUtilsBuilder({ template, translate });
  _addSession(odsBuilder, session);
  _addColumns({
    odsBuilder,
    certificationCenterHabilitations,
    isScoCertificationCenter,
    translate,
  });
  _addCandidateRows(odsBuilder, session.certificationCandidates);

  return odsBuilder.build({ templateFilePath: _getCandidatesImportTemplatePath({ locale }) });
};

async function _getCandidatesImportTemplate({ locale }) {
  const templatePath = _getCandidatesImportTemplatePath({ locale });
  return readOdsUtils.getContentXml({ odsFilePath: templatePath });
}

function _addSession(odsBuilder, session) {
  const sessionData = SessionData.fromSession(session);
  return odsBuilder.withData(sessionData, IMPORT_CANDIDATES_SESSION_TEMPLATE_VALUES);
}

function _addColumns({ odsBuilder, certificationCenterHabilitations, isScoCertificationCenter, translate }) {
  if (!isScoCertificationCenter) {
    const title = translate('candidate-list-template.title');

    const billingValidatorList = Object.values(CertificationCandidate.BILLING_MODES).map((value) =>
      translate('candidate-list-template.billing-mode.' + value.toLowerCase())
    );

    odsBuilder
      .withTooltipOnCell({
        targetCellAddress: title + '.O13',
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

function _addCandidateRows(odsBuilder, certificationCandidates) {
  const CANDIDATE_ROW_MARKER_PLACEHOLDER = 'COUNT';
  const candidatesData = _getCandidatesData(certificationCandidates);
  return odsBuilder.updateXmlRows({
    rowMarkerPlaceholder: CANDIDATE_ROW_MARKER_PLACEHOLDER,
    rowTemplateValues: IMPORT_CANDIDATES_TEMPLATE_VALUES,
    dataToInject: candidatesData,
  });
}

function _getCandidatesData(certificationCandidates) {
  const enrolledCandidatesData = _certificationCandidatesToCandidatesData(certificationCandidates);

  const emptyCandidatesData = _emptyCandidatesData(enrolledCandidatesData.length);

  return enrolledCandidatesData.concat(emptyCandidatesData);
}

function _getCandidatesImportTemplatePath({ locale }) {
  return __dirname + '/1.5/candidates_import_template_' + locale + '.ods';
}

function _certificationCandidatesToCandidatesData(certificationCandidates) {
  return _.map(certificationCandidates, (candidate, index) => {
    return CandidateData.fromCertificationCandidateAndCandidateNumber(candidate, index + 1);
  });
}

function _emptyCandidatesData(numberOfEnrolledCandidates) {
  const emptyCandidates = [];
  _.times(EXTRA_EMPTY_CANDIDATE_ROWS, (index) => {
    const emptyCandidateData = CandidateData.empty(numberOfEnrolledCandidates + (index + 1));

    emptyCandidates.push(emptyCandidateData);
  });

  return emptyCandidates;
}
