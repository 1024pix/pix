import { CertificationCenter } from '../../../../src/shared/domain/models/index.js';
import { COLLEGE_TAG } from '../common/constants.js';
import * as tooling from '../common/tooling/index.js';
import { acceptPixOrgaTermsOfService } from '../common/tooling/legal-documents.js';
import {
  CERTIFICATION_SCO_MANAGING_AGRI_STUDENTS_EXTERNAL_ID,
  SCO_CERTIFICATION_AGRI_CENTER_ID,
  SCO_CERTIFICATION_MANAGING_AGRI_STUDENTS_CERTIFICATION_CENTER_USER_ID,
  SCO_CERTIFICATION_MANAGING_AGRI_STUDENTS_ORGANIZATION_USER_ID,
  SCO_MANAGING_AGRI_STUDENTS_ORGANIZATION_ID,
} from './constants.js';

export async function scoOrganizationManaginAgriStudentsWithFregata({ databaseBuilder }) {
  await _createScoOrganization({ databaseBuilder });
  await _createScoCertificationCenter({ databaseBuilder });
}

async function _createScoOrganization({ databaseBuilder }) {
  databaseBuilder.factory.buildUser.withRawPassword({
    id: SCO_CERTIFICATION_MANAGING_AGRI_STUDENTS_ORGANIZATION_USER_ID,
    firstName: 'Orga SCO managing agri Student',
    lastName: 'Certification',
    email: 'orga-sco-managing-agri-students@example.net',
    cgu: true,
    lang: 'fr',
    lastTermsOfServiceValidatedAt: new Date(),
    mustValidateTermsOfService: false,
    pixCertifTermsOfServiceAccepted: false,
    hasSeenAssessmentInstructions: false,
  });

  acceptPixOrgaTermsOfService(databaseBuilder, SCO_CERTIFICATION_MANAGING_AGRI_STUDENTS_ORGANIZATION_USER_ID);

  await tooling.organization.createOrganization({
    databaseBuilder,
    organizationId: SCO_MANAGING_AGRI_STUDENTS_ORGANIZATION_ID,
    type: 'SCO',
    name: 'Orga team Certification',
    isManagingStudents: true,
    externalId: CERTIFICATION_SCO_MANAGING_AGRI_STUDENTS_EXTERNAL_ID,
    adminIds: [SCO_CERTIFICATION_MANAGING_AGRI_STUDENTS_ORGANIZATION_USER_ID],
    configOrganization: {
      learnerCount: 8,
    },
    tagIds: [COLLEGE_TAG.id],
  });
}

async function _createScoCertificationCenter({ databaseBuilder }) {
  databaseBuilder.factory.buildUser.withRawPassword({
    id: SCO_CERTIFICATION_MANAGING_AGRI_STUDENTS_CERTIFICATION_CENTER_USER_ID,
    firstName: 'Centre de certif SCO managing agri student',
    lastName: 'Certification',
    email: 'certif-sco-agri-v3@example.net',
    cgu: true,
    lang: 'fr',
    lastTermsOfServiceValidatedAt: new Date(),
    mustValidateTermsOfService: false,
    pixCertifTermsOfServiceAccepted: false,
    hasSeenAssessmentInstructions: false,
  });

  acceptPixOrgaTermsOfService(databaseBuilder, SCO_CERTIFICATION_MANAGING_AGRI_STUDENTS_CERTIFICATION_CENTER_USER_ID);

  await tooling.certificationCenter.createCertificationCenter({
    databaseBuilder,
    certificationCenterId: SCO_CERTIFICATION_AGRI_CENTER_ID,
    name: 'Centre de certification sco managing agri students',
    type: CertificationCenter.types.SCO,
    externalId: CERTIFICATION_SCO_MANAGING_AGRI_STUDENTS_EXTERNAL_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    members: [{ id: SCO_CERTIFICATION_MANAGING_AGRI_STUDENTS_CERTIFICATION_CENTER_USER_ID }],
    complementaryCertificationIds: [],
  });
}
