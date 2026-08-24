import Joi from 'joi';
import _ from 'lodash';

const postgreSQLSequenceDefaultStart = 1;
const postgreSQLSequenceInt32BitEnd = 2 ** 31 - 1;
const postgreSQLSequenceInt64BitEnd = 2 ** 63 - 1;

const implementationType = {
  positiveInteger32bits: Joi.number().integer().min(postgreSQLSequenceDefaultStart).max(postgreSQLSequenceInt32BitEnd),
  positiveInteger64bits: Joi.number().integer().min(postgreSQLSequenceDefaultStart).max(postgreSQLSequenceInt64BitEnd),
  alphanumeric255: Joi.string().max(255),
  alphanumeric: Joi.string(),
  uuid: Joi.string().uuid(),
};

const badgeImageUrlValidation = new RegExp(/^https:\/\/assets.pix.org\/badges\/.*\.(svg|png)$/);
const certificationVerificationCodeType = Joi.string().regex(/^P-[a-zA-Z0-9]{8}$/);
const editorLogoUrlValidation = new RegExp(/^https:\/\/assets.pix.org\/contenu-formatif\/editeur\/.*\.svg$/);

const inePattern = new RegExp('^[0-9]{9}[a-zA-Z]{2}$');
const inaPattern = new RegExp('^[0-9]{10}[a-zA-Z]{1}$');

const studentIdentifierType = Joi.alternatives().try(
  Joi.string().regex(inePattern).required(),
  Joi.string().regex(inaPattern).required(),
);

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
  'administrationTeamId',
  'assessmentId',
  'authenticationMethodId',
  'autonomousCourseId',
  'badgeCriterionId',
  'badgeId',
  'calibrationId',
  'campaignId',
  'campaignParticipationId',
  'certificationCandidateId',
  'certificationCenterId',
  'certificationCenterInvitationId',
  'certificationCenterInvitationId',
  'certificationCenterMembershipId',
  'certificationCourseId',
  'certificationIssueReportId',
  'certificationVersionId',
  'combinedCourseId',
  'combinedCourseBlueprintId',
  'complementaryCertificationBadgeId',
  'complementaryCertificationCourseId',
  'complementaryCertificationId',
  'membershipId',
  'missionId',
  'networkId',
  'organizationId',
  'organizationInvitationId',
  'organizationLearnerId',
  'ownerId',
  'participationId',
  'passageId',
  'placeId',
  'profileRewardId',
  'questId',
  'schoolingRegistrationId',
  'sessionId',
  'stageCollectionId',
  'stageId',
  'tagId',
  'targetProfileId',
  'targetProfileTemplateId',
  'trainingId',
  'trainingTriggerId',
  'userId',
  'userOrgaSettingsId',
];

const typesPositiveInteger64bits = ['answerId'];

const typesUuid = ['chatId', 'moduleId', 'elementId'];

const typesAlphanumeric = ['courseId', 'tutorialId'];
const typesAlphanumeric255 = ['challengeId', 'competenceId', 'frameworkId', 'tubeId', 'code', 'skillId'];

_assignValueToExport(typesPositiveInteger32bits, implementationType.positiveInteger32bits);
_assignValueToExport(typesPositiveInteger64bits, implementationType.positiveInteger64bits);
_assignValueToExport(typesAlphanumeric, implementationType.alphanumeric);
_assignValueToExport(typesAlphanumeric255, implementationType.alphanumeric255);
_assignValueToExport(typesUuid, implementationType.uuid);

paramsToExport.positiveInteger32bits = {
  min: postgreSQLSequenceDefaultStart,
  max: postgreSQLSequenceInt32BitEnd,
};

export {
  badgeImageUrlValidation,
  certificationVerificationCodeType,
  editorLogoUrlValidation,
  paramsToExport as identifiersType,
  queryToExport as optionalIdentifiersType,
  queriesType,
  studentIdentifierType,
};
