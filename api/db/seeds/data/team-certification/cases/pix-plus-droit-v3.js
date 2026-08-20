import dayjs from 'dayjs';

import { Frameworks } from '../../../../../src/certification/shared/domain/models/Frameworks.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID } from '../../common/complementary-certification-builder.js';
import { CommonCertifiableUser } from '../shared/common-certifiable-user.js';
import { CommonCertificationVersions } from '../shared/common-certification-versions.js';
import { CommonOrganizations } from '../shared/common-organisations.js';
import {
  PIX_DROIT_V3_CERTIFICATION_CENTER_ID,
  SHARED_ORGANIZATION_USER_ID,
  V3_PUBLISHED_PIX_DROIT_SESSION,
} from '../shared/constants.js';

export class PixPlusDroitV3Seed {
  constructor({ databaseBuilder }) {
    this.databaseBuilder = databaseBuilder;
  }

  async create() {
    const { organizationMember } = await CommonOrganizations.getPro({
      databaseBuilder: this.databaseBuilder,
    });

    this.#buildCertificationCenter({ organizationMember });

    const { certifiableUsers } = await CommonCertifiableUser.getInstance({
      databaseBuilder: this.databaseBuilder,
    });

    await CommonCertificationVersions.initPixPlusDroitVersion({
      databaseBuilder: this.databaseBuilder,
    });

    const versionId = CommonCertificationVersions.pixPlusDroitVersion.currentVersionId;

    const now = dayjs();

    this.databaseBuilder.factory.buildSession({
      id: V3_PUBLISHED_PIX_DROIT_SESSION,
      certificationCenterId: PIX_DROIT_V3_CERTIFICATION_CENTER_ID,
      address: 'Paris',
      room: '42',
      examiner: 'Droit Teur',
      date: now.format('YYYY-MM-DD'),
      time: '14:00',
      description: 'Pix+ Droit V3 session with published results',
      accessCode: 'DRTV3',
      finalizedAt: now.toDate(),
      publishedAt: now.toDate(),
      version: 3,
      createdBy: SHARED_ORGANIZATION_USER_ID,
    });

    this.databaseBuilder.factory.buildFinalizedSession({
      sessionId: V3_PUBLISHED_PIX_DROIT_SESSION,
      certificationCenterName: 'Pix+ Droit V3 Certification Center',
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
      id: PIX_DROIT_V3_CERTIFICATION_CENTER_ID,
      name: 'Pix+ Droit V3 Certification Center',
      type: 'PRO',
      externalId: 'PIX_DROIT_V3_EXTERNAL_ID',
    });

    this.databaseBuilder.factory.buildComplementaryCertificationHabilitation({
      certificationCenterId: PIX_DROIT_V3_CERTIFICATION_CENTER_ID,
      complementaryCertificationId: PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
    });

    this.databaseBuilder.factory.buildCertificationCenterMembership({
      userId: organizationMember.id,
      certificationCenterId: PIX_DROIT_V3_CERTIFICATION_CENTER_ID,
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
      sessionId: V3_PUBLISHED_PIX_DROIT_SESSION,
      userId: user.id,
      authorizedToStartAt: new Date(),
      billingMode: 'FREE',
      reconciledAt: now.toDate(),
      subscription: Frameworks.DROIT,
    }).id;

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
      sessionId: V3_PUBLISHED_PIX_DROIT_SESSION,
      framework: Frameworks.DROIT,
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
