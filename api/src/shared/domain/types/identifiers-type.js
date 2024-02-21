import Joi from 'joi';
import _ from 'lodash';

const postgreSQLSequenceDefaultStart = 1;
const postgreSQLSequenceEnd = 2 ** 31 - 1;

const implementationType = {
  positiveInteger32bits: Joi.number()
    .integer()
    .min(postgreSQLSequenceDefaultStart)
    .max(postgreSQLSequenceEnd)
    .required(),
  alphanumeric255: Joi.string().max(255).required(),
  alphanumeric: Joi.string().required(),
};

const valuesToExport = {};

function _assignValueToExport(array, implementationType) {
  _.each(array, function (value) {
    valuesToExport[value] = implementationType;
  });
}

const typesPositiveInteger32bits = [
  'adminMemberId',
  'answerId',
  'assessmentId',
  'authenticationMethodId',
  'autonomousCourseId',
  'badgeCriterionId',
  'badgeId',
  'campaignId',
  'campaignParticipationId',
  'certificationCandidateId',
  'certificationCenterId',
  'certificationCenterInvitationId',
  'certificationCenterInvitationId',
  'certificationCenterMembershipId',
  'certificationCourseId',
  'certificationIssueReportId',
  'complementaryCertificationBadgeId',
  'complementaryCertificationCourseId',
  'complementaryCertificationId',
  'membershipId',
  'organizationId',
  'organizationInvitationId',
  'organizationLearnerId',
  'ownerId',
  'passageId',
  'placeId',
  'schoolingRegistrationId',
  'sessionId',
  'stageCollectionId',
  'stageId',
  'supervisorAccessesId',
  'tagId',
  'targetProfileId',
  'targetProfileTemplateId',
  'trainingId',
  'userId',
  'userOrgaSettingsId',
];

const typesAlphanumeric = ['courseId', 'tutorialId'];
const typesAlphanumeric255 = ['challengeId', 'competenceId', 'frameworkId', 'tubeId', 'missionId', 'code'];

_assignValueToExport(typesPositiveInteger32bits, implementationType.positiveInteger32bits);
_assignValueToExport(typesAlphanumeric, implementationType.alphanumeric);
_assignValueToExport(typesAlphanumeric255, implementationType.alphanumeric255);

valuesToExport.positiveInteger32bits = {
  min: postgreSQLSequenceDefaultStart,
  max: postgreSQLSequenceEnd,
};

export { valuesToExport as identifiersType };
