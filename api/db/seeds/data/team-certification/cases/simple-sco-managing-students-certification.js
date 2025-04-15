import { Candidate } from '../../../../../src/certification/enrolment/domain/models/Candidate.js';
import { Subscription } from '../../../../../src/certification/enrolment/domain/models/Subscription.js';
import { usecases as enrolmentUseCases } from '../../../../../src/certification/enrolment/domain/usecases/index.js';
import { OrganizationForAdmin } from '../../../../../src/organizational-entities/domain/models/OrganizationForAdmin.js';
import { usecases as organizationalEntitiesUsecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import * as organizationCreationValidator from '../../../../../src/organizational-entities/domain/validators/organization-creation-validator.js';
import {
  CertificationCenter,
  types as certificationCenterTypes,
} from '../../../../../src/shared/domain/models/CertificationCenter.js';
import { Membership } from '../../../../../src/shared/domain/models/index.js';
import { normalize } from '../../../../../src/shared/infrastructure/utils/string-utils.js';
import { usecases as teamUsecases } from '../../../../../src/team/domain/usecases/index.js';
import * as tooling from '../../common/tooling/index.js';
import { acceptPixOrgaTermsOfService } from '../../common/tooling/legal-documents.js';
import {
  SIMPLE_SCO_CERTIFICATION_CENTER_ID,
  SIMPLE_SCO_CERTIFICATION_USER_ID,
  SIMPLE_SCO_ORGANIZATION_MEMBER_ID,
  SIMPLE_SCO_SESSION,
} from '../constants.js';

/**
 * --- CERTIFICATION CASE ---
 *
 * The goal here is to reproduce the most simple certification case:
 *   - I'm a SCO user with a certifiable account
 *   - I'm able to start a certification course
 *   - The organization is Sco and managing students
 */
export default async function simpleScoManagingStudentsCertificationCase({ databaseBuilder }) {
  /**
   * 1. Create the certification session
   */
  const externalId = 'SCO_CERTIFICATION_ORGANIZATION';

  const organizationMember = databaseBuilder.factory.buildUser.withRawPassword({
    id: SIMPLE_SCO_ORGANIZATION_MEMBER_ID,
    firstName: 'Sco',
    lastName: 'Organization Member',
    email: 'sco-managing-students-v3@example.net',
    cgu: true,
    lang: 'fr',
    lastTermsOfServiceValidatedAt: new Date(),
    pixCertifTermsOfServiceAccepted: true,
  });

  acceptPixOrgaTermsOfService(databaseBuilder, organizationMember.id);

  await databaseBuilder.commit();

  // Organization
  const organization = new OrganizationForAdmin({
    name: 'Certification Sco Organization #1',
    type: 'SCO',
    isManagingStudents: true,
    externalId,
  });

  const newOrga = await organizationalEntitiesUsecases.createOrganization({
    organization,
    organizationCreationValidator,
  });

  const organizationMembership = await teamUsecases.createMembership({
    organizationRole: Membership.roles.ADMIN,
    userId: organizationMember.id,
    organizationId: newOrga.id,
  });

  // Certification center
  const certificationCenter = new CertificationCenter({
    id: SIMPLE_SCO_CERTIFICATION_CENTER_ID,
    name: 'Sco Certification Center #1',
    type: certificationCenterTypes.SCO,
    externalId,
    createdAt: new Date('2022-01-30'),
    habilitations: [],
  });

  const certificationCenterForAdmin = await organizationalEntitiesUsecases.createCertificationCenter({
    certificationCenter,
    complementaryCertificationIds: [],
  });

  await teamUsecases.createCertificationCenterMembershipForScoOrganizationAdminMember({
    membership: organizationMembership,
  });

  /**
   * 2. Create the certifiable user
   */
  const scoUser = databaseBuilder.factory.buildUser.withRawPassword({
    id: SIMPLE_SCO_CERTIFICATION_USER_ID,
    firstName: 'certifiable',
    lastName: 'sco-user',
    email: 'certifiable-sco-user@example.net',
    cgu: true,
    lang: 'fr',
    lastTermsOfServiceValidatedAt: new Date(),
  });

  await tooling.profile.createCertifiableProfile({
    databaseBuilder,
    userId: scoUser.id,
  });

  const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
    userId: scoUser.id,
    organizationId: newOrga.id,
    firstName: scoUser.firstName,
    lastName: scoUser.lastName,
    email: scoUser.email,
    division: 'Terminal',
    sex: 'F',
    birthdate: '2000-01-01',
    isCertifiable: true,
    isDisabled: false,
    certifiableAt: new Date('2022-01-30'),
  });

  for (let index = 0; index < 10; index++) {
    const otherUser = databaseBuilder.factory.buildUser.withRawPassword({
      firstName: `Élève-${index}`,
      lastName: `Non certifiable`,
      email: `non-certifiable-sco-user_${index}@example.net`,
      cgu: true,
      lang: 'fr',
    });
    databaseBuilder.factory.buildOrganizationLearner({
      firstName: otherUser.firstName,
      lastName: otherUser.lastName,
      sex: 'M',
      birthdate: '2000-01-01',
      birthCity: null,
      birthCityCode: '75115',
      birthCountryCode: '100',
      birthProvinceCode: null,
      division: '6eme',
      isDisabled: false,
      organizationId: newOrga.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    databaseBuilder.factory.buildOrganizationLearner({
      firstName: otherUser.firstName,
      lastName: otherUser.lastName,
      sex: 'M',
      birthdate: '2000-01-01',
      birthCity: null,
      birthCityCode: '75115',
      birthCountryCode: '100',
      birthProvinceCode: null,
      division: 'Terminal',
      isDisabled: false,
      organizationId: newOrga.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await databaseBuilder.commit();

  // Transform this user into certification candidate
  const candidate = new Candidate({
    authorizedToStart: true,
    organizationLearnerId: organizationLearner.id,
    firstName: organizationLearner.firstName,
    lastName: organizationLearner.lastName,
    sex: organizationLearner.sex,
    birthdate: organizationLearner.birthdate,
    birthCountry: 'France',
    birthINSEECode: '75115',
    email: organizationLearner.email,
    isLinked: true,
    hasSeenCertificationInstructions: false,
    accessibilityAdjustmentNeeded: false,
    subscriptions: [Subscription.buildCore({ certificationCandidateId: null })],
  });

  /**
   * 4. Initialize session
   */
  const session = await enrolmentUseCases.createSession({
    userId: organizationMember.id,
    session: {
      certificationCenterId: certificationCenterForAdmin.id,
      address: 'Rennes',
      room: '28D',
      examiner: 'Johnny Douw',
      date: '2025-01-30',
      time: '14:30',
      description: 'Description de la simple session Sco',
    },
  });
  await databaseBuilder.knex('sessions').where('id', session.id).update({
    id: SIMPLE_SCO_SESSION,
    accessCode: 'AZERTY',
  });

  await enrolmentUseCases.addCandidateToSession({
    sessionId: SIMPLE_SCO_SESSION,
    candidate,
    normalizeStringFnc: normalize,
  });
}
