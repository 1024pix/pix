import { User } from '../../../../src/identity-access-management/domain/models/User.js';
import { buildAuthenticationMethod } from './build-authentication-method.js';
import { buildMembership } from './build-membership.js';

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
  lastPixCertifTermsOfServiceValidatedAt = null,
  mustValidateTermsOfService = false,
  pixCertifTermsOfServiceAccepted = false,
  hasSeenAssessmentInstructions = false,
  isAnonymous = false,
  memberships = [buildMembership()],
  authenticationMethods = [buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword()],
  hasBeenAnonymised = false,
  hasBeenAnonymisedBy = null,
  emailConfirmedAt,
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
    lastPixCertifTermsOfServiceValidatedAt,
    mustValidateTermsOfService,
    pixCertifTermsOfServiceAccepted,
    hasSeenAssessmentInstructions,
    isAnonymous,
    memberships,
    authenticationMethods,
    hasBeenAnonymised,
    hasBeenAnonymisedBy,
    emailConfirmedAt,
  });
};

export { buildUser };
