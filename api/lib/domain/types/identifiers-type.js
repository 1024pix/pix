const Joi = require('joi');

const postgreSQLSequenceDefaultStart = 1;
const postgreSQLSequenceEnd = 2 ** 31 - 1;

const implementationType = {
  positiveInteger32bits: Joi.number().integer().min(postgreSQLSequenceDefaultStart).max(postgreSQLSequenceEnd).required(),
  alphanumeric255: Joi.string().max(255).required(),
};

const competenceId = implementationType.alphanumeric255;
const certificationCandidateId = implementationType.positiveInteger32bits;
const certificationCenterId = implementationType.positiveInteger32bits;
const certificationCourseId = implementationType.positiveInteger32bits;
const membershipId = implementationType.positiveInteger32bits;
const userId = implementationType.positiveInteger32bits;
const sessionId = implementationType.positiveInteger32bits;

module.exports = {
  certificationCandidateId,
  certificationCenterId,
  certificationCourseId,
  competenceId,
  membershipId,
  userId,
  sessionId,
};
