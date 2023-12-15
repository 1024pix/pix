import * as tooling from '../common/tooling/index.js';
import * as campaignTooling from '../common/tooling/campaign-tooling.js';

import {
  CLEA_COMPLEMENTARY_CERTIFICATION_ID,
  COLLEGE_TAG_ID,
  PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_EDU_1ER_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_EDU_2ND_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
} from '../common/common-builder.js';
import { Assessment } from '../../../../src/shared/domain/models/Assessment.js';
import { getV3CertificationChallenges } from '../common/tooling/learning-content.js';

const TEAM_CERTIFICATION_OFFSET_ID = 7000;
// IDS
/// USERS
const SCO_CERTIFICATION_MANAGING_STUDENTS_ORGANIZATION_USER_ID = TEAM_CERTIFICATION_OFFSET_ID;
const SCO_CERTIFICATION_MANAGING_STUDENTS_CERTIFICATION_CENTER_USER_ID = TEAM_CERTIFICATION_OFFSET_ID + 1;
const PRO_CERTIFICATION_CENTER_USER_ID = TEAM_CERTIFICATION_OFFSET_ID + 2;
const PRO_ORGANIZATION_USER_ID = TEAM_CERTIFICATION_OFFSET_ID + 3;
const V3_CERTIFICATION_CENTER_USER_ID = TEAM_CERTIFICATION_OFFSET_ID + 4;
const CERTIFIABLE_SUCCESS_USER_ID = TEAM_CERTIFICATION_OFFSET_ID + 5;
/// ORGAS
const SCO_MANAGING_STUDENTS_ORGANIZATION_ID = TEAM_CERTIFICATION_OFFSET_ID;
const PRO_ORGANIZATION_ID = TEAM_CERTIFICATION_OFFSET_ID + 1;
/// CERTIFICATION CENTERS
const SCO_CERTIFICATION_CENTER_ID = TEAM_CERTIFICATION_OFFSET_ID + 1;
const PRO_CERTIFICATION_CENTER_ID = TEAM_CERTIFICATION_OFFSET_ID + 2;
const V3_CERTIFICATION_CENTER_ID = TEAM_CERTIFICATION_OFFSET_ID + 3;
/// EXTERNAL IDS
const CERTIFICATION_SCO_MANAGING_STUDENTS_EXTERNAL_ID = 'CERTIFICATION_SCO_MANAGING_STUDENTS_EXTERNAL_ID';
const PRO_EXTERNAL_ID = 'PRO_EXTERNAL_ID';
// SESSION IDS
const SCO_DRAFT_SESSION_ID = TEAM_CERTIFICATION_OFFSET_ID;
const SCO_PUBLISHED_SESSION_ID = TEAM_CERTIFICATION_OFFSET_ID + 1;
const DRAFT_SESSION_ID = TEAM_CERTIFICATION_OFFSET_ID + 2;
const PUBLISHED_SESSION_ID = TEAM_CERTIFICATION_OFFSET_ID + 3;
const PUBLISHED_SESSION_BEFORE_JULY_21_ID = TEAM_CERTIFICATION_OFFSET_ID + 6;
const V3_SESSION_ID = TEAM_CERTIFICATION_OFFSET_ID + 4;
const V3_PUBLISHED_SESSION_ID = TEAM_CERTIFICATION_OFFSET_ID + 7;
const PRO_STARTED_SESSION_ID = TEAM_CERTIFICATION_OFFSET_ID + 5;
const complementaryCertificationIds = [
  CLEA_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_EDU_1ER_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_EDU_2ND_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
];

async function teamCertificationDataBuilder({ databaseBuilder }) {
  await _createScoOrganization({ databaseBuilder });
  await _createScoCertificationCenter({ databaseBuilder });
  await _createProOrganization({ databaseBuilder });
  await _createProCertificationCenter({ databaseBuilder });
  await _createComplementaryCertificationCampaign({ databaseBuilder });
  await _createV3PilotCertificationCenter({ databaseBuilder });
  await _createSuccessCertifiableUser({ databaseBuilder });
  await _createScoSession({ databaseBuilder });
  await _createPublishedScoSession({ databaseBuilder });
  await _createSession({ databaseBuilder });
  await _createV3Session({ databaseBuilder });
  await _createPublishedSession({ databaseBuilder });
  await _createProStartedSession({ databaseBuilder });
  await _createIssueReportCategories({ databaseBuilder });
  await _createPublishedSessionBeforeJuly2021({ databaseBuilder });
  await _createAPublishedV3CertificationSession({ databaseBuilder });
}

export { teamCertificationDataBuilder };

async function _createScoCertificationCenter({ databaseBuilder }) {
  databaseBuilder.factory.buildUser.withRawPassword({
    id: SCO_CERTIFICATION_MANAGING_STUDENTS_CERTIFICATION_CENTER_USER_ID,
    firstName: 'Centre de certif SCO managing student',
    lastName: 'Certification',
    email: 'certif-sco@example.net',
    cgu: true,
    lang: 'fr',
    lastTermsOfServiceValidatedAt: new Date(),
    lastPixOrgaTermsOfServiceValidatedAt: new Date(),
    mustValidateTermsOfService: false,
    pixOrgaTermsOfServiceAccepted: false,
    pixCertifTermsOfServiceAccepted: false,
    hasSeenAssessmentInstructions: false,
    rawPassword: 'pix123',
    shouldChangePassword: false,
  });

  await tooling.certificationCenter.createCertificationCenter({
    databaseBuilder,
    certificationCenterId: SCO_CERTIFICATION_CENTER_ID,
    name: 'Centre de certification sco managing students',
    type: 'SCO',
    externalId: CERTIFICATION_SCO_MANAGING_STUDENTS_EXTERNAL_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    members: [{ id: SCO_CERTIFICATION_MANAGING_STUDENTS_CERTIFICATION_CENTER_USER_ID }],
    complementaryCertificationIds: [],
  });
}

async function _createV3PilotCertificationCenter({ databaseBuilder }) {
  databaseBuilder.factory.buildUser.withRawPassword({
    id: V3_CERTIFICATION_CENTER_USER_ID,
    firstName: 'membre certif v3',
    lastName: 'Certification',
    email: 'certifv3@example.net',
    cgu: true,
    lang: 'fr',
    lastTermsOfServiceValidatedAt: new Date(),
    lastPixOrgaTermsOfServiceValidatedAt: new Date(),
    mustValidateTermsOfService: false,
    pixOrgaTermsOfServiceAccepted: false,
    pixCertifTermsOfServiceAccepted: false,
    hasSeenAssessmentInstructions: false,
    rawPassword: 'pix123',
    shouldChangePassword: false,
  });

  await tooling.certificationCenter.createCertificationCenter({
    databaseBuilder,
    certificationCenterId: V3_CERTIFICATION_CENTER_ID,
    name: 'Centre de certification v3',
    type: 'PRO',
    externalId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    members: [{ id: V3_CERTIFICATION_CENTER_USER_ID }],
    isV3Pilot: true,
    complementaryCertificationIds: [],
  });
}

async function _createProCertificationCenter({ databaseBuilder }) {
  databaseBuilder.factory.buildUser.withRawPassword({
    id: PRO_CERTIFICATION_CENTER_USER_ID,
    firstName: 'Centre de certif Pro',
    lastName: 'Certification',
    email: 'certif-pro@example.net',
    cgu: true,
    lang: 'fr',
    lastTermsOfServiceValidatedAt: new Date(),
    lastPixOrgaTermsOfServiceValidatedAt: new Date(),
    mustValidateTermsOfService: false,
    pixOrgaTermsOfServiceAccepted: false,
    pixCertifTermsOfServiceAccepted: false,
    hasSeenAssessmentInstructions: false,
    rawPassword: 'pix123',
    shouldChangePassword: false,
  });

  await tooling.certificationCenter.createCertificationCenter({
    databaseBuilder,
    certificationCenterId: PRO_CERTIFICATION_CENTER_ID,
    name: 'Centre de certification pro',
    type: 'PRO',
    externalId: PRO_EXTERNAL_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    members: [{ id: PRO_CERTIFICATION_CENTER_USER_ID }],
    complementaryCertificationIds,
  });
}

async function _createScoOrganization({ databaseBuilder }) {
  databaseBuilder.factory.buildUser.withRawPassword({
    id: SCO_CERTIFICATION_MANAGING_STUDENTS_ORGANIZATION_USER_ID,
    firstName: 'Orga SCO managing Student',
    lastName: 'Certification',
    email: 'orga-sco-managing-students@example.net',
    cgu: true,
    lang: 'fr',
    lastTermsOfServiceValidatedAt: new Date(),
    lastPixOrgaTermsOfServiceValidatedAt: new Date(),
    mustValidateTermsOfService: false,
    pixOrgaTermsOfServiceAccepted: false,
    pixCertifTermsOfServiceAccepted: false,
    hasSeenAssessmentInstructions: false,
    rawPassword: 'pix123',
    shouldChangePassword: false,
  });
  await tooling.organization.createOrganization({
    databaseBuilder,
    organizationId: SCO_MANAGING_STUDENTS_ORGANIZATION_ID,
    type: 'SCO',
    name: 'Orga team Certification',
    isManagingStudents: true,
    externalId: CERTIFICATION_SCO_MANAGING_STUDENTS_EXTERNAL_ID,
    adminIds: [SCO_CERTIFICATION_MANAGING_STUDENTS_ORGANIZATION_USER_ID],
    configOrganization: {
      learnerCount: 8,
    },
    tagIds: [COLLEGE_TAG_ID],
  });
}

async function _createProOrganization({ databaseBuilder }) {
  databaseBuilder.factory.buildUser.withRawPassword({
    id: PRO_ORGANIZATION_USER_ID,
    firstName: 'Orga Pro',
    lastName: 'Certification',
    email: 'orga-pro@example.net',
    cgu: true,
    lang: 'fr',
    lastTermsOfServiceValidatedAt: new Date(),
    lastPixOrgaTermsOfServiceValidatedAt: new Date(),
    mustValidateTermsOfService: false,
    pixOrgaTermsOfServiceAccepted: false,
    pixCertifTermsOfServiceAccepted: false,
    hasSeenAssessmentInstructions: false,
    rawPassword: 'pix123',
    shouldChangePassword: false,
  });
  await tooling.organization.createOrganization({
    databaseBuilder,
    organizationId: PRO_ORGANIZATION_ID,
    type: 'PRO',
    name: 'Orga team Certification',
    isManagingStudents: true,
    externalId: PRO_EXTERNAL_ID,
    adminIds: [PRO_ORGANIZATION_USER_ID],
    configOrganization: {
      learnerCount: 8,
    },
  });
}

async function _createScoSession({ databaseBuilder }) {
  await tooling.session.createDraftScoSession({
    databaseBuilder,
    sessionId: SCO_DRAFT_SESSION_ID,
    organizationId: SCO_MANAGING_STUDENTS_ORGANIZATION_ID,
    accessCode: 'SCOS12',
    address: '1 rue Certification sco',
    certificationCenter: 'Centre de certification sco managing students',
    certificationCenterId: SCO_CERTIFICATION_CENTER_ID,
    date: new Date(),
    description: 'une description',
    examiner: 'Un super examinateur',
    room: '42',
    time: '12:00',
    createdAt: new Date(),
    configSession: {
      learnersToRegisterCount: 8,
    },
  });
}

async function _createPublishedScoSession({ databaseBuilder }) {
  const sessionDate = new Date();
  await tooling.session.createPublishedScoSession({
    databaseBuilder,
    sessionId: SCO_PUBLISHED_SESSION_ID,
    organizationId: SCO_MANAGING_STUDENTS_ORGANIZATION_ID,
    accessCode: 'SCOS34',
    address: '1 rue Certification sco',
    certificationCenter: 'Centre de certification sco managing students',
    certificationCenterId: SCO_CERTIFICATION_CENTER_ID,
    date: sessionDate,
    description: 'une description',
    examiner: 'Un super examinateur',
    room: '42',
    time: '12:00',
    examinerGlobalComment: 'Session sans pb',
    hasIncident: false,
    hasJoiningIssue: false,
    createdAt: sessionDate,
    finalizedAt: sessionDate,
    resultsSentToPrescriberAt: sessionDate,
    publishedAt: sessionDate,
    assignedCertificationOfficerId: null,
    juryComment: '',
    juryCommentAuthorId: null,
    juryCommentedAt: sessionDate,
    configSession: {
      learnersToRegisterCount: 8,
      maxLevel: 3,
      sessionDate,
    },
  });
}

async function _createSession({ databaseBuilder }) {
  await tooling.session.createDraftSession({
    databaseBuilder,
    sessionId: DRAFT_SESSION_ID,
    accessCode: 'SCOS56',
    address: '1 rue Certification',
    certificationCenter: 'Centre de certification pro',
    certificationCenterId: PRO_CERTIFICATION_CENTER_ID,
    date: new Date(),
    description: 'Session pro',
    examiner: 'Un super examinateur',
    room: '42',
    time: '12:00',
    createdAt: new Date(),
    configSession: {
      candidatesToRegisterCount: 10,
      hasComplementaryCertificationsToRegister: true,
    },
  });
}

async function _createSuccessCertifiableUser({ databaseBuilder }) {
  const userId = databaseBuilder.factory.buildUser.withRawPassword({
    id: CERTIFIABLE_SUCCESS_USER_ID,
    firstName: 'Certifiable',
    lastName: 'Certif',
    email: 'certif-success@example.net',
    cgu: true,
    lang: 'fr',
    lastTermsOfServiceValidatedAt: new Date(),
    lastPixOrgaTermsOfServiceValidatedAt: new Date(),
    mustValidateTermsOfService: false,
    pixOrgaTermsOfServiceAccepted: false,
    pixCertifTermsOfServiceAccepted: false,
    hasSeenAssessmentInstructions: false,
    shouldChangePassword: false,
  }).id;

  await tooling.profile.createPerfectProfile({
    databaseBuilder,
    userId,
  });
}

async function _createV3Session({
  databaseBuilder,
  configSession = {
    candidatesToRegisterCount: 1,
    hasComplementaryCertificationsToRegister: false,
  },
}) {
  return tooling.session.createDraftSession({
    databaseBuilder,
    sessionId: configSession.id ?? V3_SESSION_ID,
    accessCode: 'SUPV30',
    address: '1 rue Certification',
    certificationCenter: 'Centre de certification v3',
    certificationCenterId: V3_CERTIFICATION_CENTER_ID,
    date: new Date(),
    description: 'une description de session V3',
    examiner: 'Un super examinateur de session V3',
    room: '43',
    time: '13:00',
    createdAt: new Date(),
    version: 3,
    configSession,
  });
}

async function _createPublishedV3Session({
  databaseBuilder,
  configSession = {
    candidatesToRegisterCount: 1,
    hasComplementaryCertificationsToRegister: false,
  },
}) {
  return tooling.session.createPublishedSession({
    databaseBuilder,
    sessionId: configSession.id ?? V3_SESSION_ID,
    accessCode: 'SUPV30',
    address: '1 rue Certification',
    certificationCenter: 'Centre de certification v3',
    certificationCenterId: V3_CERTIFICATION_CENTER_ID,
    date: new Date(),
    description: 'une description de session V3',
    examiner: 'Un super examinateur de session V3',
    room: '43',
    time: '13:00',
    createdAt: new Date(),
    publishedAt: new Date(),
    makeCandidatesPassCertification: false,
    version: 3,
    configSession,
  });
}

async function _createPublishedSession({ databaseBuilder }) {
  const sessionDate = new Date();
  await tooling.session.createPublishedSession({
    databaseBuilder,
    sessionId: PUBLISHED_SESSION_ID,
    accessCode: 'SCOS78',
    address: '1 rue Certification pro',
    certificationCenter: 'Centre de certification pro',
    certificationCenterId: PRO_CERTIFICATION_CENTER_ID,
    date: sessionDate,
    description: 'Pro published session',
    examiner: 'Un super examinateur',
    room: '42',
    time: '12:00',
    examinerGlobalComment: 'Session sans pb',
    hasIncident: false,
    hasJoiningIssue: false,
    createdAt: sessionDate,
    finalizedAt: sessionDate,
    resultsSentToPrescriberAt: sessionDate,
    publishedAt: sessionDate,
    assignedCertificationOfficerId: null,
    juryComment: '',
    juryCommentAuthorId: null,
    juryCommentedAt: sessionDate,
    configSession: {
      candidatesToRegisterCount: 4,
      hasComplementaryCertificationsToRegister: true,
      maxLevel: 3,
      sessionDate,
    },
  });
}

async function _createPublishedSessionBeforeJuly2021({ databaseBuilder }) {
  const sessionDate = new Date('2021-05-01');
  await tooling.session.createPublishedSession({
    databaseBuilder,
    sessionId: PUBLISHED_SESSION_BEFORE_JULY_21_ID,
    accessCode: 'SCOS78',
    address: '1 rue Certification pro',
    certificationCenter: 'Centre de certification pro',
    certificationCenterId: PRO_CERTIFICATION_CENTER_ID,
    date: sessionDate,
    description: 'Pro published session bublished before july 2021',
    examiner: 'Un super examinateur',
    room: '42',
    time: '12:00',
    examinerGlobalComment: 'Session sans pb',
    hasIncident: false,
    hasJoiningIssue: false,
    createdAt: sessionDate,
    finalizedAt: sessionDate,
    resultsSentToPrescriberAt: sessionDate,
    publishedAt: sessionDate,
    assignedCertificationOfficerId: null,
    juryComment: '',
    juryCommentAuthorId: null,
    juryCommentedAt: sessionDate,
    configSession: {
      candidatesToRegisterCount: 4,
      hasComplementaryCertificationsToRegister: false,
      maxLevel: 3,
      sessionDate,
    },
  });
}

async function _createProStartedSession({ databaseBuilder }) {
  await tooling.session.createStartedSession({
    databaseBuilder,
    sessionId: PRO_STARTED_SESSION_ID,
    accessCode: `PROS78`,
    address: `1 rue Certification PRO`,
    certificationCenter: `Centre de certification PRO`,
    certificationCenterId: PRO_CERTIFICATION_CENTER_ID,
    date: new Date(),
    description: 'Pro started session',
    examiner: 'Un super examinateur',
    room: '42',
    time: '12:00',
    hasJoiningIssue: false,
    createdAt: new Date(),
    configSession: {
      candidatesToRegisterCount: 6,
      hasComplementaryCertificationsToRegister: true,
      maxLevel: 3,
    },
  });
}

async function _createComplementaryCertificationCampaign({ databaseBuilder }) {
  for (const complementaryCertificationId of complementaryCertificationIds) {
    const [targetProfileId] = await databaseBuilder
      .knex('complementary-certification-badges')
      .pluck('badges.targetProfileId')
      .join('badges', 'badges.id', 'complementary-certification-badges.badgeId')
      .where({ complementaryCertificationId })
      .whereNull('detachedAt');

    const campaignCode = _createCodeCampaign(complementaryCertificationId);
    await campaignTooling.createAssessmentCampaign({
      databaseBuilder,
      targetProfileId,
      name: 'Campagne evaluation team-certif',
      code: campaignCode,
      title: 'Campagne evaluation team-certif',
      configCampaign: {
        participantCount: 0,
      },
    });
  }
}

function _createCodeCampaign(complementaryCertificationId) {
  const campaignCode = `${complementaryCertificationId}`.padStart(9, 'CERTIF_');
  return campaignCode;
}

async function _createIssueReportCategories({ databaseBuilder }) {
  const candidateInformationChangeId = databaseBuilder.factory.buildIssueReportCategory({
    name: 'CANDIDATE_INFORMATIONS_CHANGES',
    isDeprecated: false,
    isImpactful: false,
  }).id;

  databaseBuilder.factory.buildIssueReportCategory({
    name: 'NAME_OR_BIRTHDATE',
    isDeprecated: false,
    isImpactful: true,
    issueReportCategoryId: candidateInformationChangeId,
  });

  databaseBuilder.factory.buildIssueReportCategory({
    name: 'EXTRA_TIME_PERCENTAGE',
    isDeprecated: false,
    isImpactful: false,
    issueReportCategoryId: candidateInformationChangeId,
  });

  databaseBuilder.factory.buildIssueReportCategory({
    name: 'SIGNATURE_ISSUE',
    isDeprecated: false,
    isImpactful: false,
  });

  databaseBuilder.factory.buildIssueReportCategory({
    name: 'FRAUD',
    isDeprecated: false,
    isImpactful: true,
  });

  databaseBuilder.factory.buildIssueReportCategory({
    name: 'NON_BLOCKING_CANDIDATE_ISSUE',
    isDeprecated: false,
    isImpactful: false,
  });

  databaseBuilder.factory.buildIssueReportCategory({
    name: 'NON_BLOCKING_TECHNICAL_ISSUE',
    isDeprecated: false,
    isImpactful: false,
  });

  const inChallengeId = databaseBuilder.factory.buildIssueReportCategory({
    name: 'IN_CHALLENGE',
    isDeprecated: false,
    isImpactful: false,
  }).id;

  databaseBuilder.factory.buildIssueReportCategory({
    name: 'IMAGE_NOT_DISPLAYING',
    isDeprecated: false,
    isImpactful: true,
    issueReportCategoryId: inChallengeId,
  });

  databaseBuilder.factory.buildIssueReportCategory({
    name: 'EMBED_NOT_WORKING',
    isDeprecated: false,
    isImpactful: true,
    issueReportCategoryId: inChallengeId,
  });

  databaseBuilder.factory.buildIssueReportCategory({
    name: 'FILE_NOT_OPENING',
    isDeprecated: false,
    isImpactful: true,
    issueReportCategoryId: inChallengeId,
  });

  databaseBuilder.factory.buildIssueReportCategory({
    name: 'WEBSITE_UNAVAILABLE',
    isDeprecated: false,
    isImpactful: true,
    issueReportCategoryId: inChallengeId,
  });

  databaseBuilder.factory.buildIssueReportCategory({
    name: 'WEBSITE_BLOCKED',
    isDeprecated: false,
    isImpactful: true,
    issueReportCategoryId: inChallengeId,
  });

  databaseBuilder.factory.buildIssueReportCategory({
    name: 'EXTRA_TIME_EXCEEDED',
    isDeprecated: false,
    isImpactful: true,
    issueReportCategoryId: inChallengeId,
  });

  databaseBuilder.factory.buildIssueReportCategory({
    name: 'SOFTWARE_NOT_WORKING',
    isDeprecated: false,
    isImpactful: true,
    issueReportCategoryId: inChallengeId,
  });

  databaseBuilder.factory.buildIssueReportCategory({
    name: 'UNINTENTIONAL_FOCUS_OUT',
    isDeprecated: false,
    isImpactful: true,
    issueReportCategoryId: inChallengeId,
  });

  databaseBuilder.factory.buildIssueReportCategory({
    name: 'SKIP_ON_OOPS',
    isDeprecated: false,
    isImpactful: true,
    issueReportCategoryId: inChallengeId,
  });

  databaseBuilder.factory.buildIssueReportCategory({
    name: 'ACCESSIBILITY_ISSUE',
    isDeprecated: false,
    isImpactful: true,
    issueReportCategoryId: inChallengeId,
  });
}

async function _createAPublishedV3CertificationSession({ databaseBuilder }) {
  const answers = ['ok', 'ko'];
  const scores = [640, 29];
  const numberOfChallengesPerCourse = 32;

  const { certificationCandidates } = await _createPublishedV3Session({
    databaseBuilder,
    configSession: {
      candidatesToRegisterCount: answers.length,
      hasComplementaryCertificationsToRegister: false,
      id: V3_PUBLISHED_SESSION_ID,
    },
  });

  const challenges = await getV3CertificationChallenges(numberOfChallengesPerCourse);
  certificationCandidates.map(async (certificationCandidate, candidateIndex) => {
    const { id: certificationCourseId } = databaseBuilder.factory.buildCertificationCourse({
      ...certificationCandidate,
      userId: CERTIFIABLE_SUCCESS_USER_ID,
      hasSeenEndTestScreen: true,
      isPublished: true,
      version: 3,
      pixCertificationStatus: 'validated',
    });

    const { id: assessmentId } = databaseBuilder.factory.buildAssessment({
      certificationCourseId,
      userId: CERTIFIABLE_SUCCESS_USER_ID,
      type: Assessment.types.CERTIFICATION,
      state: Assessment.states.COMPLETED,
    });

    challenges.forEach((challenge) => {
      databaseBuilder.factory.buildCertificationChallenge({
        associatedSkillName: challenge.skill.name,
        associatedSkillId: challenge.skill.id,
        challengeId: challenge.id,
        competenceId: challenge.competenceId,
        courseId: certificationCourseId,
      });

      databaseBuilder.factory.buildAnswer({
        associatedSkillName: challenge.skill.name,
        associatedSkillId: challenge.skill.id,
        challengeId: challenge.id,
        competenceId: challenge.competenceId,
        courseId: certificationCourseId,
        result: answers[candidateIndex],
        assessmentId,
      });
    });

    const { id: lastAssessmentResultId } = databaseBuilder.factory.buildAssessmentResult({
      juryId: 9000,
      assessmentId,
      certificationCourseId,
      pixScore: scores[candidateIndex],
    });

    databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
      lastAssessmentResultId,
      certificationCourseId,
    });
  });
}
