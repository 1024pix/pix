#!/usr/bin/env node
'use strict';
const inquirer = require('inquirer');
require('dotenv').config({ path: `${__dirname}/../../.env` });
const { knex, disconnect } = require(`../../db/knex-database-connection`);
const bluebird = require('bluebird');
const domainBuilder = require('../../tests/tooling/domain-builder/factory');
const omit = require('lodash/omit');
const isEmpty = require('lodash/isEmpty');
const logger = require('../../lib/infrastructure/logger');
const { getNewSessionCode } = require('../../lib/domain/services/session-code-service');
const UserToCreate = require('../../lib/domain/models/UserToCreate');

const cache = require('../../lib/infrastructure/caches/learning-content-cache');

/**
 * LOG_LEVEL=info ./scripts/data-generation/generate-certif-cli.js 'SUP' 1 '[{"candidateNumber": 1, "name": "Pix+ Édu 2nd degré"}]' false
 */

const PIXCLEA = 'CléA Numérique';
const PIXDROIT = 'Pix+ Droit';
const PIXEDU2NDDEGRE = 'Pix+ Édu 2nd degré';
const PIXEDU1ERDEGRE = 'Pix+ Édu 1er degré';

const CERTIFICATION_CENTER_IDS_BY_TYPE = {
  SCO: 1,
  SUP: 3,
  PRO: 2,
};

const COMPLEMENTARY_CERTIFICATION_IDS_BY_NAME = {
  [PIXCLEA]: 52,
  [PIXDROIT]: 53,
  [PIXEDU1ERDEGRE]: 54,
  [PIXEDU2NDDEGRE]: 55,
};

const questions = [
  {
    type: 'list',
    name: 'centerType',
    message: 'Quel type de centre ?',
    choices: ['SCO', 'SUP', 'PRO'],
  },
  {
    type: 'confirm',
    name: 'isSupervisorAccessEnabled',
    message: "As tu besoin de l'espace surveillant ?",
    default: false,
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
            value: { candidateNumber: i + 1, name: 'Pix+ Édu 1er degré' },
          },
          {
            name: 'Pix+ Édu 2nd degré',
            value: { candidateNumber: i + 1, name: 'Pix+ Édu 2nd degré' },
          },
          {
            name: 'Pix+ Droit',
            value: { candidateNumber: i + 1, name: 'Pix+ Droit' },
          },
          {
            name: 'CléA Numérique',
            value: { candidateNumber: i + 1, name: 'CléA Numérique' },
          }
        );
      }
      return choices;
    },
  },
];

async function main({ centerType, candidateNumber, complementaryCertifications, isSupervisorAccessEnabled }) {
  const certificationCenterId = CERTIFICATION_CENTER_IDS_BY_TYPE[centerType];

  await _updateCertificationCenterSupervisorPortalAccess(certificationCenterId, isSupervisorAccessEnabled);

  if (complementaryCertifications?.length) {
    const complementaryCertificationIds = complementaryCertifications.map((complementaryCertification) => {
      return COMPLEMENTARY_CERTIFICATION_IDS_BY_NAME[complementaryCertification.name];
    });

    await _createComplementaryCertificationHabilitations(new Set(complementaryCertificationIds), certificationCenterId);
  }

  const sessionId = await _createSessionAndReturnId(certificationCenterId);

  if (centerType === 'SCO') {
    await _createScoCertificationCandidates(certificationCenterId, candidateNumber, sessionId);
  } else {
    let complementaryCertificationGroupedByCandidateIndex;
    if (!isEmpty(complementaryCertifications)) {
      complementaryCertificationGroupedByCandidateIndex = _groupByCandidateIndex(complementaryCertifications);
    }

    await _createNonScoCertificationCandidates(
      candidateNumber,
      sessionId,
      complementaryCertificationGroupedByCandidateIndex
    );
  }

  const results = await _getResults(sessionId);
  logger.info({ results });
}

async function _updateCertificationCenterSupervisorPortalAccess(id, isSupervisorAccessEnabled) {
  await knex('certification-centers').update({ isSupervisorAccessEnabled }).where({ id });
}

async function _createComplementaryCertificationHabilitations(complementaryCertificationIds, certificationCenterId) {
  return bluebird.mapSeries(complementaryCertificationIds, async (complementaryCertificationId) => {
    await knex('complementary-certification-habilitations').insert(
      omit(
        domainBuilder.buildComplementaryCertificationHabilitation({
          certificationCenterId,
          complementaryCertificationId,
        }),
        ['id']
      )
    );
  });
}

async function _createSessionAndReturnId(certificationCenterId) {
  const sessionCode = await getNewSessionCode();
  const [{ id }] = await knex('sessions')
    .insert(
      omit(domainBuilder.buildSession({ certificationCenterId, accessCode: sessionCode }), [
        'id',
        'certificationCandidates',
      ])
    )
    .returning('id');
  return id;
}

async function _createNonScoCertificationCandidates(
  candidateNumber,
  sessionId,
  complementaryCertificationGroupedByCandidateIndex
) {
  for (let i = 0; i < candidateNumber; i++) {
    const firstName = `c${i}`;
    const lastName = `c${i}`;
    const birthdate = new Date('2000-01-01');
    const user = UserToCreate.createWithTermsOfServiceAccepted({
      id: null,
      firstName,
      lastName,
      birthdate,
      email: `${firstName}@example.net`,
      mustValidateTermsOfService: false,
    });
    await knex('users').insert(user).returning('id');

    const certificationCandidate = domainBuilder.buildCertificationCandidate({
      firstName,
      lastName,
      birthdate,
      sessionId,
    });
    const insertableCertificationCandidate = omit(
      {
        ...certificationCandidate,
        organizationLearnerId: certificationCandidate.schoolingRegistrationId,
      },
      ['complementaryCertifications', 'schoolingRegistrationId', 'id', 'userId']
    );
    const [certificationCandidateId] = await knex('certification-candidates')
      .insert(insertableCertificationCandidate)
      .returning('id');

    if (complementaryCertificationGroupedByCandidateIndex) {
      const complementaryCertifications =
        complementaryCertificationGroupedByCandidateIndex && complementaryCertificationGroupedByCandidateIndex[i + 1];

      await _createComplementaryCertificationSubscriptions(complementaryCertifications, certificationCandidateId);
    }
  }
}

async function _createScoCertificationCandidates(certificationCenterId, candidateNumber, sessionId) {
  const organizationLearner = await knex('organization-learners')
    .select('organization-learners.*')
    .innerJoin('organizations', 'organizations.id', 'organization-learners.organizationId')
    .innerJoin('certification-centers', 'certification-centers.externalId', 'organizations.externalId')
    .where('certification-centers.id', certificationCenterId)
    .first();

  for (let i = 0; i < candidateNumber; i++) {
    const firstName = `c${i}`;
    const lastName = `c${i}`;
    const birthdate = new Date('2000-01-01');

    const user = UserToCreate.createWithTermsOfServiceAccepted(
      domainBuilder.buildUser({ firstName, lastName, birthdate, email: `${firstName}@example.net` })
    );
    const [{ id: userId }] = await knex('users')
      .insert({ ...user, id: undefined })
      .returning('id');
    const organizationLearnerToPersist = {
      ...organizationLearner,
      firstName,
      lastName,
      birthdate,
      nationalStudentId: firstName,
      studentNumber: i,
      userId,
    };

    const [{ id: organizationLearnerId }] = await knex('organization-learners')
      .insert({ ...organizationLearnerToPersist, id: undefined })
      .returning('id');
    await knex('certification-candidates').insert({
      firstName,
      lastName,
      birthdate,
      organizationLearnerId,
      sessionId,
    });
  }
}

async function _createComplementaryCertificationSubscriptions(complementaryCertifications, certificationCandidateId) {
  return bluebird.mapSeries(complementaryCertifications, async (name) => {
    const { id: complementaryCertificationId } = await knex('complementary-certifications').where({ name }).first();

    await knex('complementary-certification-subscriptions').insert({
      complementaryCertificationId,
      certificationCandidateId,
    });
  });
}

async function _getResults(sessionId) {
  return knex('sessions')
    .select({
      sessionId: 'sessions.id',
      accessCode: 'sessions.accessCode',
      firstName: 'certification-candidates.firstName',
      lastName: 'certification-candidates.lastName',
      birthdate: 'certification-candidates.birthdate',
      complementaryCertifications: knex.raw('json_agg("complementary-certifications"."name")'),
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
  return complementaryCertifications.reduce((acc, { candidateNumber, name }) => {
    acc[candidateNumber] = (acc[candidateNumber] || []).concat(name);
    return acc;
  }, {});
}

if (process.argv.length > 2) {
  const [centerType, candidateNumber, isSupervisorAccessEnabled] = process.argv.slice(2);
  main({ centerType, candidateNumber, complementaryCertifications: [], isSupervisorAccessEnabled })
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
  };
}

async function _disconnect() {
  logger.info('Closing connexions to PG...');
  await disconnect();
  logger.info('Closing connexions to cache...');
  cache.quit();
  logger.info('Exiting process gracefully...');
}