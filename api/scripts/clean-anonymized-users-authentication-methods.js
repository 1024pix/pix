'use strict';
import dotenv from 'dotenv';

dotenv.config();

import _ from 'lodash';
import bluebird from 'bluebird';
import { disconnect } from '../db/knex-database-connection.js';
import { parseCsvWithHeader } from './helpers/csvHelpers.js';
import * as authenticationMethodRepository from '../lib/infrastructure/repositories/authentication-method-repository.js';
import * as url from 'url';

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function cleanAnonymizedAuthenticationMethods({ arrayOfAnonymizedUsersIds }) {
  const anonymizedUserIdsWithAuthenticationMethodsDeleted = [];
  await bluebird.mapSeries(arrayOfAnonymizedUsersIds, async (userId) => {
    const numberOfRowDeleted = await authenticationMethodRepository.removeAllAuthenticationMethodsByUserId({
      userId,
    });
    if (numberOfRowDeleted > 0) {
      anonymizedUserIdsWithAuthenticationMethodsDeleted.push(userId);
    }
  });
  return anonymizedUserIdsWithAuthenticationMethodsDeleted;
}

async function main() {
  console.log('Starting deleting anonymized users authentication methods');

  const filePath = process.argv[2];

  const anonymizedUsersIds = await parseCsvWithHeader(filePath);
  const arrayOfAnonymizedUsersIds = _(anonymizedUsersIds)
    .map((user) => user.ID)
    .filter((userId) => !_.isNil(userId))
    .value();

  if (arrayOfAnonymizedUsersIds.length < 1) {
    throw new Error('ID column must be present in CSV');
  }
  const anonymizedUserIdsWithAllAuthenticationMethodsDeleted = await cleanAnonymizedAuthenticationMethods({
    arrayOfAnonymizedUsersIds,
  });

  console.log(
    "\nDone. Here the list of user's id which authentication methods were deleted : ",
    anonymizedUserIdsWithAllAuthenticationMethodsDeleted
  );
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

export { cleanAnonymizedAuthenticationMethods };
