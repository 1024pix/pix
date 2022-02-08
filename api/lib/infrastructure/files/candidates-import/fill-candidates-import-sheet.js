const writeOdsUtils = require('../../utils/ods/write-ods-utils');
const readOdsUtils = require('../../utils/ods/read-ods-utils');
const sessionXmlService = require('../../../domain/services/session-xml-service');
const { featureToggles } = require('../../../../lib/config');
const {
  EXTRA_EMPTY_CANDIDATE_ROWS,
  IMPORT_CANDIDATES_TEMPLATE_VALUES,
  IMPORT_CANDIDATES_SESSION_TEMPLATE_VALUES,
} = require('./candidates-import-placeholders');

const moment = require('moment');
const _ = require('lodash');
const FRANCE_COUNTRY_CODE = '99100';
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

class CandidateData {
  constructor({
    id = null,
    firstName = null,
    lastName = null,
    sex = null,
    birthPostalCode = null,
    birthINSEECode = null,
    birthCity = null,
    birthProvinceCode = null,
    birthCountry = null,
    email = null,
    resultRecipientEmail = null,
    externalId = null,
    birthdate = null,
    extraTimePercentage = null,
    createdAt = null,
    sessionId = null,
    userId = null,
    schoolingRegistrationId = null,
    number = null,
    complementaryCertifications = null,
    billingMode = null,
    prepaymentCode = null,
  }) {
    this.id = this._emptyStringIfNull(id);
    this.firstName = this._emptyStringIfNull(firstName);
    this.lastName = this._emptyStringIfNull(lastName);
    this.sex = this._emptyStringIfNull(sex);
    this.birthPostalCode = this._emptyStringIfNull(birthPostalCode);
    this.birthINSEECode = this._emptyStringIfNull(birthINSEECode);
    this.birthCity = this._emptyStringIfNull(birthCity);
    this.birthProvinceCode = this._emptyStringIfNull(birthProvinceCode);
    this.birthCountry = this._emptyStringIfNull(birthCountry);
    this.email = this._emptyStringIfNull(email);
    this.resultRecipientEmail = this._emptyStringIfNull(resultRecipientEmail);
    this.externalId = this._emptyStringIfNull(externalId);
    this.birthdate = birthdate === null ? '' : moment(birthdate, 'YYYY-MM-DD').format('YYYY-MM-DD');
    if (!_.isFinite(extraTimePercentage) || extraTimePercentage <= 0) {
      this.extraTimePercentage = '';
    } else {
      this.extraTimePercentage = extraTimePercentage;
    }
    this.createdAt = this._emptyStringIfNull(createdAt);
    this.sessionId = this._emptyStringIfNull(sessionId);
    this.userId = this._emptyStringIfNull(userId);
    this.schoolingRegistrationId = this._emptyStringIfNull(schoolingRegistrationId);
    this.billingMode = CandidateData.translateBillingMode(billingMode);
    this.prepaymentCode = this._emptyStringIfNull(prepaymentCode);
    this.cleaNumerique = this._displayYesIfCandidateHasComplementaryCertification(
      complementaryCertifications,
      'CléA Numérique'
    );
    this.pixPlusDroit = this._displayYesIfCandidateHasComplementaryCertification(
      complementaryCertifications,
      'Pix+ Droit'
    );
    this.count = number;
    this._clearBirthInformationDataForExport();
  }

  _emptyStringIfNull(value) {
    return value === null ? '' : value;
  }

  _clearBirthInformationDataForExport() {
    if (this.birthCountry.toUpperCase() === 'FRANCE') {
      if (this.birthINSEECode) {
        this.birthPostalCode = '';
        this.birthCity = '';
      }

      return;
    }

    if (this.birthINSEECode && this.birthINSEECode !== FRANCE_COUNTRY_CODE) {
      this.birthINSEECode = '99';
    }
  }

  _displayYesIfCandidateHasComplementaryCertification(complementaryCertifications, certificationLabel) {
    if (!complementaryCertifications) {
      return '';
    }
    const hasComplementaryCertification = complementaryCertifications.some(
      (complementaryCertification) => complementaryCertification.name === certificationLabel
    );
    return hasComplementaryCertification ? 'oui' : '';
  }

  static translateBillingMode(value) {
    switch (value) {
      case 'FREE':
        return 'Gratuite';
      case 'PAID':
        return 'Payante';
      case 'PREPAID':
        return 'Prépayée';
      case null:
      default:
        return '';
    }
  }

  static fromCertificationCandidateAndCandidateNumber(certificationCandidate, number) {
    return new CandidateData({ ...certificationCandidate, number });
  }

  static empty(number) {
    return new CandidateData({ number });
  }
}

class SessionData {
  constructor({
    id,
    accessCode,
    address,
    certificationCenter,
    date,
    description,
    examiner,
    room,
    time,
    examinerGlobalComment,
    finalizedAt,
    resultsSentToPrescriberAt,
    publishedAt,
    certificationCenterId,
    assignedCertificationOfficerId,
  }) {
    this.id = id;
    this.accessCode = accessCode;
    this.address = address;
    this.certificationCenter = certificationCenter;
    this.date = date;
    this.description = description;
    this.examiner = examiner;
    this.room = room;
    this.time = time;
    this.examinerGlobalComment = examinerGlobalComment;
    this.finalizedAt = finalizedAt;
    this.resultsSentToPrescriberAt = resultsSentToPrescriberAt;
    this.publishedAt = publishedAt;
    this.certificationCenterId = certificationCenterId;
    this.assignedCertificationOfficerId = assignedCertificationOfficerId;
    this.startTime = moment(time, 'HH:mm').format('HH:mm');
    this.endTime = moment(time, 'HH:mm').add(moment.duration(2, 'hours')).format('HH:mm');
    this.date = moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY');
  }

  static fromSession(session) {
    return new SessionData(session);
  }
}
