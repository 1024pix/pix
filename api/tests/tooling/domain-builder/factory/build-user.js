import { User } from '../../../../lib/domain/models/User.js';
import { buildMembership } from './build-membership.js';
import { buildCertificationCenterMembership } from './build-certification-center-membership.js';
import { buildAuthenticationMethod } from './build-authentication-method.js';

const buildUser = function ({
  id = 123,
  firstName = 'Lorie',
  lastName = 'MeilleureAmie',
  email = 'jeseraila@example.net',
  username,
  cgu = true,
  lang = 'fr',
  locale = 'fr-FR',
  lastTermsOfServiceValidatedAt = null,
  lastPixOrgaTermsOfServiceValidatedAt = null,
  lastPixCertifTermsOfServiceValidatedAt = null,
  mustValidateTermsOfService = false,
  pixOrgaTermsOfServiceAccepted = false,
  pixCertifTermsOfServiceAccepted = false,
  hasSeenAssessmentInstructions = false,
  isAnonymous = false,
  memberships = [buildMembership()],
  certificationCenterMemberships = [buildCertificationCenterMembership()],
  authenticationMethods = [buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword()],
  hasBeenAnonymised = false,
  hasBeenAnonymisedBy = null,
} = {}) {
  return new User({
    id,
    firstName,
    lastName,
    email,
    username,
    cgu,
    lang,
    locale,
    lastTermsOfServiceValidatedAt,
    lastPixOrgaTermsOfServiceValidatedAt,
    lastPixCertifTermsOfServiceValidatedAt,
    mustValidateTermsOfService,
    pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted,
    hasSeenAssessmentInstructions,
    isAnonymous,
    memberships,
    certificationCenterMemberships,
    authenticationMethods,
    hasBeenAnonymised,
    hasBeenAnonymisedBy,
  });
};

export { buildUser };
