import _ from 'lodash';
import * as learningContent from './learning-content.js';
import * as campaignTooling from './campaign-tooling.js';
import * as generic from './generic.js';

import {
  CLEA_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_EDU_1ER_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_EDU_2ND_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
} from '../common-builder.js';
import { Assessment } from '../../../../../lib/domain/models/Assessment.js';

let verifCodeCount = 0;

export {
  createDraftScoSession,
  createPublishedScoSession,
  createDraftSession,
  createPublishedSession,
  createStartedSession,
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

  await databaseBuilder.commit();
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
 * @param {number} version
 * @param configSession {candidatesToRegisterCount: number, hasComplementaryCertificationsToRegister : boolean }

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
  version,
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
    version,
  });

  await _registerCandidatesToSession({
    databaseBuilder,
    sessionId,
    hasJoinSession: false,
    configSession,
    certificationCenterId,
  });

  await databaseBuilder.commit();
  return { sessionId };
}

/**
 * Fonction générique pour créer une session démarrée avec candidats selon une configuration donnée.
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
 * @param configSession {candidatesToRegisterCount: number, hasComplementaryCertificationsToRegister : boolean }

 * @returns {Promise<{sessionId: number}>} sessionId
 */
async function createStartedSession({
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

  const certificationCandidates = await _registerSomeCandidatesToSession({
    databaseBuilder,
    sessionId,
    configSession,
    certificationCenterId,
  });

  await _makeCandidatesCertifiable(databaseBuilder, certificationCandidates);

  await databaseBuilder.commit();
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

  await databaseBuilder.commit();
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
 * @param configSession {candidatesToRegisterCount: number, hasComplementaryCertificationsToRegister : boolean }
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

  const { coreProfileData, complementaryCertificationsProfileData } = await _makeCandidatesCertifiable(
    databaseBuilder,
    certificationCandidates,
  );
  await _makeCandidatesPassCertification(
    databaseBuilder,
    sessionId,
    certificationCandidates,
    coreProfileData,
    complementaryCertificationsProfileData,
  );

  await databaseBuilder.commit();
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
  if (_hasLearnersToRegister(configSession)) {
    const extraTimePercentages = [null, 0.3, 0.5];
    const organizationLearners = await _buildOrganizationLearners(databaseBuilder, organizationId, configSession);

    _addCertificationCandidatesToScoSession(
      organizationLearners,
      certificationCandidates,
      databaseBuilder,
      sessionId,
      extraTimePercentages,
      hasJoinSession,
    );
  }
  return certificationCandidates;
}

function _addCertificationCandidatesToScoSession(
  organizationLearners,
  certificationCandidates,
  databaseBuilder,
  sessionId,
  extraTimePercentages,
  hasJoinSession,
) {
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

async function _buildOrganizationLearners(databaseBuilder, organizationId, configSession) {
  return await databaseBuilder
    .knex('organization-learners')
    .where({ organizationId })
    .limit(configSession.learnersToRegisterCount);
}

function _hasLearnersToRegister(configSession) {
  return configSession && configSession.learnersToRegisterCount > 0;
}

async function _registerCandidatesToSession({
  databaseBuilder,
  sessionId,
  hasJoinSession,
  configSession,
  certificationCenterId,
}) {
  const certificationCandidates = [];
  if (_hasCertificationCandidatesToRegister(configSession)) {
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
    if (configSession.hasComplementaryCertificationsToRegister) {
      await _getComplementaryCertificationIdsFromCertificationCenterHabilitations({
        complementaryCertificationIds,
        databaseBuilder,
        certificationCenterId,
      });
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

      const { billingMode: randomBillingMode, prepaymentCode: randomPrepaymentCode } =
        billingModes[i % billingModes.length];

      const randomExtraTimePercentage = extraTimePercentages[i % extraTimePercentages.length];

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
        extraTimePercentage: randomExtraTimePercentage,
        userId,
        organizationLearnerId: null,
        authorizedToStart: false,
        billingMode: randomBillingMode,
        prepaymentCode: randomPrepaymentCode,
      });

      certificationCandidate.complementaryCertificationSubscribedId = null;

      const randomComplementaryCertificationId =
        complementaryCertificationIds[i % complementaryCertificationIds.length];

      // randomComplementaryCertificationId can be null
      if (randomComplementaryCertificationId) {
        databaseBuilder.factory.buildComplementaryCertificationSubscription({
          complementaryCertificationId: randomComplementaryCertificationId,
          certificationCandidateId: certificationCandidate.id,
        });
        certificationCandidate.complementaryCertificationSubscribedId = randomComplementaryCertificationId;
      }
      certificationCandidates.push(certificationCandidate);
    }
  }
  return certificationCandidates;
}

async function _registerSomeCandidatesToSession({ databaseBuilder, sessionId, configSession, certificationCenterId }) {
  const certificationCandidates = [];
  if (_hasCertificationCandidatesToRegister(configSession)) {
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
    if (configSession.hasComplementaryCertificationsToRegister) {
      await _getComplementaryCertificationIdsFromCertificationCenterHabilitations({
        complementaryCertificationIds,
        databaseBuilder,
        certificationCenterId,
      });
    }

    for (let i = 0; i < configSession.candidatesToRegisterCount; i++) {
      const hasJoinedSessionPossibleValues = [true, false];
      const hasJoinedSession = hasJoinedSessionPossibleValues[i % hasJoinedSessionPossibleValues.length];

      const userId = databaseBuilder.factory.buildUser.withRawPassword({
        firstName: `firstname${i}-${sessionId}`,
        lastName: `lastname${i}-${sessionId}`,
        email: `firstname${i}-${sessionId}@example.net`,
      }).id;

      const { billingMode: randomBillingMode, prepaymentCode: randomPrepaymentCode } =
        billingModes[i % billingModes.length];

      const randomExtraTimePercentage = extraTimePercentages[i % extraTimePercentages.length];

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
        extraTimePercentage: randomExtraTimePercentage,
        userId: hasJoinedSession ? userId : null,
        organizationLearnerId: null,
        authorizedToStart: false,
        billingMode: randomBillingMode,
        prepaymentCode: randomPrepaymentCode,
      });

      certificationCandidate.complementaryCertificationSubscribedId = null;

      const randomComplementaryCertificationId =
        complementaryCertificationIds[i % complementaryCertificationIds.length];

      // randomComplementaryCertificationId can be null
      if (randomComplementaryCertificationId && hasJoinedSession) {
        databaseBuilder.factory.buildComplementaryCertificationSubscription({
          complementaryCertificationId: randomComplementaryCertificationId,
          certificationCandidateId: certificationCandidate.id,
        });
        certificationCandidate.complementaryCertificationSubscribedId = randomComplementaryCertificationId;
      }
      certificationCandidates.push(certificationCandidate);
    }
  }
  return certificationCandidates;
}

async function _getComplementaryCertificationIdsFromCertificationCenterHabilitations({
  complementaryCertificationIds,
  databaseBuilder,
  certificationCenterId,
}) {
  complementaryCertificationIds.push(
    ...(await databaseBuilder
      .knex('complementary-certification-habilitations')
      .pluck('complementaryCertificationId')
      .where('certificationCenterId', certificationCenterId)),
  );
}

function _hasCertificationCandidatesToRegister(configSession) {
  return configSession && configSession.candidatesToRegisterCount > 0;
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
  version,
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
    version,
  });
}

async function _makeCandidatesCertifiable(databaseBuilder, certificationCandidates) {
  return {
    coreProfileData: await _makeCandidatesCoreCertifiable(databaseBuilder, certificationCandidates),
    complementaryCertificationsProfileData: await _makeCandidatesComplementaryCertifiable(
      databaseBuilder,
      certificationCandidates,
    ),
  };
}

async function _makeCandidatesCoreCertifiable(databaseBuilder, certificationCandidates) {
  const coreProfileData = {};
  const pixCompetences = await learningContent.getCoreCompetences();
  const assessmentAndUserIds = certificationCandidates.map((certificationCandidate) => {
    const assessmentId = databaseBuilder.factory.buildAssessment({
      userId: certificationCandidate.userId,
      type: 'COMPETENCE_EVALUATION',
    }).id;
    return { assessmentId, userId: certificationCandidate.userId };
  });
  // All candidates are super super good
  // They all passed the hardest skills of each competence,
  // Thus, they will be certifiable in all pix competences, at the best level
  for (const competence of pixCompetences) {
    coreProfileData[competence.id] = { threeMostDifficultSkillsAndChallenges: [], pixScore: 0, competence };
    const skills = await learningContent.findActiveSkillsByCompetenceId(competence.id);
    const orderedSkills = _.sortBy(skills, 'level');
    for (const skill of orderedSkills) {
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
    }
    coreProfileData[competence.id].threeMostDifficultSkillsAndChallenges = _.takeRight(
      coreProfileData[competence.id].threeMostDifficultSkillsAndChallenges,
      3,
    );
    coreProfileData[competence.id].pixScore = Math.ceil(coreProfileData[competence.id].pixScore);
  }
  return coreProfileData;
}

async function _makeCandidatesComplementaryCertifiable(databaseBuilder, certificationCandidates) {
  const complementaryCertificationsProfileData = {};
  for (const { complementaryCertificationId, frameworkName } of [
    { complementaryCertificationId: PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID, frameworkName: 'Droit' },
    { complementaryCertificationId: PIX_EDU_1ER_DEGRE_COMPLEMENTARY_CERTIFICATION_ID, frameworkName: 'Edu' },
    { complementaryCertificationId: PIX_EDU_2ND_DEGRE_COMPLEMENTARY_CERTIFICATION_ID, frameworkName: 'Edu' },
    { complementaryCertificationId: CLEA_COMPLEMENTARY_CERTIFICATION_ID, frameworkName: '' },
  ]) {
    const certificationCandidatesWithSubscription = certificationCandidates.filter(
      (certificationCandidate) =>
        certificationCandidate.complementaryCertificationSubscribedId === complementaryCertificationId,
    );
    if (certificationCandidatesWithSubscription.length > 0) {
      complementaryCertificationsProfileData[complementaryCertificationId] =
        await _makeCandidatesComplementaryCertificationCertifiable(
          databaseBuilder,
          complementaryCertificationId,
          frameworkName,
          certificationCandidatesWithSubscription,
        );
    }
  }
  return complementaryCertificationsProfileData;
}

async function _makeCandidatesComplementaryCertificationCertifiable(
  databaseBuilder,
  complementaryCertificationId,
  frameworkName,
  certificationCandidates,
) {
  const [targetProfileId] = await databaseBuilder
    .knex('complementary-certification-badges')
    .pluck('badges.targetProfileId')
    .join('badges', 'badges.id', 'complementary-certification-badges.badgeId')
    .where({ complementaryCertificationId });
  const campaignCode = _createCampaignCode(frameworkName, complementaryCertificationId);
  const { campaignId } = await campaignTooling.createAssessmentCampaign({
    databaseBuilder,
    targetProfileId,
    name: 'Campagne evaluation team-certif',
    code: campaignCode,
    title: 'Campagne evaluation team-certif',
    configCampaign: {
      participantCount: 0,
    },
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
    const assessmentId = databaseBuilder.factory.buildAssessment({
      userId: certificationCandidate.userId,
      type: Assessment.types.CAMPAIGN,
      campaignParticipationId,
    }).id;
    certificationCandidate.complementaryCertificationBadgeInfo = { complementaryCertificationBadgeId, partnerKey };
    return { assessmentId, userId: certificationCandidate.userId };
  });

  // All candidates for complementary certification validates all of the pix+ framework
  const allSkillsOfFramework = await learningContent.findActiveSkillsByFrameworkName(frameworkName);
  const complementaryProfileData = {};
  const areaForCompetence = {};
  for (const skill of allSkillsOfFramework) {
    const challenge = await learningContent.findFirstValidatedChallengeBySkillId(skill.id);
    if (!areaForCompetence[skill.competenceId]) {
      const competence = await learningContent.findCompetence(skill.competenceId);
      areaForCompetence[skill.competenceId] = competence.areaId;
    }
    if (!complementaryProfileData[areaForCompetence[skill.competenceId]])
      complementaryProfileData[areaForCompetence[skill.competenceId]] = { fourMostDifficultSkillsAndChallenges: [] };
    complementaryProfileData[areaForCompetence[skill.competenceId]].fourMostDifficultSkillsAndChallenges.push({
      skill,
      challenge,
    });
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
  // We keep the four most difficult skill/challenge by area
  for (const [areaId, { fourMostDifficultSkillsAndChallenges }] of Object.entries(complementaryProfileData)) {
    complementaryProfileData[areaId].fourMostDifficultSkillsAndChallenges = _.orderBy(
      fourMostDifficultSkillsAndChallenges,
      ({ skill }) => skill.level,
    );
    complementaryProfileData[areaId].fourMostDifficultSkillsAndChallenges = _.takeRight(
      complementaryProfileData[areaId].fourMostDifficultSkillsAndChallenges,
      4,
    );
  }

  return complementaryProfileData;
}

function _createCampaignCode(frameworkName, complementaryCertificationId) {
  const campaignCodeSuffix = frameworkName.toUpperCase().substr(0, 3);
  const campaignCode = `${campaignCodeSuffix}${complementaryCertificationId}`.padStart(9, 'CERTIF');
  return campaignCode;
}

function _makeCandidatesPassCertification(
  databaseBuilder,
  sessionId,
  certificationCandidates,
  coreProfileData,
  complementaryCertificationsProfileData,
) {
  for (const certificationCandidate of certificationCandidates) {
    const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
      userId: certificationCandidate.userId,
      sessionId,
      firstName: certificationCandidate.firstName,
      lastName: certificationCandidate.lastName,
      birthdate: certificationCandidate.birthdate,
      birthPostalCode: certificationCandidate.birthPostalCode,
      birthINSEECode: certificationCandidate.birthINSEECode,
      birthCountry: certificationCandidate.birthCountry,
      sex: certificationCandidate.sex,
      birthplace: certificationCandidate.birthCity,
      externalId: certificationCandidate.externalId,
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

    // For complementary, create all complementary entities (course, result, etc...)
    if (certificationCandidate.complementaryCertificationSubscribedId) {
      const complementaryCertificationCourseId = databaseBuilder.factory.buildComplementaryCertificationCourse({
        certificationCourseId,
        complementaryCertificationId: certificationCandidate.complementaryCertificationSubscribedId,
        complementaryCertificationBadgeId:
          certificationCandidate.complementaryCertificationBadgeInfo.complementaryCertificationBadgeId,
      }).id;
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        partnerKey: certificationCandidate.complementaryCertificationBadgeInfo.partnerKey,
        acquired: true,
        source: 'PIX',
        complementaryCertificationCourseId,
      });
      const skillsAndChallengesByArea =
        complementaryCertificationsProfileData[certificationCandidate.complementaryCertificationSubscribedId];
      if (Object.keys(skillsAndChallengesByArea).length > 0) {
        for (const { fourMostDifficultSkillsAndChallenges } of Object.values(skillsAndChallengesByArea)) {
          fourMostDifficultSkillsAndChallenges.map(({ challenge, skill }) => {
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
          });
        }
      }
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
        level: Math.floor(competenceData.pixScore / 8),
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
