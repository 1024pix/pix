import {
  SCO_COLLEGE_CERTIF_CENTER_ID,
  SCO_LYCEE_CERTIF_CENTER_ID,
  PRO_CERTIF_CENTER_ID,
  SUP_CERTIF_CENTER_ID,
  DROIT_CERTIF_CENTER_ID,
  SCO_NO_MANAGING_STUDENTS_CERTIF_CENTER_ID,
  AGRI_SCO_MANAGING_STUDENT_ID,
} from './certification-centers-builder';

import {
  PIX_SCO_CERTIF_USER_ID,
  PIX_PRO_CERTIF_USER_ID,
  PIX_SUP_CERTIF_USER_ID,
  CERTIF_REGULAR_USER1_ID,
  CERTIF_DROIT_USER5_ID,
} from './users';

export default function certificationCenterMembershipsBuilder({ databaseBuilder }) {
  databaseBuilder.factory.buildCertificationCenterMembership({
    certificationCenterId: SCO_COLLEGE_CERTIF_CENTER_ID,
    userId: PIX_SCO_CERTIF_USER_ID,
  });
  databaseBuilder.factory.buildCertificationCenterMembership({
    certificationCenterId: SCO_LYCEE_CERTIF_CENTER_ID,
    userId: PIX_SCO_CERTIF_USER_ID,
  });
  databaseBuilder.factory.buildCertificationCenterMembership({
    certificationCenterId: SCO_NO_MANAGING_STUDENTS_CERTIF_CENTER_ID,
    userId: PIX_SCO_CERTIF_USER_ID,
  });
  databaseBuilder.factory.buildCertificationCenterMembership({
    certificationCenterId: SCO_COLLEGE_CERTIF_CENTER_ID,
    userId: CERTIF_REGULAR_USER1_ID,
  });
  databaseBuilder.factory.buildCertificationCenterMembership({
    certificationCenterId: AGRI_SCO_MANAGING_STUDENT_ID,
    userId: PIX_SCO_CERTIF_USER_ID,
  });

  databaseBuilder.factory.buildCertificationCenterMembership({ userId: PIX_PRO_CERTIF_USER_ID, certificationCenterId: PRO_CERTIF_CENTER_ID });
  databaseBuilder.factory.buildCertificationCenterMembership({ userId: PIX_SUP_CERTIF_USER_ID, certificationCenterId: SUP_CERTIF_CENTER_ID });
  databaseBuilder.factory.buildCertificationCenterMembership({ userId: CERTIF_DROIT_USER5_ID, certificationCenterId: DROIT_CERTIF_CENTER_ID });
}
