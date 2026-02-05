import dayjs from 'dayjs';

import { services as enrolmentServices } from '../../../../../src/certification/enrolment/application/services/index.js';
import { Candidate } from '../../../../../src/certification/enrolment/domain/models/Candidate.js';
import { SessionEnrolment } from '../../../../../src/certification/enrolment/domain/models/SessionEnrolment.js';
import { Subscription } from '../../../../../src/certification/enrolment/domain/models/Subscription.js';
import { usecases as enrolmentUseCases } from '../../../../../src/certification/enrolment/domain/usecases/index.js';
import { usecases as sessionManagementUseCases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { usecases as organizationalEntitiesUsecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { usecases as prescriptionLearnerManagementUsecases } from '../../../../../src/prescription/learner-management/domain/usecases/index.js';
import {
  CertificationCenter,
  types as certificationCenterTypes,
} from '../../../../../src/shared/domain/models/CertificationCenter.js';
import { normalize } from '../../../../../src/shared/infrastructure/utils/string-utils.js';
import { usecases as teamUsecases } from '../../../../../src/team/domain/usecases/index.js';
import { LYCEE_TAG } from '../../common/constants.js';
import { CommonCertifiableUser } from '../shared/common-certifiable-user.js';
import { CommonCertificationVersions } from '../shared/common-certification-versions.js';
import { CommonOrganizations } from '../shared/common-organisations.js';
import { PUBLISHED_SCO_SESSION, SCO_CERTIFICATION_CENTER_ID, STARTED_SCO_SESSION } from '../shared/constants.js';
import addSession from '../tools/add-session.js';
import publishSessionWithValidatedCertification from '../tools/publish-session-with-validated-certification.js';

/**
 * --- CERTIFICATION CASE ---
 *
 * The goal here is to reproduce the most simple certification case:
 *   - The organization is SCO and managing students
 *   - I'm a SCO orga learner with a certifiable account
 *   - I'm able to start a certification course
 *   - I have previously obtained a certif SCO with ~550 pix
 */
export class ScoManagingStudent {
  constructor({ databaseBuilder }) {
    this.databaseBuilder = databaseBuilder;
  }

  async create() {
    const { organization, organizationMember } = await this.#addOrganization();
    await this.#setupScoBlockedAccessFeature({ organization });
    const { certificationCenter } = await this.#addCertifCenter({ organization, organizationMember });
    const organizationLearners = await this.#addCertifiableUsers({ organization });

    /**
     * Session with candidat ready to start his certification
     */
    await this.#initCertificationReferentials();
    const sessionReadyToStart = await this.#addReadyToStartSession({
      certificationCenterMember: organizationMember,
      certificationCenter,
    });

    for (const organizationLearner of organizationLearners) {
      await this.#addCandidateToSession({ organizationLearner, session: sessionReadyToStart });
    }

    /**
     * Session with a published certification
     */
    const sessionToPublish = await this.#addSessionToPublish({
      certificationCenterMember: organizationMember,
      certificationCenter,
    });

    const candidatesToPublish = [];
    for (const organizationLearner of organizationLearners) {
      const candidate = await this.#addCandidateToSession({ organizationLearner, session: sessionToPublish });
      candidatesToPublish.push(candidate);
    }

    await publishSessionWithValidatedCertification({
      databaseBuilder: this.databaseBuilder,
      sessionId: PUBLISHED_SCO_SESSION,
      candidatesIds: candidatesToPublish.map((candidate) => candidate.id),
      pixScoreTarget: 550,
    });
  }

  async #initCertificationReferentials() {
    await CommonCertificationVersions.initCoreVersions({
      databaseBuilder: this.databaseBuilder,
    });
  }

  async #addOrganization() {
    const { organization, organizationMember } = await CommonOrganizations.getScoManagingStudents({
      databaseBuilder: this.databaseBuilder,
    });
    return { organization, organizationMember };
  }

  async #setupScoBlockedAccessFeature({ organization }) {
    await organizationalEntitiesUsecases.addTagsToOrganizations({
      organizationTags: [{ organizationId: organization.id, tagName: LYCEE_TAG.name }],
    });

    this.databaseBuilder.factory.buildDefaultScoBlockedAccessDates();
    await this.databaseBuilder.commit();
  }

  async #addCertifCenter({ organization, organizationMember }) {
    const certificationCenter = await organizationalEntitiesUsecases.createCertificationCenter({
      certificationCenter: new CertificationCenter({
        id: SCO_CERTIFICATION_CENTER_ID,
        name: 'SCO Certification Center',
        type: certificationCenterTypes.SCO,
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

  async #addCertifiableUsers({ organization }) {
    const organizationLearners = [];

    const { certifiableUsers } = await CommonCertifiableUser.getInstance({ databaseBuilder: this.databaseBuilder });

    for (const certifiableUser of certifiableUsers) {
      await this.databaseBuilder.factory.buildOrganizationLearner({
        userId: certifiableUser.id,
        organizationId: organization.id,
        nationalStudentId: 'INE' + certifiableUser.id,
        firstName: certifiableUser.firstName,
        lastName: certifiableUser.lastName,
        email: certifiableUser.email,
        division: 'Terminale',
        sex: 'F',
        birthdate: '2000-01-01',
        isCertifiable: true,
        isDisabled: false,
        certifiableAt: new Date('2022-01-30'),
      });

      await this.databaseBuilder.commit();

      const organizationLearner =
        await prescriptionLearnerManagementUsecases.reconcileScoOrganizationLearnerAutomatically({
          organizationId: organization.id,
          userId: certifiableUser.id,
        });

      organizationLearners.push(organizationLearner);
    }

    return organizationLearners;
  }

  async #addReadyToStartSession({ certificationCenterMember, certificationCenter }) {
    return addSession({
      databaseBuilder: this.databaseBuilder,
      createdByUserId: certificationCenterMember.id,
      forceSessionId: STARTED_SCO_SESSION,
      session: new SessionEnrolment({
        certificationCenterId: certificationCenter.id,
        address: 'Rennes',
        room: '28D',
        examiner: 'Jean Prea-demarrer',
        date: '2024-01-30',
        time: '14:30',
        description: 'SCO session with candidates ready to start',
      }),
    });
  }

  async #addCandidateToSession({ organizationLearner, session }) {
    const candidate = new Candidate({
      firstName: organizationLearner.firstName,
      lastName: organizationLearner.lastName,
      sex: 'F',
      birthdate: new Date(organizationLearner.birthdate),
      birthCountry: 'France',
      birthINSEECode: '75115',
      email: organizationLearner.email,
      isLinked: true,
      hasSeenCertificationInstructions: false,
      accessibilityAdjustmentNeeded: false,
      subscriptions: [Subscription.buildCore({ certificationCandidateId: null })],
      userId: organizationLearner.userId,
      organizationLearnerId: organizationLearner.id,
    });

    await enrolmentUseCases.enrolStudentsToSession({
      sessionId: session.id,
      studentIds: [organizationLearner.id],
    });

    const registeredCandidate = await enrolmentServices.registerCandidateParticipation({
      userId: organizationLearner.userId,
      sessionId: session.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      birthdate: organizationLearner.birthdate,
      isFrenchDomainExtension: true,
      normalizeStringFnc: normalize,
    });

    await sessionManagementUseCases.authorizeCertificationCandidateToStart({
      certificationCandidateForSupervisingId: registeredCandidate.id,
      authorizedToStart: true,
    });

    return registeredCandidate;
  }

  async #addSessionToPublish({ certificationCenterMember, certificationCenter }) {
    return addSession({
      databaseBuilder: this.databaseBuilder,
      createdByUserId: certificationCenterMember.id,
      forceSessionId: PUBLISHED_SCO_SESSION,
      session: new SessionEnrolment({
        certificationCenterId: certificationCenter.id,
        address: 'Rennes',
        room: '28D',
        examiner: 'Anne-Cess Ionfinie',
        date: dayjs().format('YYYY-MM-DD'),
        time: '16:30',
        description: 'SCO session with published results',
      }),
    });
  }
}
