import * as tooling from '../common/tooling/index.js';
import { acceptPixOrgaTermsOfService } from '../common/tooling/legal-documents.js';
import simpleScoManagingStudentsCertificationCase from './cases/simple-sco-managing-students-certification.js';
import { CERTIFIABLE_SUCCESS_USER_ID } from './constants.js';
import { proOrganizationWithCertifCenter } from './create-pro-organization-with-certif-center.js';
import { scoOrganizationManaginAgriStudentsWithFregata } from './create-sco-organization-managing-agri-student-with-fregata.js';
import { scoOrganizationNotManagingStudents } from './create-sco-organization-not-managing-students.js';
import { supCertificationCenterOnly } from './create-sup-certification-center-only.js';
import { setupConfigurations } from './setup-configuration.js';

async function teamCertificationDataBuilder({ databaseBuilder }) {
  await scoOrganizationManaginAgriStudentsWithFregata({ databaseBuilder });
  await proOrganizationWithCertifCenter({ databaseBuilder });
  await supCertificationCenterOnly({ databaseBuilder });
  await scoOrganizationNotManagingStudents({ databaseBuilder });
  await _createSuccessCertifiableUser({ databaseBuilder });
  await setupConfigurations({ databaseBuilder });

  // Cases
  await simpleScoManagingStudentsCertificationCase({ databaseBuilder });
}

export { teamCertificationDataBuilder };

async function _createSuccessCertifiableUser({ databaseBuilder }) {
  const userId = databaseBuilder.factory.buildUser.withRawPassword({
    id: CERTIFIABLE_SUCCESS_USER_ID,
    firstName: 'Certifiable',
    lastName: 'Certif',
    email: 'certif-success@example.net',
    cgu: true,
    lang: 'fr',
    lastTermsOfServiceValidatedAt: new Date(),
    mustValidateTermsOfService: false,
    pixCertifTermsOfServiceAccepted: false,
    hasSeenAssessmentInstructions: false,
    shouldChangePassword: false,
  }).id;

  acceptPixOrgaTermsOfService(databaseBuilder, CERTIFIABLE_SUCCESS_USER_ID);

  await tooling.profile.createPerfectProfile({
    databaseBuilder,
    userId,
  });
}
