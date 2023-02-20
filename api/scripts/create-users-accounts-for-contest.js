import { parseCsvWithHeader } from './helpers/csvHelpers';
import bluebird from 'bluebird';
import userToCreateRepository from '../lib/infrastructure/repositories/user-to-create-repository';
import authenticationMethodRepository from '../lib/infrastructure/repositories/authentication-method-repository';
import userService from '../lib/domain/services/user-service';
import encryptionService from '../lib/domain/services/encryption-service';
import { disconnect } from '../db/knex-database-connection';

function prepareDataForInsert(rawUsers) {
  return rawUsers.map(({ firstName, lastName, email, password }) => {
    return {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
    };
  });
}

async function createUsers({ usersInRaw }) {
  const now = new Date();
  await bluebird.mapSeries(usersInRaw, async (userDTO) => {
    const userToCreate = {
      firstName: userDTO.firstName,
      lastName: userDTO.lastName,
      email: userDTO.email,
      createAt: now,
      updatedAt: now,
      cgu: true,
      lang: 'fr',
    };
    const hashedPassword = await encryptionService.hashPassword(userDTO.password);

    await userService.createUserWithPassword({
      user: userToCreate,
      hashedPassword,
      userToCreateRepository,
      authenticationMethodRepository,
    });
  });
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  console.log('Starting creating users accounts for contest.');

  const filePath = process.argv[2];

  console.log('Reading and parsing csv data file... ');
  const csvData = await parseCsvWithHeader(filePath);
  console.log('ok');

  console.log('Preparing data... ');
  const usersInRaw = prepareDataForInsert(csvData);
  console.log('ok');

  console.log('Creating users...');
  await createUsers({ usersInRaw });
  console.log('\nDone.');
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export default {
  prepareDataForInsert,
  createUsers,
};
