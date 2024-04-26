import * as url from 'node:url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

import * as dotenv from 'dotenv';

dotenv.config({ path: `${__dirname}/../../.env` });
import bluebird from 'bluebird';
import lodash from 'lodash';

import { disconnect, knex } from '../../db/knex-database-connection.js';

const { maxBy } = lodash;
import { databaseBuffer } from '../../db/database-builder/database-buffer.js';
import { DatabaseBuilder } from '../../db/database-builder/database-builder.js';
import { CampaignParticipationStatuses } from '../../lib/domain/models/index.js';
import { learningContentCache } from '../../lib/infrastructure/caches/learning-content-cache.js';
import { temporaryStorage } from '../../lib/infrastructure/temporary-storage/index.js';
import { getNewSessionCode } from '../../src/certification/enrolment/domain/services/session-code-service.js';
import { logger } from '../../src/shared/infrastructure/utils/logger.js';
import {
  makeUserCleaCertifiable,
  makeUserPixCertifiable,
  makeUserPixDroitCertifiable,
  makeUserPixEduCertifiable,
} from '../tooling/tooling.js';

const { SHARED } = CampaignParticipationStatuses;

const databaseBuilder = new DatabaseBuilder({ knex, emptyFirst: false });
/**
 * DEFAULT
 * Create 1 session, 2 candidates, no complementary
 * LOG_LEVEL=info node ./scripts/data-generation/generate-certif-cli.js
 *
 * Create 1 session, 2 candidates: candidate 1 is registered and certifiable to CLEA, candidate 2 is registered and certifiable to DROIT
 * LOG_LEVEL=info node ./scripts/data-generation/generate-certif-cli.js 'PRO' 2 '[{"candidateNumber": 1, "key": "CLEA"}, {"candidateNumber": 2, "key": "DROIT"}]'
 *
 * Create 1 session, 3 candidates: candidate 2 is registered and certifiable to EDU_1ER_DEGRE, candidate 1 and 3 are certifiable PIX Core only
 * LOG_LEVEL=info node ./scripts/data-generation/generate-certif-cli.js 'PRO' 3 '[{"candidateNumber": 2, "key": "EDU_1ER_DEGRE"}]'
 *
 * Create 1 session, 1 candidate, no complementary
 * LOG_LEVEL=info node ./scripts/data-generation/generate-certif-cli.js 'SUP' 1
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
        { complementaryCertification, certificationCandidateId, userId, organizationLearnerId, organizationId },
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
  { complementaryCertification, certificationCandidateId, userId, organizationLearnerId, organizationId },
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
  const { id: badgeId, targetProfileId } = await _getBadgeByComplementaryCertificationKey(key);

  const { id: campaignId } = databaseBuilder.factory.buildCampaign({
    organizationId,
    targetProfileId,
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
}

async function _getBadgeByComplementaryCertificationKey(complementaryCertificationKey) {
  const key = COMPLEMENTARY_CERTIFICATION_BADGES_BY_NAME[complementaryCertificationKey];
  return knex('badges').where({ key }).first();
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
      'certification-subscriptions',
      'certification-subscriptions.certificationCandidateId',
      'certification-candidates.id',
    )
    .leftJoin(
      'complementary-certifications',
      'complementary-certifications.id',
      'certification-subscriptions.complementaryCertificationId',
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

if (!isInTest) {
  const [centerType = 'PRO', candidateNumber = '2', complementaryCertifications = '[]'] = process.argv.slice(2);

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
}

async function _disconnect() {
  logger.info('Closing connexions to PG...');
  await disconnect();
  logger.info('Closing connexions to cache...');
  await learningContentCache.quit();
  await temporaryStorage.quit();
  logger.info('Exiting process gracefully...');
}

export { databaseBuilder, main };
