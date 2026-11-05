import { FRENCH_FRANCE } from '../../../shared/domain/services/locale-service.js';
import { addCorrelationInfo } from '../../../shared/infrastructure/execution-context-manager.js';
import { getI18n } from '../../../shared/infrastructure/i18n/i18n.js';
import { usecases } from '../domain/usecases/index.js';
import * as parcoursupInfoRepository from '../infrastructure/repositories/parcoursup-info-repository.js';
import * as parcoursupCertificationSerializer from '../infrastructure/serializers/parcoursup-certification-serializer.js';

async function getCertificationResultForParcoursup(
  request,
  h,
  dependencies = {
    parcoursupCertificationSerializer,
  },
) {
  const i18n = getI18n(FRENCH_FRANCE);
  const { ine, organizationUai, lastName, firstName, birthdate, verificationCode } = request.payload;
  if (ine) {
    addCorrelationInfo('search_method', 'BY_INE');
  }
  if (organizationUai) {
    addCorrelationInfo('search_method', 'BY_UAI');
  }
  if (verificationCode) {
    addCorrelationInfo('search_method', 'BY_VERIFCODE');
  }
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
}

async function getInfo(
  request,
  h,
  dependencies = {
    parcoursupInfoRepository,
  },
) {
  const info = await dependencies.parcoursupInfoRepository.get();

  return h
    .response({
      sentAt: info.sentAt,
      lastUpdatedAtCurrentSchoolYear: info.lastUpdatedAtCurrentSchoolYear,
      lastUpdatedAtVerificationCode: info.lastUpdatedAtVerificationCode,
    })
    .code(200);
}

export const parcoursupController = {
  getCertificationResultForParcoursup,
  getInfo,
};
