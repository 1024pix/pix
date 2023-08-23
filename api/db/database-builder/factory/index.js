import * as campaignParticipationOverviewFactory from './campaign-participation-overview-factory.js';
import * as knowledgeElementSnapshotFactory from './knowledge-elements-snapshot-factory.js';
import * as poleEmploiSendingFactory from './pole-emploi-sending-factory.js';
import * as buildDataProtectionOfficer from './build-data-protection-officer.js';

import { importNamedExportsFromDirectory } from '../../../src/shared/infrastructure/utils/import-named-exports-from-directory.js';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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

export const factory = {
  ...databaseBuilders,
  campaignParticipationOverviewFactory,
  knowledgeElementSnapshotFactory,
  poleEmploiSendingFactory,
  buildDataProtectionOfficer,
};
