import { FRENCH_FRANCE } from '../../../shared/domain/services/locale-service.js';
import { getI18n } from '../../../shared/infrastructure/i18n/i18n.js';
import { usecases } from '../domain/usecases/index.js';
import * as parcoursupCertificationSerializer from '../infrastructure/serializers/parcoursup-certification-serializer.js';

const getCertificationResultForParcoursup = async function (
  request,
  h,
  dependencies = {
    parcoursupCertificationSerializer,
  },
) {
  const i18n = getI18n(FRENCH_FRANCE);
  const { ine, organizationUai, lastName, firstName, birthdate, verificationCode } = request.payload;

  const certificationResult = await usecases.getCertificationResultForParcoursup({
    ine,
    organizationUai,
    lastName,
    firstName,
    birthdate,
    verificationCode,
  });

  return dependencies.parcoursupCertificationSerializer.serialize({
    certificationResult,
    translate: i18n.__,
  });
};

export const parcoursupController = {
  getCertificationResultForParcoursup,
};
