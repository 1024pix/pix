const _ = require('lodash');
const learningContent = require('./learning-content');
const generic = require('./generic');

let verifCodeCount = 0;

module.exports = {
  createSession,
  createDraftScoSession,
  createPublishedScoSession,
  createDraftSession,
};

/**
 * Fonction générique pour créer une session selon une configuration donnée.
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
 * @returns {{sessionId: number}} sessionId
 */
function createSession({
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

  return { sessionId };
}

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

  const profileData = await _makeCandidatesCertifiable(databaseBuilder, certificationCandidates);
  await _makeCandidatesPassCertification(databaseBuilder, sessionId, certificationCandidates, profileData);

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
    const billingModes = [{
      billingMode: 'FREE',
      prepaymentCode: null,
    }, {
      billingMode: 'PREPAID',
      prepaymentCode: 'code',
    }, {
      billingMode: 'PAID',
      prepaymentCode: null,
    }];

    const complementaryCertificationIds = [null];
    if (configSession.registerToComplementaryCertifications) {
      complementaryCertificationIds.push(...await databaseBuilder
        .knex('complementary-certification-habilitations')
        .pluck('complementaryCertificationId')
        .where('certificationCenterId', certificationCenterId));
    }

    for (let i = 0; i < configSession.candidatesToRegisterCount; i++) {
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
        userId: hasJoinSession ? null : null,
        organizationLearnerId: null,
        authorizedToStart: false,
        billingMode: billingModes[i % extraTimePercentages.length].billingMode,
        prepaymentCode: billingModes[i % extraTimePercentages.length].prepaymentCode,
      });

      if (complementaryCertificationIds[i % complementaryCertificationIds.length]) {
        databaseBuilder.factory.buildComplementaryCertificationSubscription({
          complementaryCertificationId: complementaryCertificationIds[i % complementaryCertificationIds.length],
          certificationCandidateId: certificationCandidate.id,
        });
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
  const profileData = {};
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
    profileData[competence.id] = { threeMostDifficultSkillsAndChallenges: [], pixScore: 0, competence };
    const skills = await learningContent.findActiveSkillsByCompetenceId(competence.id);
    const orderedSkills = _.sortBy(skills, 'level');
    let i = 0;
    while (
      orderedSkills[i] &&
      (profileData[competence.id].pixScore < 8 ||
        profileData[competence.id].threeMostDifficultSkillsAndChallenges.length < 3)
    ) {
      const skill = orderedSkills[i];
      const challenge = await learningContent.findFirstValidatedChallengeBySkillId(skill.id);
      profileData[competence.id].threeMostDifficultSkillsAndChallenges.push({ challenge, skill });
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
      profileData[competence.id].pixScore += skill.pixValue;
      ++i;
      if (profileData[competence.id].threeMostDifficultSkillsAndChallenges.length > 3)
        profileData[competence.id].threeMostDifficultSkillsAndChallenges.splice(-3);
    }
    profileData[competence.id].pixScore = Math.ceil(profileData[competence.id].pixScore);
  }

  return profileData;
}

function _makeCandidatesPassCertification(databaseBuilder, sessionId, certificationCandidates, profileData) {
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
    let assessmentResultPixScore = 0;
    for (const competenceData of Object.values(profileData)) {
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

    for (const competenceData of Object.values(profileData)) {
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
