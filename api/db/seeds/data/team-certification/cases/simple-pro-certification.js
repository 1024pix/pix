import dayjs from 'dayjs';

import { services as enrolmentServices } from '../../../../../src/certification/enrolment/application/services/index.js';
import { Candidate } from '../../../../../src/certification/enrolment/domain/models/Candidate.js';
import { SessionEnrolment } from '../../../../../src/certification/enrolment/domain/models/SessionEnrolment.js';
import { Subscription } from '../../../../../src/certification/enrolment/domain/models/Subscription.js';
import { usecases as enrolmentUseCases } from '../../../../../src/certification/enrolment/domain/usecases/index.js';
import { usecases as sessionManagementUseCases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { BILLING_MODES } from '../../../../../src/certification/shared/domain/constants.js';
import { usecases as organizationalEntitiesUsecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import {
  CertificationCenter,
  types as certificationCenterTypes,
} from '../../../../../src/shared/domain/models/CertificationCenter.js';
import { normalize } from '../../../../../src/shared/infrastructure/utils/string-utils.js';
import { usecases as teamUsecases } from '../../../../../src/team/domain/usecases/index.js';
import { CommonCertifiableUser } from '../shared/common-certifiable-user.js';
import { CommonCertificationVersions } from '../shared/common-certification-versions.js';
import { CommonOrganizations } from '../shared/common-organisations.js';
import { PRO_CERTIFICATION_CENTER_ID, PUBLISHED_PRO_SESSION, STARTED_PRO_SESSION } from '../shared/constants.js';
import addSession from '../tools/add-session.js';
import publishSessionWithValidatedCertification from '../tools/publish-session-with-validated-certification.js';

/**
 * --- CERTIFICATION CASE ---
 *
 * The goal here is to reproduce one certification case:
 *   - The organization is PRO
 *   - I'm a pix app user with a certifiable account
 *   - I'm able to start a certification course
 *   - I have previously obtained a certif PRO with ~250 pix
 */
export class ProSeed {
  constructor({ databaseBuilder }) {
    this.databaseBuilder = databaseBuilder;
  }

  async create() {
    const { organization, organizationMember } = await this.#addOrganization();
    const { certificationCenter, certificationCenterMember } = await this.#addCertifCenter({
      organization,
      organizationMember,
    });
    const certifiableUsers = await this.#addCertifiableUsers();

    /**
     * Session with candidat ready to start his certification
     */
    await this.#initCertificationReferentials();
    const sessionReadyToStart = await this.#addReadyToStartSession({ certificationCenterMember, certificationCenter });

    for (const certifiableUser of certifiableUsers) {
      await this.#addCandidateToSession({ pixAppUser: certifiableUser, session: sessionReadyToStart });
    }

    /**
     * Session with a published certification
     */
    const sessionToPublish = await this.#addSessionToPublish({ certificationCenterMember, certificationCenter });

    const candidatesToPublish = [];
    for (const user of certifiableUsers) {
      const candidate = await this.#addCandidateToSession({ pixAppUser: user, session: sessionToPublish });
      candidatesToPublish.push(candidate);
    }

    await publishSessionWithValidatedCertification({
      databaseBuilder: this.databaseBuilder,
      sessionId: PUBLISHED_PRO_SESSION,
      candidatesIds: candidatesToPublish.map((candidate) => candidate.id),
      pixScoreTarget: 250,
    });
  }

  async #initCertificationReferentials() {
    await CommonCertificationVersions.initCoreVersions({
      databaseBuilder: this.databaseBuilder,
    });
  }

  async #addOrganization() {
    const { organization, organizationMember } = await CommonOrganizations.getPro({
      databaseBuilder: this.databaseBuilder,
    });
    return { organization, organizationMember };
  }

  async #addCertifCenter({ organization, organizationMember }) {
    const certificationCenter = await organizationalEntitiesUsecases.createCertificationCenter({
      certificationCenter: new CertificationCenter({
        id: PRO_CERTIFICATION_CENTER_ID,
        name: 'PRO Certification Center',
        type: certificationCenterTypes.PRO,
        externalId: organization.externalId,
        createdAt: new Date('2022-01-30'),
        habilitations: [],
      }),
      complementaryCertificationIds: [],
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

  async #addReadyToStartSession({ certificationCenterMember, certificationCenter }) {
    return addSession({
      databaseBuilder: this.databaseBuilder,
      createdByUserId: certificationCenterMember.user.id,
      forceSessionId: STARTED_PRO_SESSION,
      session: new SessionEnrolment({
        certificationCenterId: certificationCenter.id,
        address: 'Lyon',
        room: '69A',
        examiner: 'Jean Prea-demarrer',
        date: '2024-02-11',
        time: '09:10',
        description: 'PRO session with candidate ready to start',
      }),
    });
  }

  async #addSessionToPublish({ certificationCenterMember, certificationCenter }) {
    return addSession({
      databaseBuilder: this.databaseBuilder,
      createdByUserId: certificationCenterMember.user.id,
      forceSessionId: PUBLISHED_PRO_SESSION,
      session: new SessionEnrolment({
        certificationCenterId: certificationCenter.id,
        address: 'Lyon',
        room: '69A',
        examiner: 'Anne-Cess Ionfinie',
        date: dayjs().format('YYYY-MM-DD'),
        time: '16:30',
        description: 'PRO session with published results',
      }),
    });
  }

  async #addCandidateToSession({ pixAppUser, session }) {
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
      subscriptions: [Subscription.buildCore({ certificationCandidateId: null })],
      userId: pixAppUser.id,
      billingMode: BILLING_MODES.FREE,
    });

    const candidateId = await enrolmentUseCases.addCandidateToSession({
      sessionId: session.id,
      candidate: new Candidate(candidate), // Warning: usecase modifies the entry model...
      normalizeStringFnc: normalize,
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

    await sessionManagementUseCases.authorizeCertificationCandidateToStart({
      certificationCandidateForSupervisingId: candidateId,
      authorizedToStart: true,
    });

    return enrolmentUseCases.getCandidate({ certificationCandidateId: candidateId });
  }
}
