const writeOdsUtils = require('../../utils/ods/write-ods-utils');
const readOdsUtils = require('../../utils/ods/read-ods-utils');
const sessionXmlService = require('../../../domain/services/session-xml-service');
const {
  EXTRA_EMPTY_CANDIDATE_ROWS,
  IMPORT_CANDIDATES_TEMPLATE_VALUES,
  IMPORT_CANDIDATES_SESSION_TEMPLATE_VALUES,
} = require('./candidates-import-placeholders');

const moment = require('moment');
const _ = require('lodash');

module.exports = async function fillCandidatesImportSheet(session) {
  const stringifiedXml = await readOdsUtils.getContentXml({ odsFilePath: _getCandidatesImportTemplatePath() });

  const sessionData = SessionData.fromSession(session);
  const candidatesData = _getCandidatesData(session.certificationCandidates);

  const updatedStringifiedXml = _updateXml(stringifiedXml, sessionData, candidatesData);

  return writeOdsUtils.makeUpdatedOdsByContentXml({ stringifiedXml: updatedStringifiedXml, odsFilePath: _getCandidatesImportTemplatePath() });
};

function _updateXml(stringifiedXml, sessionData, candidatesData) {
  const updatedStringifiedXml = sessionXmlService.getUpdatedXmlWithSessionData({
    stringifiedXml,
    sessionData,
    sessionTemplateValues: IMPORT_CANDIDATES_SESSION_TEMPLATE_VALUES,
  });

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
  return __dirname + '/candidates_import_template.ods';
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
  constructor(
    {
      id = null,
      firstName = null,
      lastName = null,
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
    }) {
    this.id = this._emptyStringIfNull(id);
    this.firstName = this._emptyStringIfNull(firstName);
    this.lastName = this._emptyStringIfNull(lastName);
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
    this.count = number;
  }

  _emptyStringIfNull(value) {
    return value === null ? '' : value;
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

