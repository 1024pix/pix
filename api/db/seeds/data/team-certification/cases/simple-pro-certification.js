import { Candidate } from '../../../../../src/certification/enrolment/domain/models/Candidate.js';
import { CenterTypes } from '../../../../../src/certification/enrolment/domain/models/CenterTypes.js';
import { Subscription } from '../../../../../src/certification/enrolment/domain/models/Subscription.js';
import { usecases as enrolmentUseCases } from '../../../../../src/certification/enrolment/domain/usecases/index.js';
import { BILLING_MODES } from '../../../../../src/certification/shared/domain/constants.js';
import { OrganizationForAdmin } from '../../../../../src/organizational-entities/domain/models/OrganizationForAdmin.js';
import { usecases as organizationalEntitiesUsecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import * as organizationCreationValidator from '../../../../../src/organizational-entities/domain/validators/organization-creation-validator.js';
import {
  CertificationCenter,
  types as certificationCenterTypes,
} from '../../../../../src/shared/domain/models/CertificationCenter.js';
import { LANGUAGES_CODE } from '../../../../../src/shared/domain/services/language-service.js';
import { normalize } from '../../../../../src/shared/infrastructure/utils/string-utils.js';
import { usecases as teamUsecases } from '../../../../../src/team/domain/usecases/index.js';
import * as tooling from '../../common/tooling/index.js';
import { acceptPixOrgaTermsOfService } from '../../common/tooling/legal-documents.js';
import {
  CERTIFICATION_PRO_EXTERNAL_ID,
  PRO_CERTIFICATION_CENTER_ID,
  PRO_ORGANIZATION_USER_ID,
  SIMPLE_PRO_CERTIFICATION_USER_ID,
} from '../constants.js';

/**
 * --- CERTIFICATION CASE ---
 *
 * The goal here is to reproduce one certification case:
 *   - The organization is PRO
 *   - A session with several candidates
 *   - The candidate can directly enter a session on Pix App
 */

export default async function proCertificationCase({ databaseBuilder }) {
  /**
   * 1. Create the certification center and organization
   */
  const externalId = CERTIFICATION_PRO_EXTERNAL_ID;

  const organizationMember = databaseBuilder.factory.buildUser.withRawPassword({
    id: PRO_ORGANIZATION_USER_ID,
    firstName: 'Pro',
    lastName: 'Organization member',
    email: 'pro-v3@example.net',
    cgu: true,
    lang: LANGUAGES_CODE.FRENCH,
    lastTermsOfServiceValidatedAt: new Date(),
    mustValidateTermsOfService: false,
    pixCertifTermsOfServiceAccepted: true,
  });

  acceptPixOrgaTermsOfService(databaseBuilder, organizationMember.id);

  await databaseBuilder.commit();

  // Organization
  const organization = new OrganizationForAdmin({
    name: 'Organization PRO',
    type: CenterTypes.PRO,
    isManagingStudents: false,
    externalId,
  });

  const newOrga = await organizationalEntitiesUsecases.createOrganization({
    organization,
    organizationCreationValidator,
  });

  await teamUsecases.createMembership({
    userId: organizationMember.id,
    organizationId: newOrga.id,
  });

  // Certification center
  const certificationCenter = new CertificationCenter({
    id: PRO_CERTIFICATION_CENTER_ID,
    name: 'Certification Center PRO V3',
    type: certificationCenterTypes.PRO,
    externalId,
    createdAt: new Date('2022-01-30'),
    habilitations: [],
    isV3Pilot: true,
  });

  const certificationCenterForAdmin = await organizationalEntitiesUsecases.createCertificationCenter({
    certificationCenter,
    complementaryCertificationIds: [],
  });

  await teamUsecases.createCertificationCenterMembershipByEmail({
    certificationCenterId: certificationCenterForAdmin.id,
    email: organizationMember.email,
  });

  /**
   * 2. Create the certifiable users
   */
  const userAbleToStartCertification = databaseBuilder.factory.buildUser.withRawPassword({
    id: SIMPLE_PRO_CERTIFICATION_USER_ID,
    firstName: 'Candidat-PRO',
    lastName: 'Certifiable',
    email: 'certifiable-pro@example.net',
    cgu: true,
    lang: 'fr',
    lastTermsOfServiceValidatedAt: new Date(),
  });

  await tooling.profile.createCertifiableProfile({
    databaseBuilder,
    userId: userAbleToStartCertification.id,
  });

  await databaseBuilder.commit();

  /**
   * 3. Initialize session
   */
  await _sessionNotStarted({
    userAbleToStartCertification,
    organizationMember,
    certificationCenterForAdmin,
    databaseBuilder,
  });
}

async function _sessionNotStarted({
  userAbleToStartCertification,
  organizationMember,
  certificationCenterForAdmin,
  databaseBuilder,
}) {
  const candidates = [];

  for (let index = 0; index < 3; index++) {
    const otherCandidate = new Candidate({
      authorizedToStart: true,
      firstName: `Candidat-${index}`,
      lastName: `PRO`,
      sex: 'F',
      birthdate: new Date('2000-10-30'),
      birthCountry: 'France',
      birthINSEECode: '75115',
      email: userAbleToStartCertification.email,
      hasSeenCertificationInstructions: false,
      accessibilityAdjustmentNeeded: false,
      subscriptions: [Subscription.buildCore({ certificationCandidateId: null })],
      billingMode: BILLING_MODES.FREE,
    });
    candidates.push(otherCandidate);
  }

  const session = await enrolmentUseCases.createSession({
    userId: organizationMember.id,
    session: {
      certificationCenterId: certificationCenterForAdmin.id,
      address: 'Session non démarrée',
      room: '27A',
      examiner: 'Alain Cendy',
      date: '2025-01-30',
      time: '14:30',
      description: 'Session qui peut être démarrée via un candidat certifiable.',
    },
  });
  await databaseBuilder.knex('sessions').where('id', session.id).update({
    id: PRO_CERTIFICATION_CENTER_ID,
    accessCode: 'AZERTY',
  });

  for (const candidate of candidates) {
    await enrolmentUseCases.addCandidateToSession({
      sessionId: PRO_CERTIFICATION_CENTER_ID,
      candidate,
      normalizeStringFnc: normalize,
    });
  }
}
