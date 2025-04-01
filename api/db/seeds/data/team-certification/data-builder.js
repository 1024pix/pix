import * as tooling from '../common/tooling/index.js';
import { acceptPixOrgaTermsOfService } from '../common/tooling/legal-documents.js';
import proCertificationCase from './cases/simple-pro-certification.js';
import simpleScoManagingStudentsCertificationCase from './cases/simple-sco-managing-students-certification.js';
import { CERTIFIABLE_SUCCESS_USER_ID } from './constants.js';
import { scoOrganizationManaginAgriStudentsWithFregata } from './create-sco-organization-managing-agri-student-with-fregata.js';
import { supCertificationCenterOnly } from './create-sup-certification-center-only.js';
import { setupConfigurations } from './setup-configuration.js';

async function teamCertificationDataBuilder({ databaseBuilder }) {
  await scoOrganizationManaginAgriStudentsWithFregata({ databaseBuilder });
  await supCertificationCenterOnly({ databaseBuilder });
  await _createSuccessCertifiableUser({ databaseBuilder });
  await setupConfigurations({ databaseBuilder });

  // Cases
  await simpleScoManagingStudentsCertificationCase({ databaseBuilder });
  await proCertificationCase({ databaseBuilder });
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
