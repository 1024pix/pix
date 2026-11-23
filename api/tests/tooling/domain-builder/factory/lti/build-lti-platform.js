import { LtiPlatform } from '../../../../../src/lti/domain/models/LtiPlatform.js';

export function buildLtiPlatform({ id = 123, issuer = 'https://moodle.example.net', organizationIds = [] } = {}) {
  return new LtiPlatform({ id, issuer, organizationIds });
}
