const Joi = require('joi');

const postgreSQLSequenceDefaultStart = 1;
const postgreSQLSequenceEnd = 2 ** 31 - 1;

const implementationType = {
  positiveInteger32bits: Joi.number().integer().min(postgreSQLSequenceDefaultStart).max(postgreSQLSequenceEnd).required(),
  alphanumeric255: Joi.string().max(255).required(),
  alphanumeric: Joi.string().required(),
};

const answerId = implementationType.positiveInteger32bits;
const assessmentId = implementationType.positiveInteger32bits;
const badgeId = implementationType.positiveInteger32bits;
const campaignId = implementationType.positiveInteger32bits;
const campaignParticipationId = implementationType.positiveInteger32bits;
const certificationCandidateId = implementationType.positiveInteger32bits;
const certificationCenterId = implementationType.positiveInteger32bits;
const certificationCenterMembershipId = implementationType.positiveInteger32bits;
const certificationCourseId = implementationType.positiveInteger32bits;
const certificationIssueReportId = implementationType.positiveInteger32bits;
const challengeId = implementationType.alphanumeric255;
const courseId = implementationType.alphanumeric;
const competenceId = implementationType.alphanumeric255;
const membershipId = implementationType.positiveInteger32bits;
const organizationId = implementationType.positiveInteger32bits;
const organizationInvitationId = implementationType.positiveInteger32bits;
const schoolingRegistrationId = implementationType.positiveInteger32bits;
const sessionId = implementationType.positiveInteger32bits;
const stageId = implementationType.positiveInteger32bits;
const targetProfileId = implementationType.positiveInteger32bits;
const tutorialId = implementationType.alphanumeric;
const userId = implementationType.positiveInteger32bits;
const userOrgaSettingsId = implementationType.positiveInteger32bits;

module.exports = {
  answerId,
  assessmentId,
  badgeId,
  campaignId,
  campaignParticipationId,
  certificationCandidateId,
  certificationCenterId,
  certificationCenterMembershipId,
  certificationCourseId,
  certificationIssueReportId,
  challengeId,
  competenceId,
  courseId,
  membershipId,
  organizationId,
  organizationInvitationId,
  schoolingRegistrationId,
  sessionId,
  stageId,
  targetProfileId,
  tutorialId,
  userId,
  userOrgaSettingsId,
};
