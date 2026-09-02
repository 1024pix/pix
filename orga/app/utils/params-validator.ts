import { CERTIFICABILITY_TYPES } from '../helpers/certificability-types';

export function validateCertificabilityParams(params: { certificability?: string | string[] }): void {
  if (params.certificability) {
    const certificabilityParams = !Array.isArray(params.certificability)
      ? [params.certificability]
      : params.certificability;
    const certificability = certificabilityParams.filter((certificabilityValue) =>
      Object.keys(CERTIFICABILITY_TYPES).includes(certificabilityValue),
    );

    params.certificability = certificability;
  }
}

export default { validateCertificabilityParams };
