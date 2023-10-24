import { disconnect, knex } from '../../../db/knex-database-connection.js';

import { Organization } from '../../../lib/domain/models/Organization.js';
import * as codeGenerator from '../../../lib/domain/services/code-generator.js';
import * as organizationRepository from '../../../lib/infrastructure/repositories/organization-repository.js';
import * as schoolRepository from '../../../src/school/infrastructure/repositories/school-repository.js';
import { logger } from '../../shared/infrastructure/utils/logger.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import bluebird from 'bluebird';

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
  const savedOrganization = await organizationRepository.create(
    new Organization({ name, type: Organization.types.SCO1D, isManagingStudents: true }),
  );
  const code = await codeGenerator.generate(schoolRepository);
  await schoolRepository.save({ organizationId: savedOrganization.id, code });
  logger.info(`le code de l'organisation est: ${code}`);
  return savedOrganization;
}

async function buildLearners({ organizationId }) {
  await bluebird.map(STUDENT_NAMES, async (studentName) => {
    await knex('organization-learners').insert({
      organizationId,
      firstName: studentName.firstName,
      lastName: studentName.lastName,
      division: 'CM2',
    });
  });
}

async function showSchools() {
  const schools = await knex('schools')
    .select('code', 'organizationId', 'name')
    .innerJoin('organizations', 'organizations.id', 'organizationId')
    .where({ type: Organization.types.SCO1D })
    .returning('*');

  logger.info('code | organizationId | name');
  schools.forEach((school) => logger.info(`${school.code} | ${school.organizationId} | ${school.name}`));

  return schools;
}

function _validateArgs({ generate, name }) {
  if (generate && !name) {
    throw new Error('Name argument should be given to generate school.');
  }
  return { generate, name };
}

async function main() {
  const commandLineArgs = yargs(hideBin(process.argv))
    .option('generate', {
      description: 'Creates a school with 35 learners in the database.',
    })
    .option('name', {
      description: 'Name of the school to create.',
      type: 'string',
    })
    .help().argv;
  const { generate, name } = _validateArgs(commandLineArgs);
  if (generate) {
    const organization = await buildSchoolOrganization({ name });
    return await buildLearners({ organizationId: organization.id });
  } else {
    await showSchools();
  }
}

(async () => {
  try {
    await main();
  } catch (error) {
    logger.error('\x1b[31mErreur : %s\x1b[0m', error.message);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
})();

export { buildSchoolOrganization, buildLearners, showSchools };
