import Joi from 'joi';
import _ from 'lodash';

const postgreSQLSequenceDefaultStart = 1;
const postgreSQLSequenceEnd = 2 ** 31 - 1;

const implementationType = {
  positiveInteger32bits: Joi.number().integer().min(postgreSQLSequenceDefaultStart).max(postgreSQLSequenceEnd),
  alphanumeric255: Joi.string().max(255),
  alphanumeric: Joi.string(),
};

const paramsToExport = {};
const queryToExport = {};

function _assignValueToExport(array, implementationType) {
  _.each(array, function (value) {
    paramsToExport[value] = implementationType.required();
    queryToExport[value] = implementationType.empty('').allow(null).optional();
  });
}

const queriesType = {
  paginationType: Joi.object({
    number: Joi.number().integer().empty('').allow(null).optional(),
    size: Joi.number().integer().empty('').allow(null).optional(),
  }).default({}),
};

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
  'missionId',
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
const typesAlphanumeric255 = ['challengeId', 'competenceId', 'frameworkId', 'tubeId', 'code', 'skillId'];

_assignValueToExport(typesPositiveInteger32bits, implementationType.positiveInteger32bits);
_assignValueToExport(typesAlphanumeric, implementationType.alphanumeric);
_assignValueToExport(typesAlphanumeric255, implementationType.alphanumeric255);

paramsToExport.positiveInteger32bits = {
  min: postgreSQLSequenceDefaultStart,
  max: postgreSQLSequenceEnd,
};

export { paramsToExport as identifiersType, queryToExport as optionalIdentifiersType, queriesType };
