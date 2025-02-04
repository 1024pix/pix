import { usecases } from '../domain/usecases/index.js';

const getCertificationResult = async function (request) {
  const { ine, organizationUai, lastName, firstName, birthdate, verificationCode } = request.payload;

  return usecases.getCertificationResult({
    ine,
    organizationUai,
    lastName,
    firstName,
    birthdate,
    verificationCode,
  });
};

export const certificationController = {
  getCertificationResult,
};
