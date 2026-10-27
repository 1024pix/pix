import { LtiPlatform } from '../../../../../src/lti/domain/models/LtiPlatform.js';

export function buildLtiPlatform({ id = 123, issuer = 'https://moodle.example.net' } = {}) {
  return new LtiPlatform({ id, issuer });
}
