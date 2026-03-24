import dayjs from 'dayjs';

import { Frameworks } from '../../../../../src/certification/configuration/domain/models/Frameworks.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { PIX_EDU_2ND_DEGRE_COMPLEMENTARY_CERTIFICATION_ID } from '../../common/complementary-certification-builder.js';
import { CommonCertifiableUser } from '../shared/common-certifiable-user.js';
import { CommonCertificationVersions } from '../shared/common-certification-versions.js';
import { CommonOrganizations } from '../shared/common-organisations.js';
import {
  PIX_EDU_2ND_DEGRE_CERTIFICATION_CENTER_ID,
  SHARED_ORGANIZATION_USER_ID,
  V3_PUBLISHED_PIX_EDU_2ND_DEGRE_SESSION,
} from '../shared/constants.js';

export class PixPlusEdu2ndDegreV3Seed {
  constructor({ databaseBuilder }) {
    this.databaseBuilder = databaseBuilder;
  }

  async create() {
    const { organizationMember } = await CommonOrganizations.getSup({
      databaseBuilder: this.databaseBuilder,
    });

    this.#buildCertificationCenter({ organizationMember });

    const { certifiableUsers } = await CommonCertifiableUser.getInstance({
      databaseBuilder: this.databaseBuilder,
    });

    await CommonCertificationVersions.initPixPlusEdu2ndDegreVersion({
      databaseBuilder: this.databaseBuilder,
    });

    const versionId = CommonCertificationVersions.pixPlusEdu2ndDegreVersion.currentVersionId;

    const now = dayjs();

    this.databaseBuilder.factory.buildSession({
      id: V3_PUBLISHED_PIX_EDU_2ND_DEGRE_SESSION,
      certificationCenterId: PIX_EDU_2ND_DEGRE_CERTIFICATION_CENTER_ID,
      address: 'Paris',
      room: '42',
      examiner: 'Edu Cateur',
      date: now.format('YYYY-MM-DD'),
      time: '14:00',
      description: 'Pix+ Edu 2nd degré V3 session with published results',
      accessCode: 'EDU2DV3',
      finalizedAt: now.toDate(),
      publishedAt: now.toDate(),
      version: 3,
      createdBy: SHARED_ORGANIZATION_USER_ID,
    });

    this.databaseBuilder.factory.buildFinalizedSession({
      sessionId: V3_PUBLISHED_PIX_EDU_2ND_DEGRE_SESSION,
      certificationCenterName: 'Pix+ Edu 2nd degré V3 Certification Center',
      finalizedAt: now.toDate(),
      isPublishable: true,
      publishedAt: now.toDate(),
    });

    for (const user of certifiableUsers) {
      this.#buildPublishedCertificationForUser({ user, now, versionId });
    }

    await this.databaseBuilder.commit();
  }

  #buildCertificationCenter({ organizationMember }) {
    this.databaseBuilder.factory.buildCertificationCenter({
      id: PIX_EDU_2ND_DEGRE_CERTIFICATION_CENTER_ID,
      name: 'Pix+ Edu 2nd degré V3 Certification Center',
      type: 'SUP',
      externalId: 'PIX_EDU_2ND_DEGRE_V3_EXTERNAL_ID',
    });

    this.databaseBuilder.factory.buildComplementaryCertificationHabilitation({
      certificationCenterId: PIX_EDU_2ND_DEGRE_CERTIFICATION_CENTER_ID,
      complementaryCertificationId: PIX_EDU_2ND_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
    });

    this.databaseBuilder.factory.buildCertificationCenterMembership({
      userId: organizationMember.id,
      certificationCenterId: PIX_EDU_2ND_DEGRE_CERTIFICATION_CENTER_ID,
    });
  }

  #buildPublishedCertificationForUser({ user, now, versionId }) {
    const candidateId = this.databaseBuilder.factory.buildCertificationCandidate({
      firstName: user.firstName,
      lastName: user.lastName,
      sex: 'F',
      birthdate: '2000-10-30',
      birthINSEECode: '75115',
      email: user.email,
      sessionId: V3_PUBLISHED_PIX_EDU_2ND_DEGRE_SESSION,
      userId: user.id,
      authorizedToStart: true,
      billingMode: 'FREE',
      reconciledAt: now.toDate(),
    }).id;

    this.databaseBuilder.factory.buildComplementaryCertificationSubscription({
      certificationCandidateId: candidateId,
      complementaryCertificationId: PIX_EDU_2ND_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
    });

    const certificationCourseId = this.databaseBuilder.factory.buildCertificationCourse({
      createdAt: now.toDate(),
      firstName: user.firstName,
      lastName: user.lastName,
      birthdate: '2000-10-30',
      birthINSEECode: '75115',
      sex: 'F',
      isPublished: true,
      version: 3,
      userId: user.id,
      sessionId: V3_PUBLISHED_PIX_EDU_2ND_DEGRE_SESSION,
      framework: Frameworks.EDU_2ND_DEGRE,
      candidateId,
    }).id;

    const assessmentId = this.databaseBuilder.factory.buildAssessment({
      userId: user.id,
      type: Assessment.types.CERTIFICATION,
      state: Assessment.states.COMPLETED,
      certificationCourseId,
    }).id;

    this.databaseBuilder.factory.buildAssessmentResult.last({
      certificationCourseId,
      assessmentId,
      pixScore: null,
      status: 'validated',
      reachedMeshIndex: 0,
      capacity: 2.0,
      versionId,
    });
  }
}
