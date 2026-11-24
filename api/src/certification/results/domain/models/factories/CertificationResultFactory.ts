import type { UUID } from 'node:crypto';

import { AlgorithmEngineVersion } from '../../../../shared/domain/models/AlgorithmEngineVersion.js';
import { hasCoreScope } from '../../../../shared/domain/models/Frameworks.js';
import { FRANCE_COMPETENCES_PROFESSIONAL_START_DATE } from '../../constants.ts';
import type { Results } from '../NewCertificationResult.schema.ts';
import { CertificationResult, UserCertificationResult } from '../NewCertificationResult.ts';
import type {
  CertificationDataProps,
  CertificationResultSourceData,
  FullCertificationData,
} from './CertificationResultSourceData.ts';
import { buildV1Results } from './V1Results.ts';
import { buildV2Results } from './V2Results.ts';
import { buildV3Results } from './V3Results.ts';

const FRANCE_COMPETENCES_MIN_SCORE = 120;

export class CertificationResultFactory {
  static buildAll(sourceData: CertificationResultSourceData, uuidGenerator: () => UUID) {
    const errors: Record<number, string> = {};
    const certificationResults: CertificationResult[] = [];
    const userCertificationResults: UserCertificationResult[] = [];

    for (const fullCertificationData of this.#joinByCertificationCourseId(sourceData)) {
      const { certificationItem, learnerItem } = fullCertificationData;
      const id = uuidGenerator();
      const certificationResult = this.#buildCertificationResult(id, fullCertificationData);
      const validationError = certificationResult.validate();
      if (validationError) {
        errors[certificationItem.certificationCourseId] = validationError;
        continue;
      }
      certificationResults.push(certificationResult);
      userCertificationResults.push(
        new UserCertificationResult({
          certificationCourseId: certificationItem.certificationCourseId,
          sessionId: certificationItem.sessionId,
          organizationLearnerId: learnerItem?.organizationLearnerId ?? null,
          userId: certificationItem.userId,
          certificationResultId: id,
        }),
      );
    }

    return {
      certificationResults,
      userCertificationResults,
      errors,
    };
  }

  static #joinByCertificationCourseId({
    certificationData,
    learnerData,
    cleaData,
    pixPlusV2VoletPixData,
    pixPlusV2VoletExterneData,
  }: CertificationResultSourceData): FullCertificationData[] {
    const learnerDataByLearnerId = new Map(learnerData.map((item) => [item.organizationLearnerId, item]));
    const cleaDataByCertificationCourseId = new Map(cleaData.map((item) => [item.certificationCourseId, item]));
    const pixPlusV2VoletPixDataByCertificationCourseId = new Map(
      pixPlusV2VoletPixData.map((item) => [item.certificationCourseId, item]),
    );
    const pixPlusV2VoletExterneDataByCertificationCourseId = new Map(
      pixPlusV2VoletExterneData.map((item) => [item.certificationCourseId, item]),
    );

    const fullCertificationDataById: Record<number, FullCertificationData> = {};
    for (const certificationItem of certificationData) {
      const { certificationCourseId, organizationLearnerId } = certificationItem;

      fullCertificationDataById[certificationCourseId] = {
        certificationItem,
        learnerItem: organizationLearnerId ? (learnerDataByLearnerId.get(organizationLearnerId) ?? null) : null,
        cleaItem: cleaDataByCertificationCourseId.get(certificationCourseId) ?? null,
        pixPlusV2VoletPixItem: pixPlusV2VoletPixDataByCertificationCourseId.get(certificationCourseId) ?? null,
        pixPlusV2VoletExterneItem: pixPlusV2VoletExterneDataByCertificationCourseId.get(certificationCourseId) ?? null,
      };
    }
    return Object.values(fullCertificationDataById);
  }

  static #buildCertificationResult(id: UUID, fullCertificationData: FullCertificationData) {
    const { certificationItem, learnerItem } = fullCertificationData;

    return new CertificationResult({
      id,
      algorithmEngineVersion: certificationItem.algorithmEngineVersion,
      firstName: certificationItem.firstName,
      middleName: learnerItem?.middleName ?? null,
      thirdName: learnerItem?.thirdName ?? null,
      lastName: certificationItem.lastName,
      externalId: certificationItem.externalId ?? null,
      nationalStudentId: learnerItem?.nationalStudentId ?? null,
      birthdate: certificationItem.birthdate,
      birthplace: certificationItem.birthplace,
      birthPostalCode: certificationItem.birthPostalCode ?? null,
      birthINSEECode: certificationItem.birthINSEECode ?? null,
      birthCountry: certificationItem.birthCountry ?? null,
      verificationCode: certificationItem.verificationCode,
      certificationCenter: certificationItem.certificationCenter ?? certificationItem.certificationCenterFallback,
      startedAt: certificationItem.startedAt,
      deliveredAt: certificationItem.deliveredAt,
      status: certificationItem.status,
      framework: certificationItem.framework,
      franceCompetencesMinScore: getFranceCompetencesMinScore(certificationItem),
      commentByAutoJury: certificationItem.commentByAutoJury,
      commentByJury: certificationItem.commentByJury,
      commentForOrganization: certificationItem.commentForOrganization,
      commentForCandidate: certificationItem.commentForCandidate,
      results: buildResults(fullCertificationData) as Results,
    });
  }
}

function buildResults(fullCertificationData: FullCertificationData) {
  switch (fullCertificationData.certificationItem.algorithmEngineVersion) {
    case AlgorithmEngineVersion.V1:
      return buildV1Results(fullCertificationData);
    case AlgorithmEngineVersion.V2:
      return buildV2Results(fullCertificationData);
    case AlgorithmEngineVersion.V3:
      return buildV3Results(fullCertificationData);
    default:
      return null;
  }
}

function getFranceCompetencesMinScore({ deliveredAt, framework, algorithmEngineVersion }: CertificationDataProps) {
  if (algorithmEngineVersion === AlgorithmEngineVersion.V1) return null;
  if (!hasCoreScope(framework)) return null;
  if (deliveredAt.getTime() < FRANCE_COMPETENCES_PROFESSIONAL_START_DATE.getTime()) return null;

  return FRANCE_COMPETENCES_MIN_SCORE;
}
