// TODO : pour les certifs complémentaires HORS CLEA, sélectionner 4 épreuves par domaines PIX+
// TODO : pour cléa, se débrouiller pour remplacer les épreuves selectionnées naturellement dans le socle pix par les épreuves les plus dures du TP par compétence
// TODO : perf

const _ = require('lodash');
const learningContent = require('./learning-content');
const campaignTooling = require('./campaign-tooling');
const generic = require('./generic');
const {
  CLEA_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_EDU_1ER_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_EDU_2ND_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
} = require('../common-builder');

let verifCodeCount = 0;

module.exports = {
  createDraftScoSession,
  createPublishedScoSession,
  createDraftSession,
  createPublishedSession,
};

/**
 * Fonction générique pour créer une session sco avec candidats non démarrée selon une configuration donnée.
 * Retourne l'ID de la session.
 *
 * @param {DatabaseBuilder} databaseBuilder
 * @param {number} sessionId
 * @param {number} organizationId
 * @param {string} accessCode
 * @param {string} address
 * @param {string} certificationCenter
 * @param {number} certificationCenterId
 * @param {Date} date
 * @param {string} description
 * @param {string} examiner
 * @param {string} room
 * @param {string} time
 * @param {Date} createdAt
 * @param {string} supervisorPassword
 * @param configSession {learnersToRegisterCount: number }

 * @returns {Promise<{sessionId: number}>} sessionId
 */
async function createDraftScoSession({
  databaseBuilder,
  sessionId,
  organizationId,
  accessCode,
  address,
  certificationCenter,
  certificationCenterId,
  date,
  description,
  examiner,
  room,
  time,
  createdAt,
  configSession,
  supervisorPassword,
}) {
  _buildSession({
    databaseBuilder,
    sessionId,
    accessCode,
    address,
    certificationCenter,
    certificationCenterId,
    date,
    description,
    examiner,
    room,
    time,
    examinerGlobalComment: null,
    hasIncident: false,
    hasJoiningIssue: false,
    createdAt,
    finalizedAt: null,
    resultsSentToPrescriberAt: null,
    publishedAt: null,
    assignedCertificationOfficerId: null,
    juryComment: null,
    juryCommentAuthorId: null,
    juryCommentedAt: null,
    supervisorPassword,
  });

  await _registerOrganizationLearnersToSession({
    databaseBuilder,
    sessionId,
    organizationId,
    hasJoinSession: false,
    configSession,
  });

  return { sessionId };
}

/**
 * Fonction générique pour créer une session avec candidats non démarrée selon une configuration donnée.
 * Retourne l'ID de la session.
 *
 * @param {DatabaseBuilder} databaseBuilder
 * @param {number} sessionId
 * @param {string} accessCode
 * @param {string} address
 * @param {string} certificationCenter
 * @param {number} certificationCenterId
 * @param {Date} date
 * @param {string} description
 * @param {string} examiner
 * @param {string} room
 * @param {string} time
 * @param {Date} createdAt
 * @param {string} supervisorPassword
 * @param configSession {candidatesToRegisterCount: number, registerToComplementaryCertifications : boolean }

 * @returns {Promise<{sessionId: number}>} sessionId
 */
async function createDraftSession({
  databaseBuilder,
  sessionId,
  accessCode,
  address,
  certificationCenter,
  certificationCenterId,
  date,
  description,
  examiner,
  room,
  time,
  createdAt,
  configSession,
  supervisorPassword,
}) {
  _buildSession({
    databaseBuilder,
    sessionId,
    accessCode,
    address,
    certificationCenter,
    certificationCenterId,
    date,
    description,
    examiner,
    room,
    time,
    examinerGlobalComment: null,
    hasIncident: false,
    hasJoiningIssue: false,
    createdAt,
    finalizedAt: null,
    resultsSentToPrescriberAt: null,
    publishedAt: null,
    assignedCertificationOfficerId: null,
    juryComment: null,
    juryCommentAuthorId: null,
    juryCommentedAt: null,
    supervisorPassword,
  });

  await _registerCandidatesToSession({
    databaseBuilder,
    sessionId,
    hasJoinSession: false,
    configSession,
    certificationCenterId,
  });

  return { sessionId };
}

/**
 * Fonction générique pour créer une session SCO publiée selon une configuration donnée.
 * Retourne l'ID de la session.
 *
 * @param {DatabaseBuilder} databaseBuilder
 * @param {number} sessionId
 * @param {string} accessCode
 * @param {string} address
 * @param {string} certificationCenter
 * @param {number} certificationCenterId
 * @param {Date} date
 * @param {string} description
 * @param {string} examiner
 * @param {string} room
 * @param {string} time
 * @param {string} examinerGlobalComment
 * @param {boolean} hasIncident
 * @param {boolean} hasJoiningIssue
 * @param {Date} createdAt
 * @param {Date} finalizedAt
 * @param {Date} resultsSentToPrescriberAt
 * @param {Date} publishedAt
 * @param {number} assignedCertificationOfficerId
 * @param {string} juryComment
 * @param {number} juryCommentAuthorId
 * @param {Date} juryCommentedAt
 * @param {number} organizationId
 * @param {string} supervisorPassword
 * @param configSession {learnersToRegisterCount: number }
 * @returns {{sessionId: number}} sessionId
 */
async function createPublishedScoSession({
  databaseBuilder,
  sessionId,
  accessCode,
  address,
  certificationCenter,
  certificationCenterId,
  date,
  description,
  examiner,
  room,
  time,
  examinerGlobalComment,
  hasIncident,
  hasJoiningIssue,
  createdAt,
  finalizedAt,
  resultsSentToPrescriberAt,
  publishedAt,
  assignedCertificationOfficerId,
  juryComment,
  juryCommentAuthorId,
  juryCommentedAt,
  organizationId,
  supervisorPassword,
  configSession,
}) {
  _buildSession({
    databaseBuilder,
    sessionId,
    accessCode,
    address,
    certificationCenter,
    certificationCenterId,
    date,
    description,
    examiner,
    room,
    time,
    examinerGlobalComment,
    hasIncident,
    hasJoiningIssue,
    createdAt,
    finalizedAt,
    resultsSentToPrescriberAt,
    publishedAt,
    assignedCertificationOfficerId,
    juryComment,
    juryCommentAuthorId,
    juryCommentedAt,
    supervisorPassword,
  });
  databaseBuilder.factory.buildFinalizedSession({
    sessionId,
    isPublishable: true,
    certificationCenterName: certificationCenter,
    finalizedAt,
    date,
    time,
    publishedAt,
    assignedCertificationOfficerName: 'Mariah Carey',
  });

  const certificationCandidates = await _registerOrganizationLearnersToSession({
    databaseBuilder,
    sessionId,
    organizationId,
    hasJoinSession: true,
    configSession,
  });

  const { coreProfileData } = await _makeCandidatesCertifiable(databaseBuilder, certificationCandidates);
  await _makeCandidatesPassCertification(databaseBuilder, sessionId, certificationCandidates, coreProfileData);

  return { sessionId };
}

/**
 * Fonction générique pour créer une session publiée selon une configuration donnée.
 * Retourne l'ID de la session.
 *
 * @param {DatabaseBuilder} databaseBuilder
 * @param {number} sessionId
 * @param {string} accessCode
 * @param {string} address
 * @param {string} certificationCenter
 * @param {number} certificationCenterId
 * @param {Date} date
 * @param {string} description
 * @param {string} examiner
 * @param {string} room
 * @param {string} time
 * @param {string} examinerGlobalComment
 * @param {boolean} hasIncident
 * @param {boolean} hasJoiningIssue
 * @param {Date} createdAt
 * @param {Date} finalizedAt
 * @param {Date} resultsSentToPrescriberAt
 * @param {Date} publishedAt
 * @param {number} assignedCertificationOfficerId
 * @param {string} juryComment
 * @param {number} juryCommentAuthorId
 * @param {Date} juryCommentedAt
 * @param {string} supervisorPassword
 * @param configSession {candidatesToRegisterCount: number, registerToComplementaryCertifications : boolean }
 * @returns {{sessionId: number}} sessionId
 */
async function createPublishedSession({
  databaseBuilder,
  sessionId,
  accessCode,
  address,
  certificationCenter,
  certificationCenterId,
  date,
  description,
  examiner,
  room,
  time,
  examinerGlobalComment,
  hasIncident,
  hasJoiningIssue,
  createdAt,
  finalizedAt,
  resultsSentToPrescriberAt,
  publishedAt,
  assignedCertificationOfficerId,
  juryComment,
  juryCommentAuthorId,
  juryCommentedAt,
  supervisorPassword,
  configSession,
}) {
  _buildSession({
    databaseBuilder,
    sessionId,
    accessCode,
    address,
    certificationCenter,
    certificationCenterId,
    date,
    description,
    examiner,
    room,
    time,
    examinerGlobalComment,
    hasIncident,
    hasJoiningIssue,
    createdAt,
    finalizedAt,
    resultsSentToPrescriberAt,
    publishedAt,
    assignedCertificationOfficerId,
    juryComment,
    juryCommentAuthorId,
    juryCommentedAt,
    supervisorPassword,
  });
  databaseBuilder.factory.buildFinalizedSession({
    sessionId,
    isPublishable: true,
    certificationCenterName: certificationCenter,
    finalizedAt,
    date,
    time,
    publishedAt,
    assignedCertificationOfficerName: 'Mariah Carey',
  });

  const certificationCandidates = await _registerCandidatesToSession({
    databaseBuilder,
    sessionId,
    hasJoinSession: true,
    configSession,
    certificationCenterId,
  });

  const { coreProfileData, complementaryCertificationsSkillsAndChallenges } = await _makeCandidatesCertifiable(
    databaseBuilder,
    certificationCandidates,
  );
  await _makeCandidatesPassCertification(
    databaseBuilder,
    sessionId,
    certificationCandidates,
    coreProfileData,
    complementaryCertificationsSkillsAndChallenges,
  );

  return { sessionId };
}

async function _registerOrganizationLearnersToSession({
  databaseBuilder,
  sessionId,
  organizationId,
  hasJoinSession,
  configSession,
}) {
  const certificationCandidates = [];
  if (configSession && configSession.learnersToRegisterCount > 0) {
    const extraTimePercentages = [null, 0.3, 0.5];
    const organizationLearners = await databaseBuilder
      .knex('organization-learners')
      .where({ organizationId })
      .limit(configSession.learnersToRegisterCount);

    organizationLearners.forEach((organizationLearner, index) => {
      certificationCandidates.push(
        databaseBuilder.factory.buildCertificationCandidate({
          firstName: organizationLearner.firstName,
          lastName: organizationLearner.lastName,
          sex: organizationLearner.sex,
          birthPostalCode: null,
          birthCityCode: null,
          birthINSEECode: '75115',
          birthCity: 'PARIS 15',
          birthCountry: 'France',
          email: `${organizationLearner.firstName}-${organizationLearner.lastName}@example.net`,
          birthdate: '2000-01-04',
          sessionId,
          createdAt: new Date(),
          extraTimePercentage: extraTimePercentages[index % extraTimePercentages.length],
          userId: hasJoinSession ? organizationLearner.userId : null,
          organizationLearnerId: organizationLearner.id,
          authorizedToStart: false,
          billingMode: null,
          prepaymentCode: null,
        }),
      );
    });
  }
  return certificationCandidates;
}

async function _registerCandidatesToSession({
  databaseBuilder,
  sessionId,
  hasJoinSession,
  configSession,
  certificationCenterId,
}) {
  const certificationCandidates = [];
  if (configSession && configSession.candidatesToRegisterCount > 0) {
    const extraTimePercentages = [null, 0.3, 0.5];
    const billingModes = [
      {
        billingMode: 'FREE',
        prepaymentCode: null,
      },
      {
        billingMode: 'PREPAID',
        prepaymentCode: 'code',
      },
      {
        billingMode: 'PAID',
        prepaymentCode: null,
      },
    ];

    const complementaryCertificationIds = [null];
    if (configSession.registerToComplementaryCertifications) {
      complementaryCertificationIds.push(
        ...(await databaseBuilder
          .knex('complementary-certification-habilitations')
          .pluck('complementaryCertificationId')
          .where('certificationCenterId', certificationCenterId)),
      );
    }

    for (let i = 0; i < configSession.candidatesToRegisterCount; i++) {
      let userId = null;
      if (hasJoinSession) {
        userId = databaseBuilder.factory.buildUser.withRawPassword({
          firstName: `firstname${i}-${sessionId}`,
          lastName: `lastname${i}-${sessionId}`,
          email: `firstname${i}-${sessionId}-lastname${i}-${sessionId}@example.net`,
        }).id;
      }
      const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
        firstName: `firstname${i}-${sessionId}`,
        lastName: `lastname${i}-${sessionId}`,
        sex: 'F',
        birthPostalCode: null,
        birthCityCode: null,
        birthINSEECode: '75115',
        birthCity: 'PARIS 15',
        birthCountry: 'France',
        email: `firstname${i}-${sessionId}-lastname${i}-${sessionId}@example.net`,
        birthdate: '2000-01-04',
        sessionId,
        createdAt: new Date(),
        extraTimePercentage: extraTimePercentages[i % extraTimePercentages.length],
        userId,
        organizationLearnerId: null,
        authorizedToStart: false,
        billingMode: billingModes[i % extraTimePercentages.length].billingMode,
        prepaymentCode: billingModes[i % extraTimePercentages.length].prepaymentCode,
      });

      certificationCandidate.complementaryCertificationSubscribedId = null;
      if (complementaryCertificationIds[i % complementaryCertificationIds.length]) {
        databaseBuilder.factory.buildComplementaryCertificationSubscription({
          complementaryCertificationId: complementaryCertificationIds[i % complementaryCertificationIds.length],
          certificationCandidateId: certificationCandidate.id,
        });
        certificationCandidate.complementaryCertificationSubscribedId =
          complementaryCertificationIds[i % complementaryCertificationIds.length];
      }
      certificationCandidates.push(certificationCandidate);
    }
  }
  return certificationCandidates;
}

function _buildSession({
  databaseBuilder,
  sessionId,
  accessCode,
  address,
  certificationCenter,
  certificationCenterId,
  date,
  description,
  examiner,
  room,
  time,
  examinerGlobalComment,
  hasIncident,
  hasJoiningIssue,
  createdAt,
  finalizedAt,
  resultsSentToPrescriberAt,
  publishedAt,
  assignedCertificationOfficerId,
  juryComment,
  juryCommentAuthorId,
  juryCommentedAt,
  supervisorPassword,
}) {
  databaseBuilder.factory.buildSession({
    databaseBuilder,
    id: sessionId,
    accessCode,
    address,
    certificationCenter,
    certificationCenterId,
    date,
    description,
    examiner,
    room,
    time,
    examinerGlobalComment,
    hasIncident,
    hasJoiningIssue,
    createdAt,
    finalizedAt,
    resultsSentToPrescriberAt,
    publishedAt,
    assignedCertificationOfficerId,
    juryComment,
    juryCommentAuthorId,
    juryCommentedAt,
    supervisorPassword,
  });
}

async function _makeCandidatesCertifiable(databaseBuilder, certificationCandidates) {
  const coreProfileData = {};
  const pixCompetences = await learningContent.getCoreCompetences();
  const fiveCompetences = generic.pickRandomAmong(pixCompetences, 5);
  const assessmentAndUserIds = certificationCandidates.map((certificationCandidate) => {
    const assessmentId = databaseBuilder.factory.buildAssessment({
      userId: certificationCandidate.userId,
      type: 'COMPETENCE_EVALUATION',
    }).id;
    return { assessmentId, userId: certificationCandidate.userId };
  });
  for (const competence of fiveCompetences) {
    coreProfileData[competence.id] = { threeMostDifficultSkillsAndChallenges: [], pixScore: 0, competence };
    const skills = await learningContent.findActiveSkillsByCompetenceId(competence.id);
    const orderedSkills = _.sortBy(skills, 'level');
    let i = 0;
    while (
      orderedSkills[i] &&
      (coreProfileData[competence.id].pixScore < 8 ||
        coreProfileData[competence.id].threeMostDifficultSkillsAndChallenges.length < 3)
    ) {
      const skill = orderedSkills[i];
      const challenge = await learningContent.findFirstValidatedChallengeBySkillId(skill.id);
      coreProfileData[competence.id].threeMostDifficultSkillsAndChallenges.push({ challenge, skill });
      assessmentAndUserIds.forEach(({ assessmentId, userId }) => {
        const answerId = databaseBuilder.factory.buildAnswer({
          value: 'dummy value',
          result: 'ok',
          assessmentId,
          challengeId: challenge.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          timeout: null,
          resultDetails: 'dummy value',
        }).id;
        databaseBuilder.factory.buildKnowledgeElement({
          source: 'direct',
          status: 'validated',
          answerId,
          assessmentId,
          skillId: skill.id,
          createdAt: new Date(),
          earnedPix: skill.pixValue,
          userId,
          competenceId: skill.competenceId,
        });
      });
      coreProfileData[competence.id].pixScore += skill.pixValue;
      ++i;
      if (coreProfileData[competence.id].threeMostDifficultSkillsAndChallenges.length > 3)
        coreProfileData[competence.id].threeMostDifficultSkillsAndChallenges.splice(-3);
    }
    coreProfileData[competence.id].pixScore = Math.ceil(coreProfileData[competence.id].pixScore);
  }

  const complementaryCertificationsSkillsAndChallenges = {};
  for (const complementaryCertificationId of [
    PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
    PIX_EDU_1ER_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
    PIX_EDU_2ND_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
    CLEA_COMPLEMENTARY_CERTIFICATION_ID,
  ]) {
    const certificationCandidatesWithSubscription = certificationCandidates.filter(
      (certificationCandidate) =>
        certificationCandidate.complementaryCertificationSubscribedId === complementaryCertificationId,
    );
    if (certificationCandidatesWithSubscription.length > 0) {
      complementaryCertificationsSkillsAndChallenges[complementaryCertificationId] =
        await _makeCandidatesComplementaryCertificationCertifiable(
          databaseBuilder,
          complementaryCertificationId,
          certificationCandidatesWithSubscription,
        );
    }
  }

  return { coreProfileData, complementaryCertificationsSkillsAndChallenges };
}

function _makeCandidatesPassCertification(
  databaseBuilder,
  sessionId,
  certificationCandidates,
  coreProfileData,
  complementaryCertificationsSkillsAndChallenges = {},
) {
  for (const certificationCandidate of certificationCandidates) {
    const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
      userId: certificationCandidate.userId,
      sessionId: certificationCandidate.sessionId,
      firstName: certificationCandidate.firstName,
      lastName: certificationCandidate.lastName,
      birthdate: certificationCandidate.birthdate,
      birthPostalCode: certificationCandidate.birthPostalCode,
      birthINSEECode: certificationCandidate.birthINSEECode,
      birthCountry: certificationCandidate.birthCountry,
      sex: certificationCandidate.sex,
      birthplace: certificationCandidate.birthCity,
      externalId: certificationCandidate.externalId,
      isV2Certification: true,
      hasSeenEndTestScreen: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: new Date(),
      isPublished: true,
      verificationCode: `P-${verifCodeCount}`.padEnd(10, 'A'),
      maxReachableLevelOnCertificationDate: 6,
      isCancelled: false,
      abortReason: null,
      cpfFilename: null,
      cpfImportStatus: null,
      pixCertificationStatus: 'validated',
    }).id;
    verifCodeCount++;
    const assessmentId = databaseBuilder.factory.buildAssessment({
      certificationCourseId,
      userId: certificationCandidate.userId,
      type: 'CERTIFICATION',
      state: 'completed',
    }).id;

    if (certificationCandidate.complementaryCertificationSubscribedId) {
      const complementaryCertificationCourseId = databaseBuilder.factory.buildComplementaryCertificationCourse({
        certificationCourseId,
        complementaryCertificationId: certificationCandidate.complementaryCertificationSubscribedId,
        complementaryCertificationBadgeId:
          certificationCandidate.complementaryCertificationBadgeInfo.complementaryCertificationBadgeId,
      }).id;
      for (const { challenge, skill } of complementaryCertificationsSkillsAndChallenges[
        certificationCandidate.complementaryCertificationSubscribedId
      ]) {
        databaseBuilder.factory.buildCertificationChallenge({
          associatedSkillName: skill.name,
          associatedSkillId: skill.id,
          challengeId: challenge.id,
          competenceId: skill.competenceId,
          courseId: certificationCourseId,
          createdAt: new Date(),
          updatedAt: new Date(),
          isNeutralized: false,
          hasBeenSkippedAutomatically: false,
          certifiableBadgeKey: null,
        });
        databaseBuilder.factory.buildAnswer({
          value: 'dummy value',
          result: 'ok',
          assessmentId,
          challengeId: challenge.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          timeout: null,
          resultDetails: 'dummy value',
        });
      }
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        partnerKey: certificationCandidate.complementaryCertificationBadgeInfo.partnerKey,
        acquired: true,
        source: 'PIX',
        complementaryCertificationCourseId,
      });
    }
    let assessmentResultPixScore = 0;
    for (const competenceData of Object.values(coreProfileData)) {
      assessmentResultPixScore += competenceData.pixScore;
    }
    const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({
      pixScore: assessmentResultPixScore,
      reproducibilityRate: 100,
      status: 'validated',
      emitter: 'PIX-ALGO',
      commentForJury: '',
      commentForCandidate: '',
      commentForOrganization: '',
      juryId: null,
      assessmentId,
      createdAt: new Date(),
      certificationCourseId,
    }).id;
    databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
      certificationCourseId,
      lastAssessmentResultId: assessmentResultId,
    });
    for (const competenceData of Object.values(coreProfileData)) {
      databaseBuilder.factory.buildCompetenceMark({
        level: 1,
        score: competenceData.pixScore,
        area_code: `${competenceData.competence.index[0]}`,
        competence_code: `${competenceData.competence.index}`,
        competenceId: competenceData.competence.id,
        assessmentResultId,
        createdAt: new Date(),
      });
      for (const { challenge, skill } of competenceData.threeMostDifficultSkillsAndChallenges) {
        databaseBuilder.factory.buildCertificationChallenge({
          associatedSkillName: skill.name,
          associatedSkillId: skill.id,
          challengeId: challenge.id,
          competenceId: skill.competenceId,
          courseId: certificationCourseId,
          createdAt: new Date(),
          updatedAt: new Date(),
          isNeutralized: false,
          hasBeenSkippedAutomatically: false,
          certifiableBadgeKey: null,
        });
        databaseBuilder.factory.buildAnswer({
          value: 'dummy value',
          result: 'ok',
          assessmentId,
          challengeId: challenge.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          timeout: null,
          resultDetails: 'dummy value',
        });
      }
    }
  }
}

async function _makeCandidatesComplementaryCertificationCertifiable(
  databaseBuilder,
  complementaryCertificationId,
  certificationCandidates,
) {
  const targetProfileTubes = await databaseBuilder
    .knex('complementary-certification-badges')
    .select('target-profile_tubes.tubeId', 'target-profile_tubes.level', 'target-profile_tubes.targetProfileId')
    .join('badges', 'badges.id', 'complementary-certification-badges.badgeId')
    .join('target-profiles', 'target-profiles.id', 'badges.targetProfileId')
    .join('target-profile_tubes', 'target-profile_tubes.targetProfileId', 'target-profiles.id')
    .where({ complementaryCertificationId });
  const { campaignId } = await campaignTooling.createAssessmentCampaign({
    databaseBuilder,
    targetProfileId: targetProfileTubes[0].targetProfileId,
  });
  const badgeAndComplementaryCertificationBadgeIds = await databaseBuilder
    .knex('complementary-certification-badges')
    .select({
      badgeId: 'complementary-certification-badges.badgeId',
      complementaryCertificationBadgeId: 'complementary-certification-badges.id',
      partnerKey: 'badges.key',
    })
    .join('badges', 'badges.id', 'complementary-certification-badges.badgeId')
    .where({ complementaryCertificationId });
  const assessmentAndUserIds = certificationCandidates.map((certificationCandidate) => {
    const assessmentId = databaseBuilder.factory.buildAssessment({
      userId: certificationCandidate.userId,
      type: 'COMPETENCE_EVALUATION',
    }).id;
    const {
      badgeId: selectedBadgeId,
      complementaryCertificationBadgeId,
      partnerKey,
    } = generic.pickOneRandomAmong(badgeAndComplementaryCertificationBadgeIds);
    const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
      userId: certificationCandidate.userId,
      campaignId,
      state: 'SHARED',
    }).id;
    databaseBuilder.factory.buildBadgeAcquisition({
      userId: certificationCandidate.userId,
      badgeId: selectedBadgeId,
      campaignParticipationId,
    });
    certificationCandidate.complementaryCertificationBadgeInfo = { complementaryCertificationBadgeId, partnerKey };
    return { assessmentId, userId: certificationCandidate.userId };
  });

  const skillsAndChallenges = [];
  for (const cappedTube of targetProfileTubes) {
    let skills = await learningContent.findActiveSkillsByTubeId(cappedTube.tubeId);
    skills = skills.filter((skill) => skill.level <= parseInt(cappedTube.level));
    for (const skill of skills) {
      const challenge = await learningContent.findFirstValidatedChallengeBySkillId(skill.id);
      skillsAndChallenges.push({ challenge, skill });
      assessmentAndUserIds.forEach(({ assessmentId, userId }) => {
        const answerId = databaseBuilder.factory.buildAnswer({
          value: 'dummy value',
          result: 'ok',
          assessmentId,
          challengeId: challenge.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          timeout: null,
          resultDetails: 'dummy value',
        }).id;
        databaseBuilder.factory.buildKnowledgeElement({
          source: 'direct',
          status: 'validated',
          answerId,
          assessmentId,
          skillId: skill.id,
          createdAt: new Date(),
          earnedPix: skill.pixValue,
          userId,
          competenceId: skill.competenceId,
        });
      });
    }
  }

  return skillsAndChallenges;
}
