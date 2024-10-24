/* eslint-disable no-console */

import * as url from 'node:url';

import { disconnect } from '../../../db/knex-database-connection.js';
import { parseCsvWithHeader } from '../../../scripts/helpers/csvHelpers.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';
import { cryptoService } from '../../shared/domain/services/crypto-service.js';
import * as userService from '../../shared/domain/services/user-service.js';
import * as authenticationMethodRepository from '../infrastructure/repositories/authentication-method.repository.js';
import { userToCreateRepository } from '../infrastructure/repositories/user-to-create.repository.js';

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
  await DomainTransaction.execute(async () => {
    const now = new Date();

    for (const userDTO of usersInRaw) {
      const userToCreate = {
        firstName: userDTO.firstName,
        lastName: userDTO.lastName,
        email: userDTO.email,
        createAt: now,
        updatedAt: now,
        cgu: true,
        lang: 'fr',
      };
      const hashedPassword = await cryptoService.hashPassword(userDTO.password);

      await userService.createUserWithPassword({
        user: userToCreate,
        hashedPassword,
        userToCreateRepository,
        authenticationMethodRepository,
      });
    }
  });
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

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

/* eslint-enable no-console */

export { createUsers, prepareDataForInsert };
