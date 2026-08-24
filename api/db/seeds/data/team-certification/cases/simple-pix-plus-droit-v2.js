import dayjs from 'dayjs';

import { Frameworks } from '../../../../../src/certification/shared/domain/models/Frameworks.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import {
  PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_DROIT_TARGET_PROFILE_2_ID,
} from '../../common/complementary-certification-builder.js';
import { CommonCertifiableUser } from '../shared/common-certifiable-user.js';
import { CommonOrganizations } from '../shared/common-organisations.js';
import {
  PIX_DROIT_CERTIFICATION_CENTER_ID,
  SHARED_ORGANIZATION_USER_ID,
  V2_PUBLISHED_DOUBLE_CERTIFICATION_DROIT_SESSION,
} from '../shared/constants.js';
import obtainDroitBadgeForUser from '../tools/double-certification/obtain-droit-badge-for-user.js';

const PIX_DROIT_INITIE_COMPLEMENTARY_CERTIFICATION_BADGE_ID = 63;

const COMPETENCE_MARKS = [
  {
    level: 5,
    score: 40,
    area_code: '1',
    competence_code: '1.1',
    competenceId: 'recsvLz0W2ShyfD63',
  },
  {
    level: 5,
    score: 40,
    area_code: '1',
    competence_code: '1.2',
    competenceId: 'recNv8qhaY887jQb2',
  },
  {
    level: 5,
    score: 40,
    area_code: '1',
    competence_code: '1.3',
    competenceId: 'recIkYm646lrGvLNT',
  },
  {
    level: 4,
    score: 32,
    area_code: '2',
    competence_code: '2.1',
    competenceId: 'recDH19F7kKrfL3Ii',
  },
  {
    level: 4,
    score: 32,
    area_code: '2',
    competence_code: '2.2',
    competenceId: 'recgxqQfz3BqEbtzh',
  },
  {
    level: 3,
    score: 24,
    area_code: '3',
    competence_code: '3.1',
    competenceId: 'recOdC9UDVJbAXHAm',
  },
  {
    level: 3,
    score: 24,
    area_code: '3',
    competence_code: '3.2',
    competenceId: 'recbDTF8KwupqkeZ6',
  },
  {
    level: 3,
    score: 24,
    area_code: '4',
    competence_code: '4.1',
    competenceId: 'rec6rHqas39zvLZep',
  },
  {
    level: 3,
    score: 24,
    area_code: '4',
    competence_code: '4.2',
    competenceId: 'recofJCxg0NqTqTdP',
  },
  {
    level: 4,
    score: 32,
    area_code: '5',
    competence_code: '5.1',
    competenceId: 'recIhdrmCuEmCDAzj',
  },
  {
    level: 3,
    score: 24,
    area_code: '5',
    competence_code: '5.2',
    competenceId: 'recudHE5Omrr10qrx',
  },
];

export class PixPlusDroitV2Seed {
  constructor({ databaseBuilder }) {
    this.databaseBuilder = databaseBuilder;
  }

  async create() {
    const { organization, organizationMember } = await CommonOrganizations.getPro({
      databaseBuilder: this.databaseBuilder,
    });

    this.#buildCertificationCenterWithHabilitation({ organizationMember });

    const { certifiableUsers } = await CommonCertifiableUser.getInstance({
      databaseBuilder: this.databaseBuilder,
    });

    await obtainDroitBadgeForUser({
      databaseBuilder: this.databaseBuilder,
      organizationId: organization.id,
      organizationMemberId: organizationMember.id,
      targetProfileId: PIX_DROIT_TARGET_PROFILE_2_ID,
      certifiableUsersIds: certifiableUsers.map((user) => user.id),
    });

    const now = dayjs();

    this.databaseBuilder.factory.buildSession({
      id: V2_PUBLISHED_DOUBLE_CERTIFICATION_DROIT_SESSION,
      certificationCenterId: PIX_DROIT_CERTIFICATION_CENTER_ID,
      address: 'Paris',
      room: '75',
      examiner: 'Anne-Cess Ionfinie',
      date: now.format('YYYY-MM-DD'),
      time: '16:30',
      description: 'Pix+Droit V2 session with published results',
      accessCode: 'DROITV2',
      finalizedAt: now.toDate(),
      publishedAt: now.toDate(),
      version: 2,
      createdBy: SHARED_ORGANIZATION_USER_ID,
    });

    this.databaseBuilder.factory.buildFinalizedSession({
      sessionId: V2_PUBLISHED_DOUBLE_CERTIFICATION_DROIT_SESSION,
      certificationCenterName: 'Pix+Droit V2 Certification Center',
      finalizedAt: now.toDate(),
      isPublishable: true,
      publishedAt: now.toDate(),
    });

    for (const user of certifiableUsers) {
      this.#buildPublishedCertificationForUser({ user, now });
    }

    await this.databaseBuilder.commit();
  }

  #buildCertificationCenterWithHabilitation({ organizationMember }) {
    this.databaseBuilder.factory.buildCertificationCenter({
      id: PIX_DROIT_CERTIFICATION_CENTER_ID,
      name: 'Pix+Droit V2 Certification Center',
      type: 'PRO',
      externalId: 'PIX_DROIT_V2_EXTERNAL_ID',
    });

    this.databaseBuilder.factory.buildComplementaryCertificationHabilitation({
      certificationCenterId: PIX_DROIT_CERTIFICATION_CENTER_ID,
      complementaryCertificationId: PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
    });

    this.databaseBuilder.factory.buildCertificationCenterMembership({
      userId: organizationMember.id,
      certificationCenterId: PIX_DROIT_CERTIFICATION_CENTER_ID,
    });
  }

  #buildPublishedCertificationForUser({ user, now }) {
    const candidateId = this.databaseBuilder.factory.buildCertificationCandidate({
      firstName: user.firstName,
      lastName: user.lastName,
      sex: 'F',
      birthdate: '2000-10-30',
      birthINSEECode: '75115',
      email: user.email,
      sessionId: V2_PUBLISHED_DOUBLE_CERTIFICATION_DROIT_SESSION,
      userId: user.id,
      authorizedToStartAt: new Date(),
      billingMode: 'FREE',
      reconciledAt: now.toDate(),
      subscription: Frameworks.DROIT,
    }).id;

    const certificationCourseId = this.databaseBuilder.factory.buildCertificationCourse({
      firstName: user.firstName,
      lastName: user.lastName,
      birthdate: '2000-10-30',
      birthINSEECode: '75115',
      sex: 'F',
      isPublished: true,
      version: 2,
      userId: user.id,
      sessionId: V2_PUBLISHED_DOUBLE_CERTIFICATION_DROIT_SESSION,
      framework: Frameworks.DROIT,
      candidateId,
    }).id;

    const assessmentId = this.databaseBuilder.factory.buildAssessment({
      userId: user.id,
      type: Assessment.types.CERTIFICATION,
      state: Assessment.states.COMPLETED,
      certificationCourseId,
    }).id;

    const totalPixScore = COMPETENCE_MARKS.reduce((sum, cm) => sum + cm.score, 0);

    const assessmentResultId = this.databaseBuilder.factory.buildAssessmentResult.last({
      certificationCourseId,
      assessmentId,
      pixScore: totalPixScore,
      reproducibilityRate: 100,
      status: 'validated',
    }).id;

    for (const cm of COMPETENCE_MARKS) {
      this.databaseBuilder.factory.buildCompetenceMark({
        ...cm,
        assessmentResultId,
      });
    }

    const complementaryCertificationCourseId = this.databaseBuilder.factory.buildComplementaryCertificationCourse({
      complementaryCertificationId: PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
      certificationCourseId,
      complementaryCertificationBadgeId: PIX_DROIT_INITIE_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
    }).id;

    this.databaseBuilder.factory.buildComplementaryCertificationCourseResult({
      complementaryCertificationCourseId,
      complementaryCertificationBadgeId: PIX_DROIT_INITIE_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
      acquired: true,
    });
  }
}
