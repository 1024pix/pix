import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { importNamedExportsFromDirectory } from '../../../src/shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as buildDataProtectionOfficer from './build-data-protection-officer.js';
import * as campaignParticipationOverviewFactory from './campaign-participation-overview-factory.js';
import * as knowledgeElementSnapshotFactory from './knowledge-elements-snapshot-factory.js';
import * as learningContent from './learning-content/index.js';
import * as llm from './llm/index.js';
import * as poleEmploiSendingFactory from './pole-emploi-sending-factory.js';

/**
 * Travail à continuer en scout-rule : ajouter ici les builders au fur et à mesure.
 * @see https://github.com/1024pix/pix/pull/8212
 *
 * @typedef {{
 *   buildTraining: typeof import('./build-training.js').buildTraining,
 *   buildUser: typeof import('./build-user.js').buildUser,
 * } & Record<string, (...args: any[]) => any>} DatabaseBuilders
 */

/**
 * @typedef {{
 *   buildOrganizationLearner: typeof import('./prescription/organization-learners/build-organization-learner.js').buildOrganizationLearner,
 * } & Record<string, (...args: any[]) => any>} OrganizationLearnersBuilders
 */

const path = dirname(fileURLToPath(import.meta.url));
const unwantedFiles = [
  'index.js',
  'campaign-participation-overview-factory.js',
  'knowledge-elements-snapshot-factory.js',
  'pole-emploi-sending-factory.js',
  'build-data-protection-officer.js',
];

const databaseBuilders = /** @type {DatabaseBuilders} */ (
  await importNamedExportsFromDirectory({
    path: join(path, './'),
    ignoredFileNames: unwantedFiles,
  })
);

const organizationLearners = /** @type {OrganizationLearnersBuilders} */ (
  await importNamedExportsFromDirectory({
    path: join(path, './prescription/organization-learners'),
    ignoredFileNames: unwantedFiles,
  })
);

export const factory = {
  ...databaseBuilders,
  prescription: {
    organizationLearners,
  },
  campaignParticipationOverviewFactory,
  knowledgeElementSnapshotFactory,
  poleEmploiSendingFactory,
  buildDataProtectionOfficer,
  learningContent,
  llm,
};
