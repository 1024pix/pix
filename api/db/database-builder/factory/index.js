import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { importNamedExportsFromDirectory } from '../../../src/shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as buildDataProtectionOfficer from './build-data-protection-officer.js';
import * as campaignParticipationOverviewFactory from './campaign-participation-overview-factory.js';
import * as knowledgeElementSnapshotFactory from './knowledge-elements-snapshot-factory.js';
import * as poleEmploiSendingFactory from './pole-emploi-sending-factory.js';

const path = dirname(fileURLToPath(import.meta.url));
const unwantedFiles = [
  'index.js',
  'campaign-participation-overview-factory.js',
  'knowledge-elements-snapshot-factory.js',
  'pole-emploi-sending-factory.js',
  'build-data-protection-officer.js',
];

const databaseBuilders = await importNamedExportsFromDirectory({
  path: join(path, './'),
  ignoredFileNames: unwantedFiles,
});

const organizationLearners = await importNamedExportsFromDirectory({
  path: join(path, './prescription/organization-learners'),
  ignoredFileNames: unwantedFiles,
});

/**
 * Travail à continuer en scout-rule
 * @see https://github.com/1024pix/pix/pull/8212
 * @typedef {
 *    {
 *      buildTraining: BuildTraining,
 *      buildDataProtectionOfficer: BuildDataProtectionOfficerFactory,
 *      buildUser: BuildUser,
 *      buildOrganizationLearner: BuildOrganizationLearner,
 *    }
 *  } Factory
 */
export const factory = {
  ...databaseBuilders,
  prescription: {
    organizationLearners,
  },
  campaignParticipationOverviewFactory,
  knowledgeElementSnapshotFactory,
  poleEmploiSendingFactory,
  buildDataProtectionOfficer,
};
