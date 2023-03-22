#!/usr/bin/env node
'use strict';
const inquirer = require('inquirer');
require('dotenv').config({ path: `${__dirname}/../../.env` });
const { knex, disconnect } = require(`../../db/knex-database-connection`);
const bluebird = require('bluebird');
const maxBy = require('lodash/maxBy');
const logger = require('../../lib/infrastructure/logger');
const { getNewSessionCode } = require('../../lib/domain/services/session-code-service');
const { temporaryStorage } = require('../../lib/infrastructure/temporary-storage/index');
const {
  makeUserPixCertifiable,
  makeUserPixDroitCertifiable,
  makeUserCleaCertifiable,
  makeUserPixEduCertifiable,
} = require('../../db/seeds/data/certification/tooling');
const DatabaseBuilder = require('../../db/database-builder/database-builder');
const databaseBuffer = require('../../db/database-builder/database-buffer');
const databaseBuilder = new DatabaseBuilder({ knex, emptyFirst: false });
const { learningContentCache } = require('../../lib/infrastructure/caches/learning-content-cache');
const { SHARED } = require('../../lib/domain/models/CampaignParticipationStatuses');

/**
 * LOG_LEVEL=info ./scripts/data-generation/generate-certif-cli.js 'SUP' 1 '[{"candidateNumber": 1, "key": "EDU_1ER_DEGRE"}, {"candidateNumber": 1, "key": "EDU_2ND_DEGRE"}]'
 * LOG_LEVEL=info ./scripts/data-generation/generate-certif-cli.js 'PRO' 2 '[{"candidateNumber": 1, "key": "CLEA"}, {"candidateNumber": 2, "key": "DROIT"}]'
 * LOG_LEVEL=info ./scripts/data-generation/generate-certif-cli.js 'PRO' 1'
 */

const PIXCLEA = 'CLEA';
const PIXDROIT = 'DROIT';
const PIXEDU2NDDEGRE = 'EDU_2ND_DEGRE';
const PIXEDU1ERDEGRE = 'EDU_1ER_DEGRE';

const COMPLEMENTARY_CERTIFICATION_BADGES_BY_NAME = {
  [PIXCLEA]: 'PIX_EMPLOI_CLEA_V3',
  [PIXDROIT]: 'PIX_DROIT_EXPERT_CERTIF',
  [PIXEDU1ERDEGRE]: 'PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME',
  [PIXEDU2NDDEGRE]: 'PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME',
};

const isInTest = process.env.NODE_ENV === 'test';

const questions = [
  {
    type: 'list',
    name: 'centerType',
    message: 'Quel type de centre ?',
    choices: ['SCO', 'SUP', 'PRO'],
  },
  {
    type: 'input',
    name: 'candidateNumber',
    message: 'Combien de candidats ?',
    validate(value) {
      const valid = !isNaN(parseInt(value));
      return valid || 'Renseigner un nombre';
    },
    filter: Number,
  },
  {
    type: 'confirm',
    name: 'needComplementaryCertifications',
    message: 'As tu besoin de certifications complémentaires ?',
    default: false,
    when({ centerType }) {
      return centerType !== 'SCO';
    },
  },
  {
    type: 'checkbox',
    name: 'complementaryCertifications',
    message: "Quelles certifications complémentaires souhaitez-vous ? ('space' pour séléctionner)",
    when({ needComplementaryCertifications }) {
      return needComplementaryCertifications;
    },
    loop: false,
    choices({ candidateNumber }) {
      const choices = [];
      for (let i = 0; i < candidateNumber; i++) {
        choices.push(
          new inquirer.Separator(`----- Candidat ${i + 1} -----`),
          {
            name: 'Pix+ Édu 1er degré',
            value: { candidateNumber: i + 1, key: 'EDU_1ER_DEGRE' },
          },
          {
            name: 'Pix+ Édu 2nd degré',
            value: { candidateNumber: i + 1, key: 'EDU_2ND_DEGRE' },
          },
          {
            name: 'Pix+ Droit',
            value: { candidateNumber: i + 1, key: 'DROIT' },
          },
          {
            name: 'CléA Numérique',
            value: { candidateNumber: i + 1, key: 'CLEA' },
          }
        );
      }
      return choices;
    },
  },
];

async function main({ centerType, candidateNumber, complementaryCertifications }) {
  await _updateDatabaseBuilderSequenceNumber();
  const { id: organizationId } = databaseBuilder.factory.buildOrganization({
    type: centerType,
    isManagingStudents: centerType === 'SCO',
    name: 'CERTIF_ORGA_' + new Date().getTime(),
  });
  const certificationCenterId = await _getCertificationCenterIdByCenterType(centerType);

  const sessionId = await _createSessionAndReturnId(certificationCenterId, databaseBuilder);
  if (centerType === 'SCO') {
    await _createScoCertificationCandidates({ candidateNumber, sessionId, organizationId }, databaseBuilder);
  } else {
    let complementaryCertificationGroupedByCandidateIndex;
    if (complementaryCertifications?.length) {
      const complementaryCertificationKeys = complementaryCertifications.map(({ key }) => key);
      const complementaryCertificationIds = await knex('complementary-certifications')
        .whereIn('key', complementaryCertificationKeys)
        .pluck('id');

      await _createComplementaryCertificationHabilitations(
        { complementaryCertificationIds, certificationCenterId },
        databaseBuilder
      );
      complementaryCertificationGroupedByCandidateIndex = _groupByCandidateIndex(complementaryCertifications);
    }

    await _createNonScoCertificationCandidates(
      {
        centerType,
        candidateNumber,
        sessionId,
        complementaryCertificationGroupedByCandidateIndex,
        organizationId,
      },
      databaseBuilder
    );
  }

  await databaseBuilder.commit();
  await databaseBuilder.fixSequences();
  const results = await _getResults(sessionId);
  if (!isInTest) {
    logger.info({ results });
  }
}

async function _getCertificationCenterIdByCenterType(centerType) {
  const { id } = await knex('certification-centers')
    .select('id')
    .where({ type: centerType })
    .orderBy('id', 'asc')
    .first();
  return id;
}

async function _updateDatabaseBuilderSequenceNumber() {
  // need to update databaseBuffer to avoid uniq ids conflicts
  const maxSequenceId = await _getMaxSequenceId();
  databaseBuffer.nextId = maxSequenceId + 1;
}

async function _getMaxSequenceId() {
  const sequences = await knex('information_schema.sequences').pluck('sequence_name');
  const maxValues = await bluebird.map(sequences, (sequence) => knex(sequence).select('last_value').first());
  const { last_value: max } = maxBy(maxValues, 'last_value');
  return max;
}

async function _createComplementaryCertificationHabilitations(
  { complementaryCertificationIds, certificationCenterId },
  databaseBuilder
) {
  return bluebird.mapSeries(complementaryCertificationIds, async (complementaryCertificationId) => {
    databaseBuilder.factory.buildComplementaryCertificationHabilitation({
      certificationCenterId,
      complementaryCertificationId,
    });
  });
}

async function _createSessionAndReturnId(certificationCenterId, databaseBuilder) {
  const sessionCode = getNewSessionCode();
  const { id } = databaseBuilder.factory.buildSession({
    certificationCenterId,
    accessCode: sessionCode,
    address: 'via le script de génération',
    createdAt: new Date(),
  });
  return id;
}

async function _createNonScoCertificationCandidates(
  { centerType, candidateNumber, sessionId, complementaryCertificationGroupedByCandidateIndex, organizationId },
  databaseBuilder
) {
  let maxUserId = await _getMaxUserId();

  for (let i = 0; i < candidateNumber; i++) {
    maxUserId++;
    const firstName = `${centerType}${maxUserId}`.toLowerCase();
    const lastName = firstName;
    const birthdate = new Date('2000-01-01');
    const email = `${firstName}@example.net`;
    const { userId, organizationLearnerId } = await _createUser(
      { firstName, lastName, birthdate, email, organizationId, maxUserId },
      databaseBuilder
    );
    const { id: certificationCandidateId } = databaseBuilder.factory.buildCertificationCandidate({
      firstName,
      lastName,
      birthdate,
      sessionId,
      email,
      userId: null,
      createdAt: new Date(),
      authorizedToStart: true,
    });

    if (complementaryCertificationGroupedByCandidateIndex && complementaryCertificationGroupedByCandidateIndex[i + 1]) {
      const complementaryCertifications = complementaryCertificationGroupedByCandidateIndex[i + 1];

      await _createComplementaryCertificationHability(
        { complementaryCertifications, certificationCandidateId, userId, organizationLearnerId },
        databaseBuilder
      );
    }
  }
}

async function _getMaxUserId() {
  const { max } = await knex('users').max('id').first();
  return max;
}

async function _createScoCertificationCandidates({ candidateNumber, sessionId, organizationId }, databaseBuilder) {
  const centerType = 'SCO';
  let maxUserId = await _getMaxUserId();

  for (let i = 0; i < candidateNumber; i++) {
    maxUserId++;
    const firstName = `${centerType}${maxUserId}`.toLowerCase();
    const lastName = firstName;
    const birthdate = new Date('2000-01-01');
    const email = `${firstName}@example.net`;

    const { organizationLearnerId } = await _createUser(
      { firstName, lastName, birthdate, email, organizationId, maxUserId },
      databaseBuilder
    );

    databaseBuilder.factory.buildCertificationCandidate({
      firstName,
      lastName,
      birthdate,
      sessionId,
      email,
      userId: null,
      organizationLearnerId,
      createdAt: new Date(),
      authorizedToStart: true,
    });
  }
}

async function _createComplementaryCertificationHability(
  { complementaryCertifications, certificationCandidateId, userId, organizationLearnerId },
  databaseBuilder
) {
  return bluebird.mapSeries(complementaryCertifications, async (key) => {
    const { id: complementaryCertificationId } = await knex('complementary-certifications').where({ key }).first();

    databaseBuilder.factory.buildComplementaryCertificationSubscription({
      complementaryCertificationId,
      certificationCandidateId,
    });
    const badgeId = await _getBadgeIdByComplementaryCertificationKey(key);
    const targetProfileId = await _getTargetProfileIdFromBadgeKey(key);
    const { id: campaignId } = databaseBuilder.factory.buildCampaign({
      targetProfileId,
      name: 'GENERATED_CAMPAIGN',
      creatorId: userId,
      ownerId: userId,
    });
    const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
      campaignId,
      userId,
      organizationLearnerId,
      status: SHARED,
      isCertifiable: true,
    });
    databaseBuilder.factory.buildBadgeAcquisition({ badgeId, userId, campaignParticipationId });

    if (PIXDROIT === key) {
      await makeUserPixDroitCertifiable({
        userId,
        databaseBuilder,
      });
    } else if (PIXCLEA === key) {
      await makeUserCleaCertifiable({ userId, databaseBuilder });
    } else if (PIXEDU1ERDEGRE === key) {
      await makeUserPixEduCertifiable({ userId, databaseBuilder });
    } else if (PIXEDU2NDDEGRE === key) {
      await makeUserPixEduCertifiable({ userId, databaseBuilder });
    }
  });
}

async function _getBadgeIdByComplementaryCertificationKey(complementaryCertificationKey) {
  const badgeKey = COMPLEMENTARY_CERTIFICATION_BADGES_BY_NAME[complementaryCertificationKey];
  const { id } = await knex('badges').where({ key: badgeKey }).first();
  return id;
}

async function _getTargetProfileIdFromBadgeKey(badgeKey) {
  const key = COMPLEMENTARY_CERTIFICATION_BADGES_BY_NAME[badgeKey];
  const { id } = await knex('target-profiles')
    .select('target-profiles.id')
    .innerJoin('badges', 'badges.targetProfileId', 'target-profiles.id')
    .where({ key })
    .first();
  return id;
}

async function _getResults(sessionId) {
  return knex('sessions')
    .select({
      sessionId: 'sessions.id',
      accessCode: 'sessions.accessCode',
      firstName: 'certification-candidates.firstName',
      lastName: 'certification-candidates.lastName',
      email: 'certification-candidates.email',
      birthdate: 'certification-candidates.birthdate',
      complementaryCertifications: knex.raw('json_agg("complementary-certifications"."label")'),
    })
    .join('certification-candidates', 'certification-candidates.sessionId', 'sessions.id')
    .leftJoin(
      'complementary-certification-subscriptions',
      'complementary-certification-subscriptions.certificationCandidateId',
      'certification-candidates.id'
    )
    .leftJoin(
      'complementary-certifications',
      'complementary-certifications.id',
      'complementary-certification-subscriptions.complementaryCertificationId'
    )
    .where('sessions.id', sessionId)
    .groupBy('sessions.id', 'certification-candidates.id');
}

function _groupByCandidateIndex(complementaryCertifications) {
  return complementaryCertifications.reduce((acc, { candidateNumber, key }) => {
    acc[candidateNumber] = (acc[candidateNumber] || []).concat(key);
    return acc;
  }, {});
}

async function _createUser({ firstName, lastName, birthdate, email, organizationId, maxUserId }, databaseBuilder) {
  const { id: userId } = databaseBuilder.factory.buildUser.withRawPassword({
    firstName,
    lastName,
    birthdate,
    email,
    mustValidateTermsOfService: false,
  });

  await makeUserPixCertifiable({
    userId,
    databaseBuilder,
    countCertifiableCompetences: 16,
    levelOnEachCompetence: 6,
  });

  const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
    firstName,
    lastName,
    birthdate,
    email,
    nationalStudentId: firstName,
    studentNumber: maxUserId,
    userId,
    id: undefined,
    organizationId,
  });

  return { userId, organizationLearnerId };
}

if (process.argv.length > 2 && !isInTest) {
  const [centerType, candidateNumber, complementaryCertifications = '[]'] = process.argv.slice(2);

  main({
    centerType,
    candidateNumber,
    complementaryCertifications: JSON.parse(complementaryCertifications),
  })
    .catch((error) => {
      logger.error(error);
      throw error;
    })
    .finally(_disconnect);
} else if (require.main === module) {
  inquirer
    .prompt(questions)
    .then(async (answers) => {
      logger.info('\nDetails:');
      logger.info(JSON.stringify(answers, null, '  '));
      await main(answers);
    })
    .catch((error) => {
      logger.error(error);
      throw error;
    })
    .finally(_disconnect);
} else {
  module.exports = {
    main,
    databaseBuilder,
  };
}

async function _disconnect() {
  logger.info('Closing connexions to PG...');
  await disconnect();
  logger.info('Closing connexions to cache...');
  await learningContentCache.quit();
  await temporaryStorage.quit();
  logger.info('Exiting process gracefully...');
}
