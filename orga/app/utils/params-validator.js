import { CERTIFICABILITY_TYPES } from '../helpers/certificability-types';

export function validateCertificabilityParams(params) {
  if (params.certificability) {
    const certifibilityParams = !Array.isArray(params.certificability)
      ? [params.certificability]
      : params.certificability;
    const certificability = certifibilityParams.filter((certificabilityValue) =>
      Object.keys(CERTIFICABILITY_TYPES).includes(certificabilityValue),
    );

    params.certificability = certificability;
  }
}

export default { validateCertificabilityParams };
