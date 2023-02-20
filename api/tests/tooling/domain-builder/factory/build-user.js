import User from '../../../../lib/domain/models/User';
import buildMembership from './build-membership';
import buildCertificationCenterMembership from './build-certification-center-membership';
import buildAuthenticationMethod from './build-authentication-method';

export default function buildUser({
  id = 123,
  firstName = 'Lorie',
  lastName = 'MeilleureAmie',
  email = 'jeseraila@example.net',
  username,
  cgu = true,
  lang = 'fr',
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
}
