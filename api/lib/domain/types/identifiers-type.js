const Joi = require('joi');

const sequenceStartAt = 1;
const sequencesEndsAt = 2 ** 31 - 1;
const positive32bitIntegerType = Joi.number().integer().min(sequenceStartAt).max(sequencesEndsAt).required();

const userId = positive32bitIntegerType;
const sessionId = positive32bitIntegerType;
const certificationCandidateId = positive32bitIntegerType;
const certificationCenterId = positive32bitIntegerType;
const certificationCourseId = positive32bitIntegerType;
const membershipId = positive32bitIntegerType;

module.exports = {
  userId,
  sessionId,
  certificationCandidateId,
  certificationCenterId,
  certificationCourseId,
  membershipId,
};
