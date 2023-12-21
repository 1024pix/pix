import { V3CertificationChallengeLiveAlertForAdministration } from '../../../../src/certification/course/domain/models/V3CertificationChallengeLiveAlertForAdministration.js';

const buildV3CertificationChallengeLiveAlertForAdministration = function ({ id = 456 } = {}) {
  return new V3CertificationChallengeLiveAlertForAdministration({
    id,
  });
};

export { buildV3CertificationChallengeLiveAlertForAdministration };
