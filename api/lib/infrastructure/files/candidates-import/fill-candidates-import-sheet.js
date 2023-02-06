const writeOdsUtils = require('../../utils/ods/write-ods-utils');
const readOdsUtils = require('../../utils/ods/read-ods-utils');
const {
  EXTRA_EMPTY_CANDIDATE_ROWS,
  IMPORT_CANDIDATES_TEMPLATE_VALUES,
  IMPORT_CANDIDATES_SESSION_TEMPLATE_VALUES,
} = require('./candidates-import-placeholders');
const CertificationCandidate = require('../../../domain/models/CertificationCandidate');

const _ = require('lodash');
const CandidateData = require('./CandidateData');
const SessionData = require('./SessionData');

const billingValidatorList = Object.values(CertificationCandidate.BILLING_MODES).map(
  CertificationCandidate.translateBillingMode
);

const INFORMATIVE_HEADER_ROW = 8;
const HEADER_ROW_SPAN = 3;
const CANDIDATE_TABLE_HEADER_ROW = 11;
const CANDIDATE_TABLE_FIRST_ROW = 12;

module.exports = async function fillCandidatesImportSheet({
  session,
  certificationCenterHabilitations,
  isScoCertificationCenter,
}) {
  const template = await _getCandidatesImportTemplate();

  const odsBuilder = new writeOdsUtils.OdsUtilsBuilder(template);
  _addSession(odsBuilder, session);
  _addColumns({
    odsBuilder,
    certificationCenterHabilitations,
    isScoCertificationCenter,
  });
  _addCandidateRows(odsBuilder, session.certificationCandidates);

  return odsBuilder.build({ templateFilePath: _getCandidatesImportTemplatePath() });
};

async function _getCandidatesImportTemplate() {
  const templatePath = __dirname + '/1.5/candidates_import_template.ods';
  return readOdsUtils.getContentXml({ odsFilePath: templatePath });
}

function _addSession(odsBuilder, session) {
  const sessionData = SessionData.fromSession(session);
  return odsBuilder.withData(sessionData, IMPORT_CANDIDATES_SESSION_TEMPLATE_VALUES);
}

function _addColumns({ odsBuilder, certificationCenterHabilitations, isScoCertificationCenter }) {
  if (!isScoCertificationCenter) {
    odsBuilder
      .withTooltipOnCell({
        targetCellAddress: "'Liste des candidats'.O13",
        tooltipName: 'val-prepayment-code',
        tooltipTitle: 'Code de prépaiement',
        tooltipContentLines: [
          "(Requis notamment dans le cas d'un achat de crédits combinés)",
          'Doit être composé du SIRET de l’organisation et du numéro de facture. Ex : 12345678912345/FACT12345',
          'Si vous ne possédez pas de facture, un code de prépaiement doit être établi avec Pix.',
        ],
      })
      .withValidatorRestrictedList({
        validatorName: 'billingModeValidator',
        restrictedList: billingValidatorList,
        allowEmptyCell: false,
        tooltipTitle: 'Tarification part Pix',
        tooltipContentLines: ['Options possibles :', ...billingValidatorList.map((option) => `- ${option}`)],
      })
      .withColumnGroup({
        groupHeaderLabels: ['Tarification'],
        columns: [
          {
            headerLabel: ['Tarification part Pix'],
            placeholder: ['billingMode'],
          },
          {
            headerLabel: ['Code de prépaiement'],
            placeholder: ['prepaymentCode'],
          },
        ],
        startsAt: INFORMATIVE_HEADER_ROW,
        headerRowSpan: HEADER_ROW_SPAN,
        tableHeaderRow: CANDIDATE_TABLE_HEADER_ROW,
        tableFirstRow: CANDIDATE_TABLE_FIRST_ROW,
      });
  }
  odsBuilder = _addComplementaryCertificationColumns({ odsBuilder, certificationCenterHabilitations });

  return odsBuilder;
}

function _addComplementaryCertificationColumns({ odsBuilder, certificationCenterHabilitations }) {
  if (!_.isEmpty(certificationCenterHabilitations)) {
    const habilitationColumns = certificationCenterHabilitations.map(({ key, label }) => ({
      headerLabel: [label, '("oui" ou laisser vide)'],
      placeholder: [key],
    }));
    odsBuilder.withColumnGroup({
      groupHeaderLabels: ['Certification', 'complémentaire', '(une seule par candidat)'],
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

function _getCandidatesImportTemplatePath() {
  return __dirname + '/1.5/candidates_import_template.ods';
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
