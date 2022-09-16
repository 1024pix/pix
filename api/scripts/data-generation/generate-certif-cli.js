#!/usr/bin/env node
'use strict';
const inquirer = require('inquirer');
require('dotenv').config({ path: `${__dirname}/../../.env` });
const { knex, disconnect } = require(`../../db/knex-database-connection`);
const bluebird = require('bluebird');
const maxBy = require('lodash/maxBy');
const logger = require('../../lib/infrastructure/logger');
const { getNewSessionCode } = require('../../lib/domain/services/session-code-service');
const temporaryStorage = require('../../lib/infrastructure/temporary-storage/index');
const {
  makeUserPixCertifiable,
  makeUserPixDroitCertifiable,
  makeUserCleaCertifiable,
  makeUserPixEduCertifiable,
} = require('../../db/seeds/data/certification/tooling');
const DatabaseBuilder = require('../../db/database-builder/database-builder');
const databaseBuffer = require('../../db/database-builder/database-buffer');
const { CLEA } = require('../../lib/domain/models/ComplementaryCertification');
const databaseBuilder = new DatabaseBuilder({ knex, emptyFirst: false });

const cache = require('../../lib/infrastructure/caches/learning-content-cache');

/**
 * LOG_LEVEL=info ./scripts/data-generation/generate-certif-cli.js 'SUP' 1 '[{"candidateNumber": 1, "name": "Pix+ Édu 2nd degré"}]'
 */

const PIXCLEA = 'CLEA';
const PIXDROIT = 'DROIT';
const PIXEDU2NDDEGRE = 'EDU_2ND_DEGRE';
const PIXEDU1ERDEGRE = 'EDU_1ER_DEGRE';

const CERTIFICATION_CENTER_IDS_BY_TYPE = {
  SCO: 1,
  SUP: 3,
  PRO: 2,
};

const COMPLEMENTARY_CERTIFICATION_IDS_BY_KEY = {
  [PIXCLEA]: 52,
  [PIXDROIT]: 53,
  [PIXEDU1ERDEGRE]: 54,
  [PIXEDU2NDDEGRE]: 55,
};
const COMPLEMENTARY_CERTIFICATION_BADGES_BY_NAME = {
  [PIXCLEA]: 'PIX_EMPLOI_CLEA_V3',
  [PIXDROIT]: 'PIX_DROIT_EXPERT_CERTIF',
  [PIXEDU1ERDEGRE]: 'PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME',
  [PIXEDU2NDDEGRE]: 'PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME',
};

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

  const certificationCenterId = CERTIFICATION_CENTER_IDS_BY_TYPE[centerType];
  await _updateCertificationCenterSupervisorPortalAccess(certificationCenterId);

  const sessionId = await _createSessionAndReturnId(certificationCenterId, databaseBuilder);

  if (centerType === 'SCO') {
    await _createScoCertificationCandidates(certificationCenterId, candidateNumber, sessionId, databaseBuilder);
  } else {
    let complementaryCertificationGroupedByCandidateIndex;
    if (complementaryCertifications?.length) {
      const complementaryCertificationIds = complementaryCertifications.map(({ key }) => {
        return COMPLEMENTARY_CERTIFICATION_IDS_BY_KEY[key];
      });

      await _createComplementaryCertificationHabilitations(
        new Set(complementaryCertificationIds),
        certificationCenterId,
        databaseBuilder
      );
      complementaryCertificationGroupedByCandidateIndex = _groupByCandidateIndex(complementaryCertifications);
    }

    await _createNonScoCertificationCandidates(
      centerType,
      candidateNumber,
      sessionId,
      complementaryCertificationGroupedByCandidateIndex,
      databaseBuilder
    );
  }

  await databaseBuilder.commit();
  await databaseBuilder.fixSequences();
  const results = await _getResults(sessionId);
  logger.info({ results });
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

async function _updateCertificationCenterSupervisorPortalAccess(id) {
  await knex('certification-centers').update({ isSupervisorAccessEnabled: true }).where({ id });
}

async function _createComplementaryCertificationHabilitations(
  complementaryCertificationIds,
  certificationCenterId,
  databaseBuilder
) {
  return bluebird.mapSeries(complementaryCertificationIds, async (complementaryCertificationId) => {
    databaseBuilder.factory.buildComplementaryCertificationHabilitation({
      certificationCenterId,
      complementaryCertificationId,
      databaseBuilder,
    });
  });
}

async function _createSessionAndReturnId(certificationCenterId, databaseBuilder) {
  const sessionCode = await getNewSessionCode();
  const { id } = databaseBuilder.factory.buildSession({
    certificationCenterId,
    accessCode: sessionCode,
    address: 'via le script de génération',
    createdAt: new Date(),
  });
  return id;
}

async function _createNonScoCertificationCandidates(
  centerType,
  candidateNumber,
  sessionId,
  complementaryCertificationGroupedByCandidateIndex,
  databaseBuilder
) {
  let maxUserId = await _getMaxUserId();

  for (let i = 0; i < candidateNumber; i++) {
    maxUserId++;
    const firstName = `${centerType}${maxUserId}`.toLowerCase();
    const lastName = firstName;
    const birthdate = new Date('2000-01-01');
    const email = `${firstName}@example.net`;
    const { id: userId } = await _createUser({ firstName, lastName, birthdate, email }, databaseBuilder);
    const { id: candidateId } = databaseBuilder.factory.buildCertificationCandidate({
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
        complementaryCertifications,
        candidateId,
        userId,
        databaseBuilder
      );
    }
  }
}

async function _getMaxUserId() {
  const { max } = await knex('users').max('id').first();
  return max;
}

async function _createScoCertificationCandidates(certificationCenterId, candidateNumber, sessionId, databaseBuilder) {
  const organizationLearner = await knex('organization-learners')
    .select('organization-learners.*')
    .innerJoin('organizations', 'organizations.id', 'organization-learners.organizationId')
    .innerJoin('certification-centers', 'certification-centers.externalId', 'organizations.externalId')
    .where('certification-centers.id', certificationCenterId)
    .first();

  const centerType = 'SCO';
  let maxUserId = await _getMaxUserId();

  for (let i = 0; i < candidateNumber; i++) {
    maxUserId++;
    const firstName = `${centerType}${maxUserId}`.toLowerCase();
    const lastName = firstName;
    const birthdate = new Date('2000-01-01');
    const email = `${firstName}@example.net`;

    const { id: userId } = await _createUser({ firstName, lastName, birthdate, email }, databaseBuilder);

    const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
      ...organizationLearner,
      firstName,
      lastName,
      birthdate,
      email,
      nationalStudentId: firstName,
      studentNumber: maxUserId,
      userId,
      id: undefined,
    });

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
  complementaryCertifications,
  certificationCandidateId,
  userId,
  databaseBuilder
) {
  return bluebird.mapSeries(complementaryCertifications, async (key) => {
    const { id: complementaryCertificationId } = await knex('complementary-certifications').where({ key }).first();

    databaseBuilder.factory.buildComplementaryCertificationSubscription({
      complementaryCertificationId,
      certificationCandidateId,
    });

    if (_isDroit(complementaryCertificationId)) {
      const { id: badgeId } = await knex('badges')
        .where({ key: COMPLEMENTARY_CERTIFICATION_BADGES_BY_NAME[PIXDROIT] })
        .first();
      databaseBuilder.factory.buildBadgeAcquisition({ badgeId, userId });
      await makeUserPixDroitCertifiable({
        userId,
        databaseBuilder,
      });
    } else if (_isClea(complementaryCertificationId)) {
      const { id: badgeId } = await knex('badges')
        .where({ key: COMPLEMENTARY_CERTIFICATION_BADGES_BY_NAME[CLEA] })
        .first();
      databaseBuilder.factory.buildBadgeAcquisition({ badgeId, userId });
      await makeUserCleaCertifiable({ userId, databaseBuilder });
    } else if (_isEdu1erDegre(complementaryCertificationId)) {
      const { id: badgeId } = await knex('badges')
        .where({ key: COMPLEMENTARY_CERTIFICATION_BADGES_BY_NAME[PIXEDU1ERDEGRE] })
        .first();
      databaseBuilder.factory.buildBadgeAcquisition({ badgeId, userId });
      await makeUserPixEduCertifiable({ userId, databaseBuilder });
    } else if (_isEdu2ndDegre(complementaryCertificationId)) {
      const { id: badgeId } = await knex('badges')
        .where({ key: COMPLEMENTARY_CERTIFICATION_BADGES_BY_NAME[PIXEDU2NDDEGRE] })
        .first();
      databaseBuilder.factory.buildBadgeAcquisition({ badgeId, userId });
      await makeUserPixEduCertifiable({ userId, databaseBuilder });
    }
  });
}

function _isDroit(complementaryCertificationId) {
  return complementaryCertificationId === COMPLEMENTARY_CERTIFICATION_IDS_BY_KEY[PIXDROIT];
}
function _isClea(complementaryCertificationId) {
  return complementaryCertificationId === COMPLEMENTARY_CERTIFICATION_IDS_BY_KEY[PIXCLEA];
}
function _isEdu1erDegre(complementaryCertificationId) {
  return complementaryCertificationId === COMPLEMENTARY_CERTIFICATION_IDS_BY_KEY[PIXEDU1ERDEGRE];
}
function _isEdu2ndDegre(complementaryCertificationId) {
  return complementaryCertificationId === COMPLEMENTARY_CERTIFICATION_IDS_BY_KEY[PIXEDU2NDDEGRE];
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

async function _createUser({ firstName, lastName, birthdate, email }, databaseBuilder) {
  const user = databaseBuilder.factory.buildUser.withRawPassword({
    firstName,
    lastName,
    birthdate,
    email,
    mustValidateTermsOfService: false,
  });

  await makeUserPixCertifiable({
    userId: user.id,
    databaseBuilder,
    countCertifiableCompetences: 16,
    levelOnEachCompetence: 6,
  });

  return user;
}

if (process.argv.length > 2 && process.env.NODE_ENV !== 'test') {
  const [centerType, candidateNumber, complementaryCertifications] = process.argv.slice(2);

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
  cache.quit();
  temporaryStorage.quit();
  logger.info('Exiting process gracefully...');
}
