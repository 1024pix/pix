import * as certificationResultApi from '../../../results/application/api/certification-result-api.ts';

type CertificationResultApi = typeof certificationResultApi;

export async function buildCertificationResults({
  sessionId,
  dependencies = { certificationResultApi },
}: {
  sessionId: number;
  dependencies?: { certificationResultApi: Pick<CertificationResultApi, 'buildForSession'> };
}): Promise<void> {
  await dependencies.certificationResultApi.buildForSession({ sessionId });
}

export async function deleteCertificationResults({
  sessionId,
  dependencies = { certificationResultApi },
}: {
  sessionId: number;
  dependencies?: { certificationResultApi: Pick<CertificationResultApi, 'deleteForSession'> };
}): Promise<void> {
  await dependencies.certificationResultApi.deleteForSession({ sessionId });
}
/**
 * @param {object} params
 * @param {number} params.certificationCourseId
 * @param {string | null} params.eduV3ExternalJuryResult
 */
export async function updateEduV3ExternalJuryResult({
  certificationCourseId,
  eduV3ExternalJuryResult,
  dependencies = { certificationResultApi },
}: {
  certificationCourseId: number;
  eduV3ExternalJuryResult: string | null;
  dependencies?: { certificationResultApi: Pick<CertificationResultApi, 'updateEduV3ExternalJuryResult'> };
}) {
  await dependencies.certificationResultApi.updateEduV3ExternalJuryResult({
    certificationCourseId,
    v3EduExternalJuryResult: eduV3ExternalJuryResult,
  });
}

export async function updateEduV2ExternalJuryResult({
  certificationCourseId,
  v2EduVoletExterneBadgeId,
  v2EduVoletExterneAcquired,
  dependencies = { certificationResultApi },
}: {
  certificationCourseId: number;
  v2EduVoletExterneBadgeId: number | null;
  v2EduVoletExterneAcquired: boolean | null;
  dependencies?: { certificationResultApi: Pick<CertificationResultApi, 'updateEduV2ExternalJuryResult'> };
}) {
  await dependencies.certificationResultApi.updateEduV2ExternalJuryResult({
    certificationCourseId,
    v2EduVoletExterneBadgeId,
    v2EduVoletExterneAcquired,
  });
}
