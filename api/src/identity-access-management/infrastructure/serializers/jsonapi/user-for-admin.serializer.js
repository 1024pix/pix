import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (users, meta) {
  return new Serializer('user', {
    attributes: [
      'firstName',
      'lastName',
      'email',
      'username',
      'cgu',
      'lastTermsOfServiceValidatedAt',
      'mustValidateTermsOfService',
      'pixOrgaTermsOfServiceAccepted',
      'pixCertifTermsOfServiceAccepted',
      'lastDataProtectionPolicySeenAt',
      'lang',
      'locale',
      'isAnonymous',
      'hasSeenAssessmentInstructions',
      'hasSeenNewDashboardInfo',
      'hasSeenFocusedChallengeTooltip',
      'hasSeenOtherChallengesTooltip',
    ],
    meta,
  }).serialize(users);
};

export const userForAdminSerializer = { serialize };
