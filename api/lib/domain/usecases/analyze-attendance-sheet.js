const _ = require('lodash');
const Joi = require('@hapi/joi')
  .extend(require('@hapi/joi-date'));

const birthdateValidationSchema  = Joi.date().format('YYYY-MM-DD').greater('1900-01-01').required();

module.exports = async function analyzeAttendanceSheet({
  sessionId,
  odsBuffer,
  certificationsOdsService,
  certificationCandidateRepository,
}) {
  const certificationsData = await certificationsOdsService.extractCertificationsDataFromAttendanceSheet({ odsBuffer });
  const certificationsDataChunks = _.chunk(certificationsData, 10);
  const enhancedCertificationsDataChunks = await Promise.all(_.map(certificationsDataChunks, (certificationsDataChunk) => {
    return Promise.all(_.map(certificationsDataChunk, (certificationData) => {
      return _addNotSeenLastScreenSpecification({ sessionId, certificationData, certificationCandidateRepository });
    }));
  }));
  return _.flatten(enhancedCertificationsDataChunks);
};

async function _addNotSeenLastScreenSpecification({
  sessionId,
  certificationData,
  certificationCandidateRepository,
}) {
  if (certificationData.lastScreen) {
    return certificationData;
  }
  const certificationDataEnhanced = _.clone(certificationData);
  const { error } = birthdateValidationSchema.validate(certificationDataEnhanced.birthdate);
  if (error) {
    certificationDataEnhanced.lastScreenEnhanced = 'NOT_IN_SESSION';
    return certificationDataEnhanced;
  }

  const matchingSessionCandidates = await certificationCandidateRepository.findBySessionIdAndPersonalInfo({
    sessionId,
    firstName: certificationDataEnhanced.firstName,
    lastName: certificationDataEnhanced.lastName,
    birthdate: certificationDataEnhanced.birthdate,
  });

  if (matchingSessionCandidates.length !== 1) {
    certificationDataEnhanced.lastScreenEnhanced = 'NOT_IN_SESSION';
    return certificationDataEnhanced;
  }

  const matchingSessionCandidate = _.first(matchingSessionCandidates);
  if (matchingSessionCandidate.userId) {
    certificationDataEnhanced.lastScreenEnhanced = 'LINKED';
    return certificationDataEnhanced;
  }

  certificationDataEnhanced.lastScreenEnhanced = 'NOT_LINKED';
  return certificationDataEnhanced;
}
