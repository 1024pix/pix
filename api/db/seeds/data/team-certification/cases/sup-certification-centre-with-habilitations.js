import { services as enrolmentServices } from '../../../../../src/certification/enrolment/application/services/index.js';
import { Candidate } from '../../../../../src/certification/enrolment/domain/models/Candidate.js';
import { SessionEnrolment } from '../../../../../src/certification/enrolment/domain/models/SessionEnrolment.js';
import { Subscription } from '../../../../../src/certification/enrolment/domain/models/Subscription.js';
import { usecases as enrolmentUseCases } from '../../../../../src/certification/enrolment/domain/usecases/index.js';
import { usecases as sessionManagementUseCases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { BILLING_MODES } from '../../../../../src/certification/shared/domain/constants.js';
import { ComplementaryCertificationKeys } from '../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { usecases as organizationalEntitiesUsecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import {
  CertificationCenter,
  types as certificationCenterTypes,
} from '../../../../../src/shared/domain/models/CertificationCenter.js';
import { normalize } from '../../../../../src/shared/infrastructure/utils/string-utils.js';
import { usecases as teamUsecases } from '../../../../../src/team/domain/usecases/index.js';
import {
  PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_EDU_1ER_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
} from '../../common/complementary-certification-builder.js';
import { CommonCertifiableUser } from '../shared/common-certifiable-user.js';
import { CommonCertificationVersions } from '../shared/common-certification-versions.js';
import { CommonOrganizations } from '../shared/common-organisations.js';
import {
  STARTED_PIX_DROIT_CERTIFICATION_SESSION,
  STARTED_PIX_EDU_1ER_DEGRE_CERTIFICATION_SESSION,
  SUP_CERTIFICATION_CENTER_ID,
} from '../shared/constants.js';
import addSession from '../tools/add-session.js';

/**
 * --- CERTIFICATION CASE ---
 *
 * The goal here is to reproduce one certification case:
 *   - The certification centre is SUP with multiple habilitations (Pix+Droit / Pix+Edu 1er degré)
 *   - I'm a pix app user with a certifiable account
 *   - I'm able to start a certification course
 */
export class SupWithHabilitationsSeed {
  constructor({ databaseBuilder }) {
    this.databaseBuilder = databaseBuilder;
  }

  async create() {
    const { organization, organizationMember } = await this.#addOrganization();
    const { certificationCenter, certificationCenterMember } = await this.#addCertificationCenter({
      organization,
      organizationMember,
    });
    const certifiableUsers = await this.#addCertifiableUsers();

    /**
     * Session Pix+Edu 1er degré with candidate ready to start his certification
     */
    await this.#initCertificationReferentials();
    const sessionDroitReadyToStart = await this.#addReadyToStartSession({
      certificationCenterMember,
      certificationCenter,
      address: 'Pix+Edu 1er degré room',
      description: 'Pix+Edu 1er degré session with candidate ready to start',
      forceSessionId: STARTED_PIX_EDU_1ER_DEGRE_CERTIFICATION_SESSION,
    });

    for (const certifiableUser of certifiableUsers) {
      await this.#addCandidateToSession({
        pixAppUser: certifiableUser,
        session: sessionDroitReadyToStart,
        subscriptions: [
          Subscription.buildComplementary({
            certificationCandidateId: null,
            complementaryCertificationKey: ComplementaryCertificationKeys.PIX_PLUS_EDU_1ER_DEGRE,
          }),
        ],
      });
    }

    /**
     * Session Pix+Droit with candidate ready to start his certification
     */
    const sessionEduReadyToStart = await this.#addReadyToStartSession({
      certificationCenterMember,
      certificationCenter,
      address: 'Pix+Droit room',
      description: 'Pix+Droit session with candidate ready to start',
      forceSessionId: STARTED_PIX_DROIT_CERTIFICATION_SESSION,
    });

    for (const certifiableUser of certifiableUsers) {
      await this.#addCandidateToSession({
        pixAppUser: certifiableUser,
        session: sessionEduReadyToStart,
        subscriptions: [
          Subscription.buildComplementary({
            certificationCandidateId: null,
            complementaryCertificationKey: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
          }),
        ],
      });
    }
  }

  async #initCertificationReferentials() {
    await CommonCertificationVersions.initCoreVersions({
      databaseBuilder: this.databaseBuilder,
    });

    await CommonCertificationVersions.initPixPlusDroitVersion({
      databaseBuilder: this.databaseBuilder,
    });

    await CommonCertificationVersions.initPixPlusEdu1erDegreVersion({
      databaseBuilder: this.databaseBuilder,
    });
  }

  async #addOrganization() {
    const { organization, organizationMember } = await CommonOrganizations.getSup({
      databaseBuilder: this.databaseBuilder,
    });
    return { organization, organizationMember };
  }

  async #addCertificationCenter({ organization, organizationMember }) {
    const certificationCenter = await organizationalEntitiesUsecases.createCertificationCenter({
      certificationCenter: new CertificationCenter({
        id: SUP_CERTIFICATION_CENTER_ID,
        name: 'SUP Certification Center (with habilitations)',
        type: certificationCenterTypes.SUP,
        externalId: organization.externalId,
        createdAt: new Date('2024-01-30'),
        habilitations: [
          ComplementaryCertificationKeys.PIX_PLUS_DROIT,
          ComplementaryCertificationKeys.PIX_PLUS_EDU_1ER_DEGRE,
        ],
      }),
      complementaryCertificationIds: [
        PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
        PIX_EDU_1ER_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
      ],
    });

    const certificationCenterMember = await teamUsecases.createCertificationCenterMembershipByEmail({
      certificationCenterId: certificationCenter.id,
      email: organizationMember.email,
    });

    return { certificationCenter, certificationCenterMember };
  }

  async #addCertifiableUsers() {
    const { certifiableUsers } = await CommonCertifiableUser.getInstance({ databaseBuilder: this.databaseBuilder });
    return certifiableUsers;
  }

  async #addReadyToStartSession({
    certificationCenterMember,
    certificationCenter,
    address,
    description,
    forceSessionId,
  }) {
    return addSession({
      databaseBuilder: this.databaseBuilder,
      createdByUserId: certificationCenterMember.user.id,
      forceSessionId,
      session: new SessionEnrolment({
        certificationCenterId: certificationCenter.id,
        address,
        room: '42',
        examiner: 'Alain Cendy',
        date: '2025-06-04',
        time: '09:10',
        description,
      }),
    });
  }

  async #addCandidateToSession({ pixAppUser, session, subscriptions }) {
    const candidateBirthdate = '2000-10-30';

    const candidate = new Candidate({
      firstName: pixAppUser.firstName,
      lastName: pixAppUser.lastName,
      sex: 'F',
      birthdate: new Date(candidateBirthdate),
      birthCountry: 'France',
      birthINSEECode: '75115',
      email: pixAppUser.email,
      isLinked: true,
      hasSeenCertificationInstructions: false,
      accessibilityAdjustmentNeeded: false,
      subscriptions,
      userId: pixAppUser.id,
      billingMode: BILLING_MODES.FREE,
    });

    const candidateId = await enrolmentUseCases.addCandidateToSession({
      sessionId: session.id,
      candidate: new Candidate(candidate), // Warning: usecase modifies the entry model...
      normalizeStringFnc: normalize,
    });

    await sessionManagementUseCases.authorizeCertificationCandidateToStart({
      certificationCandidateForSupervisingId: candidateId,
      authorizedToStart: true,
    });

    await enrolmentServices.registerCandidateParticipation({
      userId: pixAppUser.id,
      sessionId: session.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      birthdate: candidateBirthdate,
      isFrenchDomainExtension: true,
      normalizeStringFnc: normalize,
    });

    return enrolmentUseCases.getCandidate({ certificationCandidateId: candidateId });
  }
}
