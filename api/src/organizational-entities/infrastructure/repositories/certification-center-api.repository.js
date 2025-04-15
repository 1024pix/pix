import * as certificationCenterApi from '../../../team/application/api/certification-center.api.js';

const archiveCertificationCenterData = async ({
  certificationCenterId,
  archiveDate,
  archivedBy,
  dependencies = { certificationCenterApi },
}) => {
  await dependencies.certificationCenterApi.archiveCertificationCenterData({
    certificationCenterId,
    archivedBy,
    archiveDate,
  });
};

export const certificationCenterApiRepository = { archiveCertificationCenterData };
