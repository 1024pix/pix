const _ = require('lodash');
const learningContent = require('./learning-content');
const generic = require('./generic');

module.exports = {
  createSession,
  createDraftScoSession,
  createPublishedScoSession,
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

  const organizationLearners = await _registerOrganizationLearnersToSession({
    databaseBuilder,
    sessionId,
    organizationId,
    hasJoinSession: true,
    configSession,
  });

  await _makeLearnersCertifiable(databaseBuilder, organizationLearners);

  return { sessionId };
}

async function _registerOrganizationLearnersToSession({
  databaseBuilder,
  sessionId,
  organizationId,
  hasJoinSession,
  configSession,
}) {
  if (configSession && configSession.learnersToRegisterCount > 0) {
    const extraTimePercentages = [null, 0.3, 0.5];
    const organizationLearners = await databaseBuilder
      .knex('organization-learners')
      .where({ organizationId })
      .limit(configSession.learnersToRegisterCount);

    organizationLearners.forEach((organizationLearner, index) => {
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
      });
    });

    return organizationLearners;
  }
  return [];
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

async function _makeLearnersCertifiable(databaseBuilder, organizationLearners) {
  const pixCompetences = await learningContent.getCoreCompetences();
  const fiveCompetences = generic.pickRandomAmong(pixCompetences, 5);
  const assessmentAndUserIds = organizationLearners.map((organizationLearner) => {
    const assessmentId = databaseBuilder.factory.buildAssessment({
      userId: organizationLearner.userId,
      type: 'COMPETENCE_EVALUATION',
    }).id;
    return { assessmentId, userId: organizationLearner.userId };
  });
  for (const competence of fiveCompetences) {
    const skills = await learningContent.findActiveSkillsByCompetenceId(competence.id);
    const orderedSkills = _.sortBy(skills, 'difficulty');
    let currentSum = 0,
      i = 0;
    while (currentSum < 8) {
      const skill = orderedSkills[i];
      const challenge = await learningContent.findFirstValidatedChallengeBySkillId(skill.id);
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
      currentSum += skill.pixValue;
      ++i;
    }
  }
}
