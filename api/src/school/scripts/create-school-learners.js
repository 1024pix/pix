import * as url from 'node:url';

import bluebird from 'bluebird';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { disconnect, knex } from '../../../db/knex-database-connection.js';
import { logErrorWithCorrelationIds, logInfoWithCorrelationIds } from '../../../lib/infrastructure/monitoring-tools.js';
import * as schoolRepository from '../../../src/school/infrastructure/repositories/school-repository.js';
import { Organization } from '../../organizational-entities/domain/models/Organization.js';
import { ORGANIZATION_FEATURE } from '../../shared/domain/constants.js';
import * as codeGenerator from '../../shared/domain/services/code-generator.js';
import * as organizationRepository from '../../shared/infrastructure/repositories/organization-repository.js';

const STUDENT_NAMES = [
  { firstName: 'Ichigo', lastName: 'Hara-Masuda' },
  { firstName: 'Zoro', lastName: 'Miura' },
  { firstName: 'Kamina', lastName: 'Ota' },
  { firstName: 'Goku-Yoshida', lastName: 'Fukuda' },
  { firstName: 'Nagisa', lastName: 'Nishimura' },
  { firstName: 'Sakura', lastName: 'Fujii' },
  { firstName: 'Lelouch', lastName: 'Endo' },
  { firstName: 'Shizuka', lastName: 'Sakamoto' },
  { firstName: 'Zenitsu', lastName: 'Saito' },
  { firstName: 'Katsuki', lastName: 'Ishii' },
  { firstName: 'Usagi-Yoshida', lastName: 'Kondo' },
  { firstName: 'Shinya', lastName: 'Murakami Fujimoto' },
  { firstName: 'Hana-Belle', lastName: 'Hasegawa' },
  { firstName: 'Ayame', lastName: 'Okada' },
  { firstName: 'Yato-Hidaka', lastName: 'Ogawa' },
  { firstName: 'Lucy', lastName: 'Fujita' },
  { firstName: 'Yuki', lastName: 'Maeda' },
  { firstName: 'Spike', lastName: 'Nakajima' },
  { firstName: 'Hikari', lastName: 'Ishikawa Nakamura' },
  { firstName: 'Haruka', lastName: 'Yamashita' },
  { firstName: 'Faye', lastName: 'Hashimoto' },
  { firstName: 'Kirito', lastName: 'Ikeda' },
  { firstName: 'Gon', lastName: 'Abe' },
  { firstName: 'Mikasa', lastName: 'Mori' },
  { firstName: 'Roy-Tanaka', lastName: 'Yamazaki Yamamoto' },
  { firstName: 'Esdras-Onishi', lastName: 'Shimizu' },
  { firstName: 'Rin', lastName: 'Hayashi' },
  { firstName: 'Kushina', lastName: 'Kimura' },
  { firstName: 'Yusuke', lastName: 'Inoue' },
  { firstName: 'Ayako-Oshiro', lastName: 'Matsumoto' },
  { firstName: 'Kaori', lastName: 'Yamaguchi' },
  { firstName: 'Touka', lastName: 'Yamada' },
  { firstName: 'Chiharu', lastName: 'Sasaki' },
  { firstName: 'Levi-Takashi', lastName: 'Yoshida' },
  { firstName: 'Kirishima', lastName: 'Kato' },
];

async function buildSchoolOrganization({ name }) {
  logInfoWithCorrelationIds(`Create organization with name: ${name}`);
  const savedOrganization = await organizationRepository.create(
    new Organization({ name, type: Organization.types.SCO1D, isManagingStudents: true }),
  );

  logInfoWithCorrelationIds(`Add link with Missions feature`);
  const { id: featureId } = await knex('features')
    .select('id')
    .where({ key: ORGANIZATION_FEATURE.MISSIONS_MANAGEMENT.key })
    .first();
  await knex('organization-features').insert({ organizationId: savedOrganization.id, featureId }).onConflict().ignore();

  logInfoWithCorrelationIds(`Create school related to organization with id: ${savedOrganization.id}`);
  const code = await codeGenerator.generate(schoolRepository);
  await schoolRepository.save({ organizationId: savedOrganization.id, code });
  logInfoWithCorrelationIds(`School created with code: ${code}`);
  return savedOrganization;
}

async function buildLearners({ organizationId, quantity = STUDENT_NAMES.length }) {
  if (quantity > STUDENT_NAMES.length) {
    quantity = STUDENT_NAMES.length;
  }
  logInfoWithCorrelationIds('Create learners for organization.');
  await bluebird.map(STUDENT_NAMES.slice(0, quantity), async (studentName) => {
    await knex('organization-learners').insert({
      organizationId,
      firstName: studentName.firstName,
      lastName: studentName.lastName,
      attributes: { 'Libellé classe': 'CM2' },
    });
  });
  logInfoWithCorrelationIds(`${quantity} learners created.`);
}

async function showSchools() {
  const schools = await knex('schools')
    .select('code', 'organizationId', 'name')
    .innerJoin('organizations', 'organizations.id', 'organizationId')
    .where({ type: Organization.types.SCO1D })
    .returning('*');

  logInfoWithCorrelationIds('code | organizationId | name');
  schools.forEach((school) => logInfoWithCorrelationIds(`${school.code} | ${school.organizationId} | ${school.name}`));
}

function _validateArgs({ generate, name, quantity }) {
  if (generate && !name) {
    throw new Error('Name argument should be given to generate school.');
  }
  return { generate, name, quantity };
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main() {
  const commandLineArgs = yargs(hideBin(process.argv))
    .option('generate', {
      description: 'Creates a school with 35 learners in the database.',
    })
    .option('name', {
      description: 'Name of the school to create.',
      type: 'string',
    })
    .option('quantity', {
      description: 'Quantity of learners to create.',
      type: 'number',
    })
    .help().argv;
  const { generate, name, quantity } = _validateArgs(commandLineArgs);
  if (generate) {
    const organization = await buildSchoolOrganization({ name });
    await buildLearners({ organizationId: organization.id, quantity });
  } else {
    await showSchools();
  }
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      logErrorWithCorrelationIds('\x1b[31mErreur : %s\x1b[0m', error.message);
      process.exitCode = 1;
    } finally {
      disconnect();
    }
  }
})();

export { buildLearners, buildSchoolOrganization, showSchools };
