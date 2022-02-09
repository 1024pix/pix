const writeOdsUtils = require('../../utils/ods/write-ods-utils');
const readOdsUtils = require('../../utils/ods/read-ods-utils');
const sessionXmlService = require('../../../domain/services/session-xml-service');
const { featureToggles } = require('../../../../lib/config');
const {
  EXTRA_EMPTY_CANDIDATE_ROWS,
  IMPORT_CANDIDATES_TEMPLATE_VALUES,
  IMPORT_CANDIDATES_SESSION_TEMPLATE_VALUES,
} = require('./candidates-import-placeholders');

const _ = require('lodash');
const CandidateData = require('./CandidateData');
const SessionData = require('./SessionData');

const billingValidatorList = ['Gratuite', 'Payante', 'Prépayée'];

module.exports = async function fillCandidatesImportSheet({
  session,
  certificationCenterHabilitations,
  isScoCertificationCenter,
}) {
  const template = await _getCandidatesImportTemplate();

  const templateWithSession = _addSession(template, session);
  const templateWithSessionAndColumns = _addColumns({
    stringifiedXml: templateWithSession,
    certificationCenterHabilitations,
    isScoCertificationCenter,
  });
  const templateWithSessionAndColumnsAndCandidates = _addCandidates(
    templateWithSessionAndColumns,
    session.certificationCandidates
  );

  return writeOdsUtils.makeUpdatedOdsByContentXml({
    stringifiedXml: templateWithSessionAndColumnsAndCandidates,
    odsFilePath: _getCandidatesImportTemplatePath(),
  });
};

async function _getCandidatesImportTemplate() {
  const templatePath = __dirname + '/1.5/candidates_import_template.ods';
  return readOdsUtils.getContentXml({ odsFilePath: templatePath });
}

function _addSession(stringifiedXml, session) {
  const sessionData = SessionData.fromSession(session);
  const templateWithSession = sessionXmlService.getUpdatedXmlWithSessionData({
    stringifiedXml,
    sessionData,
    sessionTemplateValues: IMPORT_CANDIDATES_SESSION_TEMPLATE_VALUES,
  });
  return templateWithSession;
}

function _addColumns({ stringifiedXml, certificationCenterHabilitations, isScoCertificationCenter }) {
  if (featureToggles.isCertificationBillingEnabled && !isScoCertificationCenter) {
    stringifiedXml = writeOdsUtils.addValidatorRestrictedList({
      stringifiedXml,
      validatorName: 'billingModeValidator',
      restrictedList: billingValidatorList,
      allowEmptyCell: false,
    });
    stringifiedXml = _addBillingColumns(stringifiedXml);
  }
  if (featureToggles.isComplementaryCertificationSubscriptionEnabled) {
    stringifiedXml = _addComplementaryCertificationColumns(certificationCenterHabilitations, stringifiedXml);
  }

  return stringifiedXml;
}

function _addComplementaryCertificationColumns(certificationCenterHabilitations, updatedStringifiedXml) {
  if (!_.isEmpty(certificationCenterHabilitations)) {
    const habilitationColumns = certificationCenterHabilitations.map(({ name }) => ({
      headerLabel: [name, '("oui" ou laisser vide)'],
      placeholder: [name],
    }));
    updatedStringifiedXml = sessionXmlService.addColumnGroup({
      stringifiedXml: updatedStringifiedXml,
      groupHeaderLabel: 'Certification(s) complémentaire(s)',
      columns: habilitationColumns,
    });
  }
  return updatedStringifiedXml;
}

function _addBillingColumns(updatedStringifiedXml) {
  return sessionXmlService.addColumnGroup({
    stringifiedXml: updatedStringifiedXml,
    groupHeaderLabel: 'Tarification',
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
  });
}

function _addCandidates(updatedStringifiedXml, certificationCandidates) {
  const candidatesData = _getCandidatesData(certificationCandidates);
  return sessionXmlService.getUpdatedXmlWithCertificationCandidatesData({
    stringifiedXml: updatedStringifiedXml,
    candidatesData,
    candidateTemplateValues: IMPORT_CANDIDATES_TEMPLATE_VALUES,
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
