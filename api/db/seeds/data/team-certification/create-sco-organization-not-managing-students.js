import { CertificationCenter } from '../../../../src/shared/domain/models/index.js';
import { COLLEGE_TAG } from '../common/constants.js';
import * as tooling from '../common/tooling/index.js';
import { acceptPixOrgaTermsOfService } from '../common/tooling/legal-documents.js';
import {
  CERTIFICATION_SCO_NOT_MANAGING_STUDENTS_EXTERNAL_ID,
  SCO_CERTIFICATION_NOT_MANAGING_STUDENTS_CERTIFICATION_CENTER_USER_ID,
  SCO_CERTIFICATION_NOT_MANAGING_STUDENTS_ORGANIZATION_USER_ID,
  SCO_NOT_MANAGING_CERTIFICATION_CENTER_ID,
  SCO_NOT_MANAGING_STUDENTS_ORGANIZATION_ID,
} from './constants.js';

export async function scoOrganizationNotManagingStudents({ databaseBuilder }) {
  await _createScoOrganization({ databaseBuilder });
  await _createScoCertificationCenter({ databaseBuilder });
}

async function _createScoOrganization({ databaseBuilder }) {
  databaseBuilder.factory.buildUser.withRawPassword({
    id: SCO_CERTIFICATION_NOT_MANAGING_STUDENTS_ORGANIZATION_USER_ID,
    firstName: 'Orga User SCO not managing Student',
    lastName: 'Certification',
    email: 'orga-sco-not-managing-students@example.net',
    cgu: true,
    lang: 'fr',
    lastTermsOfServiceValidatedAt: new Date(),
    mustValidateTermsOfService: false,
    pixCertifTermsOfServiceAccepted: false,
    hasSeenAssessmentInstructions: false,
  });

  acceptPixOrgaTermsOfService(databaseBuilder, SCO_CERTIFICATION_NOT_MANAGING_STUDENTS_ORGANIZATION_USER_ID);

  await tooling.organization.createOrganization({
    databaseBuilder,
    organizationId: SCO_NOT_MANAGING_STUDENTS_ORGANIZATION_ID,
    type: 'SCO',
    name: 'Orga not managing student team Certification',
    isManagingStudents: false,
    externalId: CERTIFICATION_SCO_NOT_MANAGING_STUDENTS_EXTERNAL_ID,
    adminIds: [SCO_CERTIFICATION_NOT_MANAGING_STUDENTS_ORGANIZATION_USER_ID],
    configOrganization: {
      learnerCount: 8,
    },
    tagIds: [COLLEGE_TAG.id],
  });
}

async function _createScoCertificationCenter({ databaseBuilder }) {
  databaseBuilder.factory.buildUser.withRawPassword({
    id: SCO_CERTIFICATION_NOT_MANAGING_STUDENTS_CERTIFICATION_CENTER_USER_ID,
    firstName: 'Certif User SCO not managing student',
    lastName: 'Certification',
    email: 'certif-sco-not-managing-v3@example.net',
    cgu: true,
    lang: 'fr',
    lastTermsOfServiceValidatedAt: new Date(),
    mustValidateTermsOfService: false,
    pixCertifTermsOfServiceAccepted: false,
    hasSeenAssessmentInstructions: false,
  });

  acceptPixOrgaTermsOfService(databaseBuilder, SCO_CERTIFICATION_NOT_MANAGING_STUDENTS_CERTIFICATION_CENTER_USER_ID);

  await tooling.certificationCenter.createCertificationCenter({
    databaseBuilder,
    certificationCenterId: SCO_NOT_MANAGING_CERTIFICATION_CENTER_ID,
    name: 'Centre de certification SCO not managing students',
    type: CertificationCenter.types.SCO,
    externalId: CERTIFICATION_SCO_NOT_MANAGING_STUDENTS_EXTERNAL_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    members: [{ id: SCO_CERTIFICATION_NOT_MANAGING_STUDENTS_CERTIFICATION_CENTER_USER_ID }],
    complementaryCertificationIds: [],
  });
}
