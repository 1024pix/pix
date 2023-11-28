import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
// eslint-disable-next-line n/no-unpublished-import
import inquirer from 'inquirer';
import * as dotenv from 'dotenv';

dotenv.config({ path: `${__dirname}/../../.env` });
import { knex, disconnect } from '../../db/knex-database-connection.js';
import bluebird from 'bluebird';
import lodash from 'lodash';

const { maxBy } = lodash;
import { logger } from '../../lib/infrastructure/logger.js';
import { getNewSessionCode } from '../../src/certification/session/domain/services/session-code-service.js';
import { temporaryStorage } from '../../lib/infrastructure/temporary-storage/index.js';
import {
  makeUserPixCertifiable,
  makeUserPixDroitCertifiable,
  makeUserCleaCertifiable,
  makeUserPixEduCertifiable,
} from '../tooling/tooling.js';
import { DatabaseBuilder } from '../../db/database-builder/database-builder.js';
import { databaseBuffer } from '../../db/database-builder/database-buffer.js';
import { learningContentCache } from '../../lib/infrastructure/caches/learning-content-cache.js';
import { CampaignParticipationStatuses } from '../../lib/domain/models/index.js';

const { SHARED } = CampaignParticipationStatuses;

const databaseBuilder = new DatabaseBuilder({ knex, emptyFirst: false });
/**
 * LOG_LEVEL=info node ./scripts/data-generation/generate-certif-cli.js 'SUP' 1 '[{"candidateNumber": 1, "key": "EDU_1ER_DEGRE"}, {"candidateNumber": 1, "key": "EDU_2ND_DEGRE"}]'
 * LOG_LEVEL=info node ./scripts/data-generation/generate-certif-cli.js 'PRO' 2 '[{"candidateNumber": 1, "key": "CLEA"}, {"candidateNumber": 2, "key": "DROIT"}]'
 * LOG_LEVEL=info node ./scripts/data-generation/generate-certif-cli.js 'PRO' 1
 *
 * On a "production" environment (RA), you need to install inquirer package
 * NODE_ENV= npm i inquirer@8.2.4 && LOG_LEVEL=info LOG_FOR_HUMANS=true node ./scripts/data-generation/generate-certif-cli.js 'PRO' 1
 */

const PIXCLEA = 'CLEA';
const PIXDROIT = 'DROIT';
const PIXEDU2NDDEGRE = 'EDU_2ND_DEGRE';
const PIXEDU1ERDEGRE = 'EDU_1ER_DEGRE';
import { badges } from '../../db/constants.js';

const COMPLEMENTARY_CERTIFICATION_BADGES_BY_NAME = {
  [PIXCLEA]: badges.keys.PIX_EMPLOI_CLEA_V2,
  [PIXDROIT]: badges.keys.PIX_DROIT_INITIE_CERTIF,
  [PIXEDU1ERDEGRE]: badges.keys.PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
  [PIXEDU2NDDEGRE]: badges.keys.PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
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
    name: 'needComplementaryCertification',
    message: "As tu besoin d'une certification complémentaire ?",
    default: false,
    when({ centerType }) {
      return centerType !== 'SCO';
    },
  },
  {
    type: 'checkbox',
    name: 'complementaryCertifications',
    message: "Quelle certification complémentaire souhaitez-vous ? (1 par candidat, 'space' pour séléctionner)",
    when({ needComplementaryCertification }) {
      return needComplementaryCertification;
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
          },
        );
      }
      return choices;
    },
  },
];

async function main({ centerType, candidateNumber, complementaryCertifications = [] }) {
  await _updateDatabaseBuilderSequenceNumber();
  const { id: organizationId } = databaseBuilder.factory.buildOrganization({
    type: centerType,
    isManagingStudents: centerType === 'SCO',
    name: 'CERTIF_ORGA_' + new Date().getTime(),
  });
  const { id: certificationCenterId } = databaseBuilder.factory.buildCertificationCenter({
    organizationId,
    name: 'CERTIF_CENTER_' + new Date().getTime(),
    type: centerType,
  });

  const userIds = await knex('certification-center-memberships')
    .pluck('certification-center-memberships.userId')
    .innerJoin(
      'certification-centers',
      'certification-centers.id',
      'certification-center-memberships.certificationCenterId',
    )
    .where({ 'certification-centers.type': centerType })
    .distinct();

  userIds.forEach((userId) =>
    databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId }),
  );

  const sessionId = await _createSessionAndReturnId({ certificationCenterId, databaseBuilder, userIds });
  if (centerType === 'SCO') {
    await _createScoCertificationCandidates({ candidateNumber, sessionId, organizationId }, databaseBuilder);
  } else {
    if (complementaryCertifications?.length) {
      const complementaryCertificationKeys = complementaryCertifications.map(({ key }) => key);
      const complementaryCertificationIds = await knex('complementary-certifications')
        .whereIn('key', complementaryCertificationKeys)
        .pluck('id');

      await _createComplementaryCertificationHabilitations(
        { complementaryCertificationIds, certificationCenterId },
        databaseBuilder,
      );
    }

    await _createNonScoCertificationCandidates(
      {
        centerType,
        candidateNumber,
        sessionId,
        complementaryCertifications,
        organizationId,
      },
      databaseBuilder,
    );
  }

  await databaseBuilder.commit();
  await databaseBuilder.fixSequences();
  const results = await _getResults(sessionId);
  if (!isInTest) {
    logger.info({ results });
  }
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
  databaseBuilder,
) {
  return bluebird.mapSeries(complementaryCertificationIds, async (complementaryCertificationId) => {
    databaseBuilder.factory.buildComplementaryCertificationHabilitation({
      certificationCenterId,
      complementaryCertificationId,
    });
  });
}

async function _createSessionAndReturnId({ certificationCenterId, databaseBuilder, userIds }) {
  const sessionCode = getNewSessionCode();
  const { id } = databaseBuilder.factory.buildSession({
    certificationCenterId,
    accessCode: sessionCode,
    address: 'via le script de génération',
    createdAt: new Date(),
  });

  _buildSupervisorAccess({ databaseBuilder, sessionId: id, userId: userIds.at(0) });
  return id;
}

async function _createNonScoCertificationCandidates(
  { centerType, candidateNumber, sessionId, complementaryCertifications, organizationId },
  databaseBuilder,
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
      databaseBuilder,
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

    const complementaryCertification = complementaryCertifications.find(
      ({ candidateNumber }) => candidateNumber === i + 1,
    );
    if (complementaryCertification) {
      await _createComplementaryCertificationHability(
        { complementaryCertification, certificationCandidateId, userId, organizationLearnerId },
        databaseBuilder,
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
      databaseBuilder,
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
  { complementaryCertification, certificationCandidateId, userId, organizationLearnerId },
  databaseBuilder,
) {
  const { key } = complementaryCertification;
  const { id: complementaryCertificationId } = await knex('complementary-certifications')
    .where({ key: complementaryCertification.key })
    .first();

  databaseBuilder.factory.buildComplementaryCertificationSubscription({
    complementaryCertificationId,
    certificationCandidateId,
  });
  const badgeId = await _getBadgeIdByComplementaryCertificationKey(key);
  const campaignId = await _getCampaignIdFromBadgeKey(key);

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
}

async function _getBadgeIdByComplementaryCertificationKey(complementaryCertificationKey) {
  const badgeKey = COMPLEMENTARY_CERTIFICATION_BADGES_BY_NAME[complementaryCertificationKey];
  const { id } = await knex('badges').where({ key: badgeKey }).first();
  return id;
}

async function _getCampaignIdFromBadgeKey(badgeKey) {
  const key = COMPLEMENTARY_CERTIFICATION_BADGES_BY_NAME[badgeKey];

  const { campaignId } = await knex('campaigns')
    .select({ campaignId: 'campaigns.id' })
    .innerJoin('badges', 'badges.targetProfileId', 'campaigns.targetProfileId')
    .innerJoin('campaign_skills', 'campaign_skills.campaignId', 'campaigns.id')
    .where({ key })
    .limit(1)
    .first();
  return campaignId;
}

async function _getResults(sessionId) {
  return knex('sessions')
    .select({
      sessionId: 'sessions.id',
      accessCode: 'sessions.accessCode',
      userId: 'users.id',
      firstName: 'certification-candidates.firstName',
      lastName: 'certification-candidates.lastName',
      email: 'certification-candidates.email',
      birthdate: 'certification-candidates.birthdate',
      complementaryCertification: 'complementary-certifications.label',
    })
    .join('certification-candidates', 'certification-candidates.sessionId', 'sessions.id')
    .join('users', 'users.email', 'certification-candidates.email')
    .leftJoin(
      'complementary-certification-subscriptions',
      'complementary-certification-subscriptions.certificationCandidateId',
      'certification-candidates.id',
    )
    .leftJoin(
      'complementary-certifications',
      'complementary-certifications.id',
      'complementary-certification-subscriptions.complementaryCertificationId',
    )
    .where('sessions.id', sessionId);
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

function _buildSupervisorAccess({ databaseBuilder, sessionId }) {
  const supervisor = databaseBuilder.factory.buildUser({ firstName: `supervisor${sessionId}` });
  databaseBuilder.factory.buildSupervisorAccess({
    sessionId,
    userId: supervisor.id,
    authorizedAt: new Date(),
  });
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;
if (process.argv.length > 2 && !isInTest) {
  const [centerType, candidateNumber, complementaryCertifications = '[]'] = process.argv.slice(2);

  main({
    centerType,
    candidateNumber,
    complementaryCertifications: JSON.parse(complementaryCertifications) || [],
  })
    .catch((error) => {
      logger.error(error);
      throw error;
    })
    .finally(_disconnect);
} else if (isLaunchedFromCommandLine) {
  inquirer
    .prompt(questions)
    .then(async (answers) => {
      logger.info('🙋🏽‍♂️ Demande :');
      logger.info(JSON.stringify(answers, null, '  '));
      logger.info('👷🏾‍♀️ Création...');
      await main(answers);
    })
    .catch((error) => {
      logger.error(error);
      throw error;
    })
    .finally(_disconnect);
}

async function _disconnect() {
  logger.info('Closing connexions to PG...');
  await disconnect();
  logger.info('Closing connexions to cache...');
  await learningContentCache.quit();
  await temporaryStorage.quit();
  logger.info('Exiting process gracefully...');
}

export { main, databaseBuilder };
